import random
from datetime import timedelta
from typing import Any

from sqlalchemy.orm import Session

from app.models.access_log import AccessLog
from app.models.account import Account
from app.models.account_change import AccountChange
from app.models.customer import Customer
from app.models.employee import Employee
from app.models.role import Role
from app.models.transaction import Transaction
from app.services.correlation.linker import CorrelationLinker
from app.services.detection.engine import DetectionEngine
from app.utils.ids import generate_id
from app.utils.time import utc_now


class RedTeamSimulator:
    def __init__(self):
        self.detection_engine = DetectionEngine()
        self.linker = CorrelationLinker()

    def simulate(self, db: Session, scenario_type: str, seed: int = 42, intensity: float = 1.0) -> dict[str, Any]:
        """
        Synthesizes fresh adversary scenarios on demand, injects records,
        runs live detection and correlation, and validates defense efficacy.
        """
        rng = random.Random(seed)
        scenario_id = generate_id(f"SIM-{scenario_type.upper()[:4]}")
        now = utc_now()

        generated_counts = {"customers": 0, "accounts": 0, "transactions": 0, "logs": 0, "changes": 0}
        expected_behavior = ""

        # Fetch or ensure at least one test employee and role
        role = db.query(Role).first()
        if not role:
            role = Role(id="ROLE-TELLER-TEST", name="Teller", permitted_actions=["VIEW", "EDIT"], privilege_level=1)
            db.add(role)
            db.commit()

        emp = db.query(Employee).first()
        if not emp:
            emp = Employee(
                id=f"EMP-SIM-{rng.randint(100, 999)}",
                pseudonym_id=f"P-EMP-SIM-{rng.randint(100, 999)}",
                role_id=role.id,
                branch_id="BR-01",
                normal_work_start="09:00",
                normal_work_end="18:00",
            )
            db.add(emp)
            db.commit()

        if scenario_type == "circular":
            # Generate 3-hop or 4-hop circular transfer ring
            expected_behavior = "Should trigger CIRCULAR_TRANSFER signal and HIGH/CRITICAL alert"
            ring_size = 3
            cust = Customer(id=generate_id("CUST"), pseudonym_id=generate_id("P-CUST"), declared_income_max=50000.0)
            db.add(cust)
            generated_counts["customers"] += 1

            sim_accs = []
            for _ in range(ring_size):
                acc = Account(id=generate_id("ACC"), customer_id=cust.id, branch_id="BR-01")
                db.add(acc)
                sim_accs.append(acc)
                generated_counts["accounts"] += 1
            db.commit()

            base_amt = 75000.0 * intensity
            t_curr = now - timedelta(hours=4)
            for i in range(ring_size):
                u = sim_accs[i].id
                v = sim_accs[(i + 1) % ring_size].id
                tx = Transaction(
                    id=generate_id("TX"),
                    from_account_id=u,
                    to_account_id=v,
                    amount=base_amt * (1.0 - (i * 0.02)),  # slight attrition
                    timestamp=t_curr,
                    channel="UPI",
                    status="COMPLETED",
                )
                db.add(tx)
                generated_counts["transactions"] += 1
                t_curr += timedelta(minutes=25)
            db.commit()

        elif scenario_type == "structuring":
            expected_behavior = "Should trigger STRUCTURING signal due to multiple sub-threshold transfers"
            cust = Customer(id=generate_id("CUST"), pseudonym_id=generate_id("P-CUST"), declared_income_max=40000.0)
            src_acc = Account(id=generate_id("ACC"), customer_id=cust.id, branch_id="BR-01")
            dest_acc = Account(id=generate_id("ACC"), customer_id=cust.id, branch_id="BR-01")
            db.add_all([cust, src_acc, dest_acc])
            db.commit()
            generated_counts["customers"] += 1
            generated_counts["accounts"] += 2

            t_curr = now - timedelta(hours=3)
            # Structuring threshold is 50,000; create 3 transactions just below
            for split_amt in [48000.0 * intensity, 49000.0 * intensity, 47500.0 * intensity]:
                tx = Transaction(
                    id=generate_id("TX"),
                    from_account_id=src_acc.id,
                    to_account_id=dest_acc.id,
                    amount=split_amt,
                    timestamp=t_curr,
                    channel="IMPS",
                    status="COMPLETED",
                )
                db.add(tx)
                generated_counts["transactions"] += 1
                t_curr += timedelta(minutes=15)
            db.commit()

        elif scenario_type in ("insider_collusion", "hybrid"):
            expected_behavior = "Should trigger OUT_OF_ROLE_ACCESS + ACTION_TRANSACTION_LINK + CRITICAL alert"
            cust = Customer(id=generate_id("CUST"), pseudonym_id=generate_id("P-CUST"), declared_income_max=35000.0)
            target_acc = Account(id=generate_id("ACC"), customer_id=cust.id, branch_id="BR-02")
            beneficiary_acc = Account(id=generate_id("ACC"), customer_id=cust.id, branch_id="BR-01")
            db.add_all([cust, target_acc, beneficiary_acc])
            db.commit()
            generated_counts["customers"] += 1
            generated_counts["accounts"] += 2

            # Unauthorized limit change
            t_action = now - timedelta(hours=2)
            log = AccessLog(
                id=generate_id("LOG"),
                employee_id=emp.id,
                account_id=target_acc.id,
                action="OVERRIDE",
                timestamp=t_action,
            )
            chg = AccountChange(
                id=generate_id("CHG"),
                account_id=target_acc.id,
                employee_id=emp.id,
                field="daily_limit",
                timestamp=t_action + timedelta(minutes=3),
                reason="Unverified limit boost",
            )
            db.add_all([log, chg])
            generated_counts["logs"] += 1
            generated_counts["changes"] += 1

            # Followed by rapid large outflow
            tx1 = Transaction(
                id=generate_id("TX"),
                from_account_id=target_acc.id,
                to_account_id=beneficiary_acc.id,
                amount=250000.0 * intensity,
                timestamp=t_action + timedelta(minutes=20),
                channel="NEFT",
                status="COMPLETED",
            )
            db.add(tx1)
            generated_counts["transactions"] += 1
            db.commit()

        else:  # pass_through or profile_mismatch
            expected_behavior = "Should detect mule pass-through velocity"
            cust = Customer(id=generate_id("CUST"), pseudonym_id=generate_id("P-CUST"), declared_income_max=20000.0)
            a1 = Account(id=generate_id("ACC"), customer_id=cust.id, branch_id="BR-01")
            a2 = Account(id=generate_id("ACC"), customer_id=cust.id, branch_id="BR-01")
            a3 = Account(id=generate_id("ACC"), customer_id=cust.id, branch_id="BR-01")
            db.add_all([cust, a1, a2, a3])
            db.commit()
            generated_counts["customers"] += 1
            generated_counts["accounts"] += 3

            t_in = now - timedelta(hours=2)
            amt = 90000.0 * intensity
            tx_in = Transaction(
                id=generate_id("TX"),
                from_account_id=a1.id,
                to_account_id=a2.id,
                amount=amt,
                timestamp=t_in,
                channel="UPI",
                status="COMPLETED",
            )
            tx_out = Transaction(
                id=generate_id("TX"),
                from_account_id=a2.id,
                to_account_id=a3.id,
                amount=amt * 0.95,
                timestamp=t_in + timedelta(minutes=45),
                channel="UPI",
                status="COMPLETED",
            )
            db.add_all([tx_in, tx_out])
            generated_counts["transactions"] += 2
            db.commit()

        # Run live detection over newly injected records
        det_res = self.detection_engine.run_all(db=db, persist=True)
        new_alerts = self.linker.correlate_and_generate_alerts(db=db, signals=det_res["signals"])

        matched_expected = len(det_res["signals"]) > 0

        return {
            "scenario_id": scenario_id,
            "scenario_type": scenario_type,
            "expected_behaviour": expected_behavior,
            "generated_records_count": generated_counts,
            "generated_records_summary": [
                {
                    "description": f"Injected {generated_counts['accounts']} accounts and {generated_counts['transactions']} transactions for {scenario_type} simulation."
                }
            ],
            "detected_signals": [
                {"signal_id": s["signal_id"], "signal_type": s["signal_type"], "severity": s["severity"]}
                for s in det_res["signals"]
            ],
            "detected_alerts": [{"alert_id": a.id, "tier": a.tier, "title": a.title} for a in new_alerts],
            "matched_expected": matched_expected,
            "summary": f"Red-team simulation '{scenario_type}' executed successfully with intensity {intensity}. Generated {det_res['total_signals']} signals and {len(new_alerts)} alerts.",
        }
