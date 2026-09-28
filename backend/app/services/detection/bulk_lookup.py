from typing import List, Dict, Any, Optional
from collections import defaultdict
import numpy as np
from sqlalchemy.orm import Session
from app.config import settings
from app.models.employee import Employee
from app.models.access_log import AccessLog
from app.services.detection.base import BaseDetector

class BulkLookupDetector(BaseDetector):
    name: str = "BulkLookupDetector"
    signal_type: str = "BULK_LOOKUP"

    def detect(
        self,
        db: Session,
        account_id: Optional[str] = None,
        employee_id: Optional[str] = None,
        transaction_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        query = db.query(AccessLog)
        if employee_id:
            query = query.filter(AccessLog.employee_id == employee_id)
        if account_id:
            query = query.filter(AccessLog.account_id == account_id)

        logs = query.all()
        if not logs:
            return []

        # Group by employee and day
        emp_day_accounts = defaultdict(lambda: defaultdict(set))
        emp_day_log_ids = defaultdict(lambda: defaultdict(list))

        for log in logs:
            day_str = log.timestamp.strftime("%Y-%m-%d")
            emp_day_accounts[log.employee_id][day_str].add(log.account_id)
            emp_day_log_ids[log.employee_id][day_str].append(log.id)

        # Calculate peer baseline (daily unique accounts accessed by employees)
        daily_counts_all = []
        for emp, days in emp_day_accounts.items():
            for day, accs in days.items():
                daily_counts_all.append(len(accs))

        if not daily_counts_all:
            return []

        peer_median = float(np.median(daily_counts_all))
        peer_p90 = float(np.percentile(daily_counts_all, 90))
        baseline = max(peer_median, 5.0)

        deviation_factor = settings.BULK_LOOKUP_DEVIATION_FACTOR
        min_threshold = settings.BULK_LOOKUP_MIN_THRESHOLD

        signals = []
        for emp, days in emp_day_accounts.items():
            for day, accs in days.items():
                count = len(accs)
                # Check anomaly: count > peer_median * factor and count >= min_threshold
                if count >= min_threshold and (count >= baseline * deviation_factor or count > peer_p90 * 1.8):
                    sample_log_ids = emp_day_log_ids[emp][day][:5]
                    evidence = [
                        {
                            "record_type": "access_log",
                            "record_id": lid,
                            "field": "bulk_access_sample",
                            "value": f"Accessed on {day}",
                            "details": {
                                "date": day,
                                "unique_accounts_accessed": count,
                                "peer_median": round(peer_median, 1),
                                "peer_p90": round(peer_p90, 1),
                                "deviation_ratio": round(count / baseline, 2)
                            }
                        }
                        for lid in sample_log_ids
                    ]

                    entities = [
                        {"type": "employee", "id": emp}
                    ] + [{"type": "account", "id": a} for a in list(accs)[:5]]

                    explanation = (
                        f"Employee {emp} performed an anomalous volume of account lookups on {day}: "
                        f"accessed {count} unique accounts (peer median: {peer_median:.1f}, "
                        f"p90: {peer_p90:.1f}, deviation: {count / baseline:.1f}x baseline), "
                        f"suggesting systematic data harvesting or snooping."
                    )

                    sig = self.build_signal(
                        severity="CRITICAL" if count > baseline * 4 else "HIGH",
                        confidence=0.91,
                        entities=entities,
                        evidence=evidence,
                        explanation=explanation
                    )
                    signals.append(sig)

        return signals
