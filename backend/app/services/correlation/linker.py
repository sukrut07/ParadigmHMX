from typing import List, Dict, Any, Set
from collections import defaultdict
import hashlib
from sqlalchemy.orm import Session
from app.models.signal import Signal
from app.models.alert import Alert
from app.utils.ids import generate_id
from app.utils.time import utc_now
from app.services.correlation.tier_engine import TierEngine
from app.services.correlation.rule_trace import build_rule_trace
from app.services.correlation.counterfactual import CounterfactualEngine
from app.services.graph.builder import GraphBuilder
from app.services.timeline.builder import TimelineBuilder
from app.services.detection.validator import validate_alert

class CorrelationLinker:
    def __init__(self):
        self.tier_engine = TierEngine()
        self.counterfactual_engine = CounterfactualEngine(self.tier_engine)
        self.graph_builder = GraphBuilder()
        self.timeline_builder = TimelineBuilder()

    def correlate_and_generate_alerts(self, db: Session, signals: List[Dict[str, Any]]) -> List[Alert]:
        """
        Clusters signals across entity and causal linkages, evaluates risk tiers,
        builds rule traces and counterfactual explanations, and persists alerts.
        """
        if not signals:
            return []

        # 1. Build adjacency / linkage between signals sharing entities
        # Map entity -> signal indices
        entity_to_signals = defaultdict(set)
        for idx, sig in enumerate(signals):
            for ent in sig.get("entities", []):
                ent_key = f"{ent['type']}:{ent['id']}"
                entity_to_signals[ent_key].add(idx)

        # Graph of signal indices connected by shared entities
        adj = defaultdict(set)
        for ent_key, sig_indices in entity_to_signals.items():
            sig_list = list(sig_indices)
            for i in range(len(sig_list)):
                for j in range(i + 1, len(sig_list)):
                    adj[sig_list[i]].add(sig_list[j])
                    adj[sig_list[j]].add(sig_list[i])

        # Find connected components (clusters)
        visited = set()
        clusters = []

        for i in range(len(signals)):
            if i in visited:
                continue
            component = []
            queue = [i]
            visited.add(i)
            while queue:
                curr = queue.pop(0)
                component.append(curr)
                for neighbor in adj[curr]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)
            clusters.append([signals[idx] for idx in component])

        alerts_created = []

        for cluster_signals in clusters:
            # Extract entities
            accounts = set()
            employees = set()
            all_entities = set()
            all_entity_ids = []

            for s in cluster_signals:
                for ent in s.get("entities", []):
                    all_entities.add(ent["id"])
                    all_entity_ids.append(f"{ent['type']}:{ent['id']}")
                    if ent["type"] == "account":
                        accounts.add(ent["id"])
                    elif ent["type"] == "employee":
                        employees.add(ent["id"])

            linked_entities_list = sorted(list(all_entities))

            # 2. Evaluate Tier and matched rules
            tier, matched_rules = self.tier_engine.evaluate_tier(cluster_signals, linked_entities_list)

            # 3. Rule Trace
            rule_trace = build_rule_trace(
                tier=tier,
                matched_rules=matched_rules,
                signals=cluster_signals,
                accounts=sorted(list(accounts)),
                employees=sorted(list(employees))
            )

            # 4. Counterfactual explanation
            counterfactual = self.counterfactual_engine.generate_counterfactual(
                original_tier=tier,
                signals=cluster_signals,
                linked_entities=linked_entities_list
            )

            # 5. Graph and Timeline snapshots
            graph_snapshot = self.graph_builder.build_network(db, focus_entity_ids=all_entities, max_depth=1)
            timeline_snapshot = self.timeline_builder.build_timeline(db, entity_ids=all_entities, limit=20)

            # 6. Merge Evidence
            merged_evidence = []
            seen_evidence_keys = set()
            merged_record_ids = set()

            for s in cluster_signals:
                for ev in s.get("evidence", []):
                    ev_key = (ev.get("record_type"), ev.get("record_id"), ev.get("field"))
                    if ev_key not in seen_evidence_keys:
                        seen_evidence_keys.add(ev_key)
                        merged_evidence.append(ev)
                for rid in s.get("evidence_record_ids", []):
                    merged_record_ids.add(rid)

            signal_ids = [s["signal_id"] for s in cluster_signals]

            # Title and summary
            primary_sig_type = cluster_signals[0]["signal_type"].replace("_", " ").title()
            if employees and accounts:
                title = f"{tier}: Insider Linked Risk — Employee {list(employees)[0]} & Account {list(accounts)[0]}"
            elif accounts:
                title = f"{tier}: Financial Anomaly ({primary_sig_type}) on Account {list(accounts)[0]}"
            elif employees:
                title = f"{tier}: Insider Policy Anomaly — Employee {list(employees)[0]}"
            else:
                title = f"{tier}: Suspicious Cluster ({primary_sig_type})"

            summary = rule_trace["human_explanation"]

            # Deduplication hash
            dedup_string = f"{','.join(sorted(signal_ids))}:{','.join(sorted(linked_entities_list))}"
            dedup_hash = hashlib.sha256(dedup_string.encode("utf-8")).hexdigest()

            existing_alert = db.query(Alert).filter(Alert.dedup_hash == dedup_hash).first()
            if existing_alert:
                existing_alert.tier = tier
                existing_alert.title = title
                existing_alert.summary = summary
                existing_alert.rule_trace = rule_trace
                existing_alert.counterfactual = counterfactual
                existing_alert.evidence = merged_evidence
                existing_alert.evidence_record_ids = sorted(list(merged_record_ids))
                existing_alert.graph_snapshot = graph_snapshot
                existing_alert.timeline_snapshot = timeline_snapshot
                alerts_created.append(existing_alert)
                continue

            alert_dict = {
                "id": generate_id("ALERT"),
                "tier": tier,
                "title": title,
                "summary": summary,
                "signal_ids": signal_ids,
                "entity_ids": linked_entities_list,
                "evidence": merged_evidence,
                "evidence_record_ids": sorted(list(merged_record_ids)),
                "rule_trace": rule_trace,
                "counterfactual": counterfactual,
                "graph_snapshot": graph_snapshot,
                "timeline_snapshot": timeline_snapshot,
                "status": "OPEN",
                "dedup_hash": dedup_hash,
                "created_at": utc_now(),
                "updated_at": utc_now()
            }

            # Mandatory validation!
            validate_alert(alert_dict)

            new_alert = Alert(**alert_dict)
            db.add(new_alert)
            alerts_created.append(new_alert)

        db.commit()
        return alerts_created
