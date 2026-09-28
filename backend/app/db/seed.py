import random
from datetime import datetime, timedelta, timezone
from typing import Optional
from faker import Faker
import numpy as np
from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal, Base
from app.models.customer import Customer
from app.models.account import Account
from app.models.employee import Employee
from app.models.role import Role
from app.models.device import Device
from app.models.transaction import Transaction
from app.models.access_log import AccessLog
from app.models.account_change import AccountChange
from app.models.ground_truth import GroundTruth
from app.models.signal import Signal
from app.models.alert import Alert
from app.models.case import Case
from app.models.audit import AuditLog

def seed_demo_and_synthetic_dataset(
    db: Session,
    num_customers: int = 500,
    num_accounts: int = 600,
    num_employees: int = 30,
    num_transactions: int = 20000,
    num_events: int = 10000,
    seed: int = 42,
    reset_db: bool = True
):
    """
    Deterministically seeds the database with roles, branches, devices, employees,
    customers, accounts, normal baseline activity, hard negatives, and 4 specific demo scenarios.
    """
    bind = db.get_bind()
    if reset_db:
        Base.metadata.drop_all(bind=bind)
        Base.metadata.create_all(bind=bind)

    fake = Faker()
    Faker.seed(seed)
    random.seed(seed)
    np.random.seed(seed)

    base_date = datetime(2026, 9, 1, 0, 0, 0, tzinfo=timezone.utc)

    # 1. Seed Roles
    roles_data = [
        {"id": "ROLE-TELLER", "name": "Teller", "permitted_actions": ["VIEW", "CREATE"], "permitted_branches": ["BR-01", "BR-02", "BR-03", "BR-04"], "privilege_level": 1},
        {"id": "ROLE-RM", "name": "Relationship Manager", "permitted_actions": ["VIEW", "EDIT"], "permitted_branches": ["BR-01", "BR-02"], "privilege_level": 2},
        {"id": "ROLE-BM", "name": "Branch Manager", "permitted_actions": ["VIEW", "EDIT", "APPROVE", "OVERRIDE"], "permitted_branches": ["BR-01", "BR-02", "BR-03", "BR-04"], "privilege_level": 4},
        {"id": "ROLE-OPS", "name": "Operations Analyst", "permitted_actions": ["VIEW", "EXPORT"], "permitted_branches": ["*"], "privilege_level": 2},
        {"id": "ROLE-COMPL", "name": "Compliance Officer", "permitted_actions": ["VIEW", "EXPORT", "OVERRIDE"], "permitted_branches": ["*"], "privilege_level": 3},
        {"id": "ROLE-ADMIN", "name": "System Administrator", "permitted_actions": ["VIEW", "EDIT", "APPROVE", "OVERRIDE", "CREATE", "DELETE", "EXPORT"], "permitted_branches": ["*"], "privilege_level": 5},
    ]
    for r in roles_data:
        db.add(Role(**r))
    db.commit()

    branches = ["BR-01", "BR-02", "BR-03", "BR-04"]

    # 2. Seed Devices
    devices = []
    for i in range(1, 51):
        dev = Device(
            id=f"DEV-{i:03d}",
            pseudonym_id=f"P-DEV-{i:03d}",
            device_type=random.choice(["DESKTOP", "BRANCH_TERMINAL", "MOBILE", "ATM"]),
            branch_id=random.choice(branches),
            first_seen=base_date - timedelta(days=60),
            last_seen=base_date + timedelta(days=30)
        )
        devices.append(dev)
        db.add(dev)
    db.commit()

    # 3. Seed Employees
    emp_demo_17 = Employee(
        id="EMP-017",
        pseudonym_id="P-EMP-017",
        role_id="ROLE-TELLER",
        branch_id="BR-01",
        joined_at=base_date - timedelta(days=365),
        normal_work_start="09:00",
        normal_work_end="18:00",
        status="ACTIVE"
    )
    emp_demo_22 = Employee(
        id="EMP-022",
        pseudonym_id="P-EMP-022",
        role_id="ROLE-OPS",
        branch_id="BR-02",
        joined_at=base_date - timedelta(days=200),
        normal_work_start="09:00",
        normal_work_end="18:00",
        status="ACTIVE"
    )
    employees = [emp_demo_17, emp_demo_22]
    db.add_all([emp_demo_17, emp_demo_22])

    role_ids = [r["id"] for r in roles_data]
    for i in range(1, num_employees + 1):
        emp_id = f"EMP-{i:03d}"
        if emp_id in ("EMP-017", "EMP-022"):
            continue
        
        r_id = random.choice(role_ids)
        b_id = random.choice(branches)
        if random.random() < 0.10:
            start_h, end_h = "21:00", "06:00"
        else:
            start_h, end_h = "09:00", "18:00"

        emp = Employee(
            id=emp_id,
            pseudonym_id=f"P-{emp_id}",
            role_id=r_id,
            branch_id=b_id,
            joined_at=base_date - timedelta(days=random.randint(100, 1000)),
            normal_work_start=start_h,
            normal_work_end=end_h,
            status="ACTIVE"
        )
        employees.append(emp)
        db.add(emp)
    db.commit()

    # 4. Seed Customers
    income_bands = [
        ("10000-25000", 10000.0, 25000.0),
        ("25000-50000", 25000.0, 50000.0),
        ("50000-100000", 50000.0, 100000.0),
        ("100000-250000", 100000.0, 250000.0),
        ("250000-1000000", 250000.0, 1000000.0),
    ]
    occupations = ["Software Engineer", "Teacher", "Retail Shopkeeper", "Doctor", "Accountant", "Farmer", "Consultant", "Student"]

    customers = []
    for i in range(1, num_customers + 1):
        cust_id = f"CUST-{i:04d}"
        band, min_inc, max_inc = random.choice(income_bands)
        risk = "HIGH" if max_inc > 250000 and random.random() < 0.2 else ("MEDIUM" if random.random() < 0.3 else "LOW")

        cust = Customer(
            id=cust_id,
            pseudonym_id=f"P-{cust_id}",
            declared_occupation=random.choice(occupations),
            declared_income_band=band,
            declared_income_min=min_inc,
            declared_income_max=max_inc,
            kyc_status="VERIFIED",
            risk_profile=risk,
            created_at=base_date - timedelta(days=random.randint(60, 500))
        )
        customers.append(cust)
        db.add(cust)
    db.commit()

    # 5. Seed Accounts
    accounts = []
    # Dedicated Demo Accounts
    acc_demo_target = Account(
        id="ACC-0231",
        customer_id=customers[10].id,
        account_type="SAVINGS",
        branch_id="BR-01",
        opened_at=base_date - timedelta(days=200),
        status="ACTIVE",
        daily_limit=50000.0,
        currency="INR"
    )
    acc_demo_mule1 = Account(
        id="ACC-0442",
        customer_id=customers[11].id,
        account_type="SAVINGS",
        branch_id="BR-01",
        opened_at=base_date - timedelta(days=120),
        status="ACTIVE",
        daily_limit=500000.0,
        currency="INR"
    )
    acc_demo_mule2 = Account(
        id="ACC-0553",
        customer_id=customers[12].id,
        account_type="SAVINGS",
        branch_id="BR-02",
        opened_at=base_date - timedelta(days=90),
        status="ACTIVE",
        daily_limit=500000.0,
        currency="INR"
    )
    # Legitimate Payroll Account
    acc_payroll = Account(
        id="ACC-PAYROLL-01",
        customer_id=customers[0].id,
        account_type="PAYROLL",
        branch_id="BR-01",
        opened_at=base_date - timedelta(days=400),
        status="ACTIVE",
        daily_limit=5000000.0,
        currency="INR"
    )
    # Pure Financial Circular Accounts
    acc_circ1 = Account(id="ACC-8801", customer_id=customers[20].id, account_type="SAVINGS", branch_id="BR-03", daily_limit=500000.0)
    acc_circ2 = Account(id="ACC-8802", customer_id=customers[21].id, account_type="SAVINGS", branch_id="BR-03", daily_limit=500000.0)
    acc_circ3 = Account(id="ACC-8803", customer_id=customers[22].id, account_type="SAVINGS", branch_id="BR-03", daily_limit=500000.0)

    db.add_all([acc_demo_target, acc_demo_mule1, acc_demo_mule2, acc_payroll, acc_circ1, acc_circ2, acc_circ3])
    accounts.extend([acc_demo_target, acc_demo_mule1, acc_demo_mule2, acc_payroll, acc_circ1, acc_circ2, acc_circ3])

    reserved_acc_ids = {a.id for a in accounts}
    counter = 1
    while len(accounts) < num_accounts:
        candidate_id = f"ACC-{counter:04d}"
        counter += 1
        if candidate_id in reserved_acc_ids:
            continue
        acc = Account(
            id=candidate_id,
            customer_id=random.choice(customers).id,
            account_type=random.choice(["SAVINGS", "CURRENT"]),
            branch_id=random.choice(branches),
            opened_at=base_date - timedelta(days=random.randint(30, 400)),
            status="ACTIVE",
            daily_limit=float(random.choice([50000, 100000, 200000, 500000])),
            currency="INR"
        )
        reserved_acc_ids.add(candidate_id)
        accounts.append(acc)
        db.add(acc)
    db.commit()

    # 6. SEED DEMO SCENARIOS & GROUND TRUTH
    # -------------------------------------------------------------
    # DEMO SCENARIO 1: Insider Collusion & Circular Extraction (CRITICAL)
    # EMP-017 touches ACC-0231 (VIEW -> EDIT contact -> OVERRIDE limit -> ₹4.8L, ₹4.7L transfers -> ACC-0442 -> ACC-0553 -> ACC-0231)
    t0 = base_date + timedelta(days=5, hours=14, minutes=2)
    
    log1 = AccessLog(id="LOG-DEMO-01", employee_id="EMP-017", account_id="ACC-0231", action="VIEW", timestamp=t0, device_id="DEV-001", branch_id="BR-01")
    chg1 = AccountChange(id="CHG-DEMO-01", account_id="ACC-0231", employee_id="EMP-017", field="phone", timestamp=t0 + timedelta(minutes=2), reason="Customer requested update over phone", approval_required=False)
    log2 = AccessLog(id="LOG-DEMO-02", employee_id="EMP-017", account_id="ACC-0231", action="OVERRIDE", timestamp=t0 + timedelta(minutes=4), device_id="DEV-001", branch_id="BR-01")
    chg2 = AccountChange(id="CHG-DEMO-02", account_id="ACC-0231", employee_id="EMP-017", field="daily_limit", timestamp=t0 + timedelta(minutes=4), reason="Immediate limit boost override", approval_required=True, approved_by=None)

    tx_demo_1 = Transaction(id="TX-DEMO-01", from_account_id="ACC-0231", to_account_id="ACC-0442", amount=480000.0, channel="NEFT", timestamp=t0 + timedelta(minutes=29), status="COMPLETED")
    tx_demo_2 = Transaction(id="TX-DEMO-02", from_account_id="ACC-0231", to_account_id="ACC-0553", amount=470000.0, channel="NEFT", timestamp=t0 + timedelta(minutes=40), status="COMPLETED")
    tx_demo_3 = Transaction(id="TX-DEMO-03", from_account_id="ACC-0442", to_account_id="ACC-0553", amount=460000.0, channel="RTGS", timestamp=t0 + timedelta(minutes=61), status="COMPLETED")
    tx_demo_4 = Transaction(id="TX-DEMO-04", from_account_id="ACC-0553", to_account_id="ACC-0231", amount=450000.0, channel="RTGS", timestamp=t0 + timedelta(minutes=85), status="COMPLETED")

    db.add_all([log1, chg1, log2, chg2, tx_demo_1, tx_demo_2, tx_demo_3, tx_demo_4])

    # Ground truth records (isolated from normal alert APIs)
    gt1 = GroundTruth(id="GT-001", entity_type="account", entity_id="ACC-0231", label="suspicious", scenario_type="insider_collusion", scenario_id="SCEN-01-PRIMARY-DEMO")
    gt2 = GroundTruth(id="GT-002", entity_type="account", entity_id="ACC-0442", label="suspicious", scenario_type="circular", scenario_id="SCEN-01-PRIMARY-DEMO")
    gt3 = GroundTruth(id="GT-003", entity_type="account", entity_id="ACC-0553", label="suspicious", scenario_type="circular", scenario_id="SCEN-01-PRIMARY-DEMO")
    gt4 = GroundTruth(id="GT-004", entity_type="employee", entity_id="EMP-017", label="suspicious", scenario_type="out_of_role", scenario_id="SCEN-01-PRIMARY-DEMO")
    db.add_all([gt1, gt2, gt3, gt4])

    # -------------------------------------------------------------
    # DEMO SCENARIO 2: Legitimate Lookalike — Corporate Payroll Batch (HARD NEGATIVE)
    # Company pays 30 employees ~₹45,000 to ₹95,000 each. MUST NOT trigger false positive alert.
    t_pay = base_date + timedelta(days=1, hours=10)
    num_payroll = min(30, len(accounts))
    for p_idx in range(num_payroll):
        emp_acc = accounts[(7 + p_idx) % len(accounts)].id
        salary_tx = Transaction(
            id=f"TX-PAYROLL-{p_idx:03d}",
            from_account_id="ACC-PAYROLL-01",
            to_account_id=emp_acc,
            amount=float(random.randint(45000, 95000)),
            channel="PAYROLL",
            timestamp=t_pay + timedelta(seconds=p_idx * 15),
            status="COMPLETED",
            reference="MONTHLY_PAYROLL_SEPTEMBER_2026"
        )
        db.add(salary_tx)
        gt_pay = GroundTruth(id=f"GT-PAY-{p_idx:03d}", entity_type="account", entity_id=emp_acc, label="legitimate", scenario_type="payroll_legitimate", scenario_id="SCEN-02-LEGIT-PAYROLL")
        db.add(gt_pay)

    # -------------------------------------------------------------
    # DEMO SCENARIO 3: Insider Without Financial Fraud (MEDIUM / ISOLATED INSIDER)
    # EMP-022 accesses 45 accounts in a single day (Bulk lookup anomaly) but NO suspicious transactions
    t_ins = base_date + timedelta(days=10, hours=11)
    num_bulk = min(45, len(accounts))
    for b_idx in range(num_bulk):
        target = accounts[(10 + b_idx) % len(accounts)].id
        b_log = AccessLog(
            id=f"LOG-BULK-{b_idx:03d}",
            employee_id="EMP-022",
            account_id=target,
            action="VIEW",
            timestamp=t_ins + timedelta(minutes=b_idx * 3),
            device_id="DEV-002",
            branch_id="BR-02"
        )
        db.add(b_log)
    gt_emp22 = GroundTruth(id="GT-EMP-022", entity_type="employee", entity_id="EMP-022", label="suspicious", scenario_type="bulk_lookup", scenario_id="SCEN-03-INSIDER-ONLY")
    db.add(gt_emp22)

    # -------------------------------------------------------------
    # DEMO SCENARIO 4: Pure Financial Anomaly Without Insider (MEDIUM / HIGH FINANCIAL ONLY)
    # Circular 3-hop ring: ACC-8801 -> ACC-8802 -> ACC-8803 -> ACC-8801
    t_circ = base_date + timedelta(days=12, hours=15)
    tx_c1 = Transaction(id="TX-CIRC-01", from_account_id="ACC-8801", to_account_id="ACC-8802", amount=85000.0, channel="UPI", timestamp=t_circ, status="COMPLETED")
    tx_c2 = Transaction(id="TX-CIRC-02", from_account_id="ACC-8802", to_account_id="ACC-8803", amount=84000.0, channel="UPI", timestamp=t_circ + timedelta(minutes=30), status="COMPLETED")
    tx_c3 = Transaction(id="TX-CIRC-03", from_account_id="ACC-8803", to_account_id="ACC-8801", amount=83000.0, channel="UPI", timestamp=t_circ + timedelta(minutes=65), status="COMPLETED")
    db.add_all([tx_c1, tx_c2, tx_c3])
    gt_c1 = GroundTruth(id="GT-CIRC-01", entity_type="account", entity_id="ACC-8801", label="suspicious", scenario_type="circular", scenario_id="SCEN-04-FINANCIAL-ONLY")
    gt_c2 = GroundTruth(id="GT-CIRC-02", entity_type="account", entity_id="ACC-8802", label="suspicious", scenario_type="circular", scenario_id="SCEN-04-FINANCIAL-ONLY")
    gt_c3 = GroundTruth(id="GT-CIRC-03", entity_type="account", entity_id="ACC-8803", label="suspicious", scenario_type="circular", scenario_id="SCEN-04-FINANCIAL-ONLY")
    db.add_all([gt_c1, gt_c2, gt_c3])

    # -------------------------------------------------------------
    # 7. SEED HARD NEGATIVES (Legitimate routine lookalikes)
    # Family transfers, rent, utilities, small business deposits, authorized night shift
    for hn_idx in range(10):
        src = accounts[(5 + hn_idx) % len(accounts)].id
        dst = accounts[(15 + hn_idx) % len(accounts)].id
        # Rent / Utility monthly payment
        tx_rent = Transaction(
            id=f"TX-HARDNEG-RENT-{hn_idx:02d}",
            from_account_id=src,
            to_account_id=dst,
            amount=float(random.randint(15000, 35000)),
            channel="UPI",
            timestamp=base_date + timedelta(days=random.randint(1, 25), hours=random.randint(10, 18)),
            status="COMPLETED",
            reference="MONTHLY_RENT"
        )
        db.add(tx_rent)
        db.add(GroundTruth(id=f"GT-HN-{hn_idx:02d}", entity_type="account", entity_id=src, label="legitimate", scenario_type="hard_negative_rent", scenario_id="SCEN-HARD-NEGATIVES"))

    # Authorized night shift emergency access
    night_emp = employees[min(5, len(employees) - 1)]
    log_night = AccessLog(
        id="LOG-AUTH-NIGHT-01",
        employee_id=night_emp.id,
        account_id=accounts[20 % len(accounts)].id,
        action="VIEW",
        timestamp=base_date + timedelta(days=8, hours=2, minutes=15),
        device_id="DEV-005",
        metadata_json={"authorized_exception": True, "ticket_id": "INC-88992"}
    )
    db.add(log_night)

    db.commit()

    # 8. BULK SYNTHETIC TRANSACTIONS & ACCESS LOGS
    # Generate realistic background transactions (up to num_transactions)
    # We will generate in batches for performance
    acc_ids = [a.id for a in accounts]
    tx_batch = []
    channels = ["UPI", "NEFT", "RTGS", "BRANCH", "INTERNAL"]
    
    # Generate background normal transactions
    remaining_tx = max(num_transactions - 100, 500)
    for i in range(1, remaining_tx + 1):
        u, v = random.sample(acc_ids, 2)
        # Lognormal distribution for amounts: most transactions between 500 and 15,000
        amt = round(float(np.random.lognormal(mean=7.5, sigma=1.2)), 2)
        amt = min(max(amt, 100.0), 45000.0) # normal retail amounts

        day_start = datetime(2026, 9, 1, 0, 0, 0, tzinfo=timezone.utc)
        t_time = day_start + timedelta(
            days=random.randint(0, 28),
            hours=random.randint(8, 20),
            minutes=random.randint(0, 59)
        )
        tx_batch.append(Transaction(
            id=f"TX-{i:06d}",
            from_account_id=u,
            to_account_id=v,
            amount=amt,
            currency="INR",
            channel=random.choice(channels),
            timestamp=t_time,
            status="COMPLETED"
        ))
        if len(tx_batch) >= 2000:
            db.bulk_save_objects(tx_batch)
            db.commit()
            tx_batch = []
    if tx_batch:
        db.bulk_save_objects(tx_batch)
        db.commit()

    # Generate background normal employee access logs
    log_batch = []
    emp_ids = [e.id for e in employees]
    emp_map = {e.id: e for e in employees}
    remaining_logs = max(num_events - 100, 500)
    for i in range(1, remaining_logs + 1):
        e_id = random.choice(emp_ids)
        a_id = random.choice(acc_ids)
        emp_obj = emp_map[e_id]
        if emp_obj.normal_work_start == "21:00":
            hour = random.choice([22, 23, 0, 1, 2, 3, 4])
        else:
            hour = random.randint(10, 16)

        l_time = base_date + timedelta(
            days=random.randint(0, 28),
            hours=hour,
            minutes=random.randint(0, 59)
        )
        log_batch.append(AccessLog(
            id=f"LOG-{i:06d}",
            employee_id=e_id,
            account_id=a_id,
            action="VIEW",
            timestamp=l_time,
            branch_id="BR-01"
        ))
        if len(log_batch) >= 2000:
            db.bulk_save_objects(log_batch)
            db.commit()
            log_batch = []
    if log_batch:
        db.bulk_save_objects(log_batch)
        db.commit()

    return {
        "customers": db.query(Customer).count(),
        "accounts": db.query(Account).count(),
        "employees": db.query(Employee).count(),
        "roles": db.query(Role).count(),
        "devices": db.query(Device).count(),
        "transactions": db.query(Transaction).count(),
        "access_logs": db.query(AccessLog).count(),
        "ground_truth": db.query(GroundTruth).count(),
    }
