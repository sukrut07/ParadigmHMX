from typing import Any

import networkx as nx
from sqlalchemy.orm import Session

from app.models.access_log import AccessLog
from app.models.account import Account
from app.models.account_change import AccountChange
from app.models.employee import Employee
from app.models.transaction import Transaction


class GraphBuilder:
    def __init__(self):
        pass

    def build_network(
        self, db: Session, focus_entity_ids: set[str] | None = None, max_depth: int = 1
    ) -> dict[str, Any]:
        """
        Builds a NetworkX graph of entities and interactions.
        If focus_entity_ids is provided, constructs a focused case subgraph.
        """
        G = nx.MultiDiGraph()

        if focus_entity_ids:
            # 1. Focused Case Subgraph Query
            focus_ids_list = list(focus_entity_ids)
            accounts = db.query(Account).filter(Account.id.in_(focus_ids_list)).all()
            for acc in accounts:
                G.add_node(
                    acc.id,
                    label=f"Account {acc.id}",
                    type="ACCOUNT",
                    properties={"status": acc.status, "daily_limit": acc.daily_limit, "account_type": acc.account_type},
                )
                if acc.customer_id:
                    if not G.has_node(acc.customer_id):
                        G.add_node(acc.customer_id, label=f"Customer {acc.customer_id}", type="CUSTOMER", properties={})
                    G.add_edge(acc.customer_id, acc.id, type="OWNS", label="OWNS", properties={})

            employees = db.query(Employee).filter(Employee.id.in_(focus_ids_list)).all()
            for emp in employees:
                G.add_node(
                    emp.id,
                    label=f"Employee {emp.id}",
                    type="EMPLOYEE",
                    properties={"role_id": emp.role_id, "branch_id": emp.branch_id},
                )

            # Connected transactions
            txs = (
                db.query(Transaction)
                .filter(
                    (Transaction.from_account_id.in_(focus_ids_list)) | (Transaction.to_account_id.in_(focus_ids_list)),
                    Transaction.status == "COMPLETED",
                )
                .order_by(Transaction.timestamp.desc())
                .limit(40)
                .all()
            )

            for tx in txs:
                if not G.has_node(tx.from_account_id):
                    G.add_node(tx.from_account_id, label=f"Account {tx.from_account_id}", type="ACCOUNT", properties={})
                if not G.has_node(tx.to_account_id):
                    G.add_node(tx.to_account_id, label=f"Account {tx.to_account_id}", type="ACCOUNT", properties={})
                G.add_edge(
                    tx.from_account_id,
                    tx.to_account_id,
                    type="TRANSFER",
                    label=f"₹{tx.amount:,.0f}",
                    properties={
                        "transaction_id": tx.id,
                        "amount": tx.amount,
                        "timestamp": tx.timestamp.isoformat(),
                        "channel": tx.channel,
                    },
                )

            # Connected access logs
            logs = (
                db.query(AccessLog)
                .filter((AccessLog.employee_id.in_(focus_ids_list)) | (AccessLog.account_id.in_(focus_ids_list)))
                .order_by(AccessLog.timestamp.desc())
                .limit(30)
                .all()
            )

            for log in logs:
                if not G.has_node(log.employee_id):
                    G.add_node(log.employee_id, label=f"Employee {log.employee_id}", type="EMPLOYEE", properties={})
                if not G.has_node(log.account_id):
                    G.add_node(log.account_id, label=f"Account {log.account_id}", type="ACCOUNT", properties={})
                G.add_edge(
                    log.employee_id,
                    log.account_id,
                    type="ACCESSED",
                    label=log.action,
                    properties={"log_id": log.id, "action": log.action, "timestamp": log.timestamp.isoformat()},
                )

            # Connected account changes
            changes = (
                db.query(AccountChange)
                .filter(
                    (AccountChange.employee_id.in_(focus_ids_list)) | (AccountChange.account_id.in_(focus_ids_list))
                )
                .order_by(AccountChange.timestamp.desc())
                .limit(20)
                .all()
            )

            for chg in changes:
                if not G.has_node(chg.employee_id):
                    G.add_node(chg.employee_id, label=f"Employee {chg.employee_id}", type="EMPLOYEE", properties={})
                if not G.has_node(chg.account_id):
                    G.add_node(chg.account_id, label=f"Account {chg.account_id}", type="ACCOUNT", properties={})
                G.add_edge(
                    chg.employee_id,
                    chg.account_id,
                    type="EDITED",
                    label=f"EDIT {chg.field}",
                    properties={"change_id": chg.id, "field": chg.field, "timestamp": chg.timestamp.isoformat()},
                )

            H = G
        else:
            # 2. Global Graph Query
            accounts = db.query(Account).limit(150).all()
            for acc in accounts:
                G.add_node(
                    acc.id,
                    label=f"Account {acc.id}",
                    type="ACCOUNT",
                    properties={"status": acc.status, "account_type": acc.account_type},
                )
                if acc.customer_id:
                    if not G.has_node(acc.customer_id):
                        G.add_node(acc.customer_id, label=f"Customer {acc.customer_id}", type="CUSTOMER", properties={})
                    G.add_edge(acc.customer_id, acc.id, type="OWNS", label="OWNS", properties={})

            employees = db.query(Employee).all()
            for emp in employees:
                G.add_node(
                    emp.id,
                    label=f"Employee {emp.id}",
                    type="EMPLOYEE",
                    properties={"role_id": emp.role_id, "branch_id": emp.branch_id},
                )

            txs = (
                db.query(Transaction)
                .filter(Transaction.status == "COMPLETED")
                .order_by(Transaction.timestamp.desc())
                .limit(200)
                .all()
            )
            for tx in txs:
                if not G.has_node(tx.from_account_id):
                    G.add_node(tx.from_account_id, label=f"Account {tx.from_account_id}", type="ACCOUNT", properties={})
                if not G.has_node(tx.to_account_id):
                    G.add_node(tx.to_account_id, label=f"Account {tx.to_account_id}", type="ACCOUNT", properties={})
                G.add_edge(
                    tx.from_account_id,
                    tx.to_account_id,
                    type="TRANSFER",
                    label=f"₹{tx.amount:,.0f}",
                    properties={"transaction_id": tx.id, "amount": tx.amount, "timestamp": tx.timestamp.isoformat()},
                )
            H = G

        # Convert to serialized JSON response
        nodes_out = []
        for n, data in H.nodes(data=True):
            is_suspicious = bool(focus_entity_ids and n in focus_entity_ids)
            n_data: dict[str, Any] = data if isinstance(data, dict) else {}
            nodes_out.append(
                {
                    "id": n,
                    "label": n_data.get("label", n),
                    "type": n_data.get("type", "UNKNOWN"),
                    "properties": n_data.get("properties", {}),
                    "is_suspicious": is_suspicious,
                }
            )

        edges_out = []
        for u, v, _k, data in H.edges(keys=True, data=True):
            is_hl = bool(focus_entity_ids and (u in focus_entity_ids or v in focus_entity_ids))
            e_data: dict[str, Any] = data if isinstance(data, dict) else {}
            edges_out.append(
                {
                    "source": u,
                    "target": v,
                    "type": e_data.get("type", "RELATION"),
                    "label": e_data.get("label", ""),
                    "properties": e_data.get("properties", {}),
                    "is_highlighted": is_hl,
                }
            )

        return {
            "nodes": nodes_out,
            "edges": edges_out,
            "highlighted_path": list(focus_entity_ids) if focus_entity_ids else [],
            "metadata": {"total_nodes": len(nodes_out), "total_edges": len(edges_out)},
        }
