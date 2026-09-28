from typing import Dict, Any
from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.models.account import Account
from app.models.access_log import AccessLog
from app.models.account_change import AccountChange
from app.models.transaction import Transaction
from app.models.alert import Alert
from app.services.timeline.builder import TimelineBuilder

class BlastRadiusAnalyzer:
    def __init__(self):
        self.timeline_builder = TimelineBuilder()

    def analyze_employee(self, db: Session, employee_id: str) -> Dict[str, Any]:
        """
        Computes the complete blast radius of an employee across accounts, customers, devices,
        downstream financial transactions, linked alerts, and chronological footprint.
        """
        emp = db.query(Employee).filter(Employee.id == employee_id).first()
        if not emp:
            raise ValueError(f"Employee '{employee_id}' not found.")

        # 1. AccessLogs & AccountChanges
        logs = db.query(AccessLog).filter(AccessLog.employee_id == employee_id).all()
        changes = db.query(AccountChange).filter(AccountChange.employee_id == employee_id).all()

        accounts_touched: set[str] = set()
        devices_used: set[str] = set()
        actions_performed = defaultdict(int)

        for l in logs:
            accounts_touched.add(l.account_id)
            if l.device_id:
                devices_used.add(l.device_id)
            actions_performed[l.action] += 1

        for c in changes:
            accounts_touched.add(c.account_id)
            actions_performed[f"EDIT_{c.field}"] += 1

        # 2. Customers touched
        customers_touched = set()
        if accounts_touched:
            acc_objs = db.query(Account).filter(Account.id.in_(accounts_touched)).all()
            for a in acc_objs:
                if a.customer_id:
                    customers_touched.add(a.customer_id)

        # 3. Subsequent transactions from touched accounts
        downstream_txs = []
        if accounts_touched:
            txs = db.query(Transaction).filter(
                Transaction.from_account_id.in_(accounts_touched),
                Transaction.status == "COMPLETED"
            ).order_by(Transaction.timestamp.desc()).limit(20).all()

            for t in txs:
                downstream_txs.append({
                    "transaction_id": t.id,
                    "from_account": t.from_account_id,
                    "to_account": t.to_account_id,
                    "amount": t.amount,
                    "channel": t.channel,
                    "timestamp": t.timestamp.isoformat()
                })

        # 4. Alerts involving employee or touched accounts
        all_touchpoints: set[str] = set(accounts_touched)
        all_touchpoints.add(employee_id)
        
        alerts_involved = []
        suspicious_accounts = set()
        highest_severity = "LOW"
        severity_rank = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}

        all_alerts = db.query(Alert).all()
        for al in all_alerts:
            ent_list = [str(x) for x in (al.entity_ids or [])]
            overlap = set(ent_list).intersection(all_touchpoints)
            if overlap:
                alerts_involved.append(str(al.id))
                for ent in overlap:
                    if ent.startswith("ACC-"):
                        suspicious_accounts.add(ent)
                tier_str = str(al.tier)
                if severity_rank.get(tier_str, 0) > severity_rank.get(highest_severity, 0):
                    highest_severity = tier_str

        # 5. Timeline
        timeline_events = self.timeline_builder.build_timeline(
            db=db,
            entity_ids=all_touchpoints,
            limit=40
        )

        role_name = emp.role.name if emp.role else "Unknown"
        total_actions = sum(actions_performed.values())

        # Clusters
        risk_clusters = []
        if suspicious_accounts:
            risk_clusters.append({
                "cluster_name": f"Suspicious Activity Cluster ({len(suspicious_accounts)} accounts)",
                "accounts": list(suspicious_accounts),
                "alerts": alerts_involved
            })

        return {
            "employee": {
                "id": emp.id,
                "pseudonym_id": emp.pseudonym_id,
                "role_id": emp.role_id,
                "branch_id": emp.branch_id,
                "normal_work_start": emp.normal_work_start,
                "normal_work_end": emp.normal_work_end,
                "status": emp.status
            },
            "role_name": role_name,
            "accounts_touched": sorted(list(accounts_touched)),
            "customers_touched": sorted(list(customers_touched)),
            "devices_used": sorted(list(devices_used)),
            "actions_performed": dict(actions_performed),
            "transactions_following_actions": downstream_txs,
            "alerts_involved": alerts_involved,
            "suspicious_accounts": sorted(list(suspicious_accounts)),
            "risk_clusters": risk_clusters,
            "timeline": timeline_events,
            "total_actions_count": total_actions,
            "risk_level": highest_severity
        }
