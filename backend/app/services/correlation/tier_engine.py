from typing import Any

from app.config import load_risk_rules

INSIDER_SIGNAL_TYPES = {
    "OUT_OF_ROLE_ACCESS",
    "OFF_HOURS_ACCESS",
    "BULK_LOOKUP",
    "PRIVILEGE_ABUSE",
    "ACTION_TRANSACTION_LINK",
}
FINANCIAL_SIGNAL_TYPES = {"CIRCULAR_TRANSFER", "STRUCTURING", "RAPID_PASSTHROUGH", "PROFILE_MISMATCH"}


class TierEngine:
    def __init__(self):
        self.rules_config = load_risk_rules()

    def evaluate_tier(
        self, signals: list[dict[str, Any]], linked_entities: list[str]
    ) -> tuple[str, list[dict[str, Any]]]:
        """
        Deterministically evaluates risk tier (CRITICAL, HIGH, MEDIUM, LOW)
        based on signals, cross-domain linkages, and matched rules.
        Returns (tier, list_of_matched_rules).
        """
        signal_types = {s["signal_type"] for s in signals}
        severities = [s["severity"] for s in signals]
        confidences = [s.get("confidence", 1.0) for s in signals]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

        has_insider = any(st in INSIDER_SIGNAL_TYPES for st in signal_types)
        has_financial = any(st in FINANCIAL_SIGNAL_TYPES for st in signal_types)
        is_cross_domain_linked = has_insider and has_financial

        accounts_involved = set()
        employees_involved = set()
        for s in signals:
            for ent in s.get("entities", []):
                if ent["type"] == "account":
                    accounts_involved.add(ent["id"])
                elif ent["type"] == "employee":
                    employees_involved.add(ent["id"])

        matched_rules = []

        # 1. Check CRITICAL conditions
        # Condition A: Insider linked + Circular transfer
        if is_cross_domain_linked and "CIRCULAR_TRANSFER" in signal_types:
            matched_rules.append(
                {
                    "rule": "CRIT_INSIDER_LINK_CIRCULAR",
                    "name": "Insider Action Linked to Circular Transfer Ring",
                    "matched": True,
                    "signals": [
                        s["signal_id"]
                        for s in signals
                        if s["signal_type"]
                        in ("CIRCULAR_TRANSFER", "ACTION_TRANSACTION_LINK", "OUT_OF_ROLE_ACCESS", "PRIVILEGE_ABUSE")
                    ],
                    "entities": list(employees_involved.union(accounts_involved)),
                    "description": "Critical linked risk: An insider intervention was followed by circular fund movement.",
                }
            )
            return "CRITICAL", matched_rules

        # Condition B: Insider linked + Multiple accounts
        if is_cross_domain_linked and len(accounts_involved) >= 2:
            matched_rules.append(
                {
                    "rule": "CRIT_INSIDER_MULTI_ACCOUNT",
                    "name": "Insider Action Linked Across Multiple Accounts",
                    "matched": True,
                    "signals": [s["signal_id"] for s in signals],
                    "entities": list(employees_involved.union(accounts_involved)),
                    "description": f"Critical insider collusion spreading across {len(accounts_involved)} accounts.",
                }
            )
            return "CRITICAL", matched_rules

        # Condition C: Repeated linked insider + financial anomaly (3+ signals)
        if is_cross_domain_linked and len(signals) >= 3:
            matched_rules.append(
                {
                    "rule": "CRIT_REPEATED_INSIDER_FINANCIAL",
                    "name": "Repeated Linked Insider-Financial Anomalies",
                    "matched": True,
                    "signals": [s["signal_id"] for s in signals],
                    "entities": list(employees_involved.union(accounts_involved)),
                    "description": "Multi-signal linked attack pattern combining insider manipulation with financial crime.",
                }
            )
            return "CRITICAL", matched_rules

        # 2. Check HIGH conditions
        # Condition A: Any insider-financial direct link (e.g. action_transaction link or co-occurring insider + structuring/mule)
        if is_cross_domain_linked or "ACTION_TRANSACTION_LINK" in signal_types:
            matched_rules.append(
                {
                    "rule": "HIGH_ACTION_TRANSACTION_LINK",
                    "name": "Employee Action Linked to Financial Crime",
                    "matched": True,
                    "signals": [s["signal_id"] for s in signals],
                    "entities": list(employees_involved.union(accounts_involved)),
                    "description": "High tier alert: Insider access/change linked directly to subsequent financial anomaly.",
                }
            )
            return "HIGH", matched_rules

        # Condition B: Severe Structuring Ring or Circular ring with high confidence
        if "CIRCULAR_TRANSFER" in signal_types or ("STRUCTURING" in signal_types and avg_confidence >= 0.85):
            matched_rules.append(
                {
                    "rule": "HIGH_SEVERE_FINANCIAL_RING",
                    "name": "High Severity Financial Flow Ring / Structuring",
                    "matched": True,
                    "signals": [s["signal_id"] for s in signals],
                    "entities": list(accounts_involved),
                    "description": "Severe financial crime pattern with high certainty.",
                }
            )
            return "HIGH", matched_rules

        # Condition C: Critical privilege override abuse
        if "PRIVILEGE_ABUSE" in signal_types and any(sev in ("CRITICAL", "HIGH") for sev in severities):
            matched_rules.append(
                {
                    "rule": "HIGH_PRIVILEGE_OVERRIDE_ABUSE",
                    "name": "Severe Privilege Override Abuse",
                    "matched": True,
                    "signals": [s["signal_id"] for s in signals],
                    "entities": list(employees_involved),
                    "description": "Repeated unauthorized administrative overrides without dual control.",
                }
            )
            return "HIGH", matched_rules

        # 3. Check MEDIUM conditions
        financial_count = sum(1 for s in signals if s["signal_type"] in FINANCIAL_SIGNAL_TYPES)
        if financial_count >= 2:
            matched_rules.append(
                {
                    "rule": "MED_MULTIPLE_FINANCIAL",
                    "name": "Multiple Independent Financial Signals",
                    "matched": True,
                    "signals": [s["signal_id"] for s in signals if s["signal_type"] in FINANCIAL_SIGNAL_TYPES],
                    "entities": list(accounts_involved),
                    "description": "Two or more concurrent financial anomalies on the account.",
                }
            )
            return "MEDIUM", matched_rules

        if financial_count == 1:
            matched_rules.append(
                {
                    "rule": "MED_STRONG_FINANCIAL",
                    "name": "Isolated Financial Crime Signal",
                    "matched": True,
                    "signals": [s["signal_id"] for s in signals if s["signal_type"] in FINANCIAL_SIGNAL_TYPES],
                    "entities": list(accounts_involved),
                    "description": "Single financial anomaly (pass-through / structuring / mismatch) without detected insider link.",
                }
            )
            return "MEDIUM", matched_rules

        # Isolated insider anomaly without financial crime
        if has_insider and not has_financial:
            matched_rules.append(
                {
                    "rule": "MED_ISOLATED_INSIDER",
                    "name": "Isolated Insider Anomaly without Financial Crime",
                    "matched": True,
                    "signals": [s["signal_id"] for s in signals if s["signal_type"] in INSIDER_SIGNAL_TYPES],
                    "entities": list(employees_involved),
                    "description": "Employee policy violation or lookup anomaly without corresponding fraudulent fund movement.",
                }
            )
            return "MEDIUM", matched_rules

        # 4. Fallback: LOW
        matched_rules.append(
            {
                "rule": "LOW_SINGLE_SIGNAL",
                "name": "Single Weak or Uncorrelated Signal",
                "matched": True,
                "signals": [s["signal_id"] for s in signals],
                "entities": linked_entities,
                "description": "Isolated low-severity event.",
            }
        )
        return "LOW", matched_rules
