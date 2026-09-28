from typing import Dict, Any, List, Optional, Set
import networkx as nx
from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.models.account import Account
from app.models.employee import Employee
from app.models.device import Device
from app.models.transaction import Transaction
from app.models.access_log import AccessLog
from app.models.account_change import AccountChange

class GraphBuilder:
    def __init__(self):
        pass

    def build_network(
        self,
        db: Session,
        focus_entity_ids: Optional[Set[str]] = None,
        max_depth: int = 2
    ) -> Dict[str, Any]:
        """
        Builds a NetworkX graph of entities and interactions.
        If focus_entity_ids is provided, extracts the relevant ego-subgraph.
        Returns frontend-ready nodes and edges dict.
        """
        G = nx.MultiDiGraph()

        # 1. Fetch relevant or all entities
        accounts = db.query(Account).all()
        for acc in accounts:
            G.add_node(
                acc.id,
                label=f"Account {acc.id}",
                type="ACCOUNT",
                properties={
                    "account_type": acc.account_type,
                    "branch_id": acc.branch_id,
                    "status": acc.status,
                    "daily_limit": acc.daily_limit
                }
            )
            # Link Account to Customer (OWNS)
            if acc.customer_id:
                cust_node = acc.customer_id
                if not G.has_node(cust_node):
                    cust = db.query(Customer).filter(Customer.id == cust_node).first()
                    G.add_node(
                        cust_node,
                        label=f"Customer {cust_node}",
                        type="CUSTOMER",
                        properties={
                            "occupation": cust.declared_occupation if cust else "Unknown",
                            "risk_profile": cust.risk_profile if cust else "LOW"
                        }
                    )
                G.add_edge(cust_node, acc.id, type="OWNS", label="OWNS", properties={})

        employees = db.query(Employee).all()
        for emp in employees:
            G.add_node(
                emp.id,
                label=f"Employee {emp.id}",
                type="EMPLOYEE",
                properties={
                    "role_id": emp.role_id,
                    "branch_id": emp.branch_id,
                    "status": emp.status
                }
            )

        devices = db.query(Device).all()
        for dev in devices:
            G.add_node(
                dev.id,
                label=f"Device {dev.id}",
                type="DEVICE",
                properties={
                    "device_type": dev.device_type,
                    "branch_id": dev.branch_id
                }
            )

        # 2. Add Transactions (TRANSFER edges)
        transactions = db.query(Transaction).filter(Transaction.status == "COMPLETED").all()
        for tx in transactions:
            G.add_edge(
                tx.from_account_id,
                tx.to_account_id,
                type="TRANSFER",
                label=f"₹{tx.amount:,.0f}",
                properties={
                    "transaction_id": tx.id,
                    "amount": tx.amount,
                    "timestamp": tx.timestamp.isoformat(),
                    "channel": tx.channel
                }
            )

        # 3. Add AccessLogs (ACCESSED edges)
        access_logs = db.query(AccessLog).all()
        for log in access_logs:
            G.add_edge(
                log.employee_id,
                log.account_id,
                type="ACCESSED",
                label=log.action,
                properties={
                    "log_id": log.id,
                    "action": log.action,
                    "timestamp": log.timestamp.isoformat(),
                    "device_id": log.device_id
                }
            )
            if log.device_id and G.has_node(log.device_id):
                G.add_edge(
                    log.employee_id,
                    log.device_id,
                    type="USED_DEVICE",
                    label="USED",
                    properties={"timestamp": log.timestamp.isoformat()}
                )

        # 4. Add AccountChanges (EDITED edges)
        changes = db.query(AccountChange).all()
        for chg in changes:
            G.add_edge(
                chg.employee_id,
                chg.account_id,
                type="EDITED",
                label=f"EDIT {chg.field}",
                properties={
                    "change_id": chg.id,
                    "field": chg.field,
                    "timestamp": chg.timestamp.isoformat()
                }
            )

        # Subgraph extraction if focus entities specified
        if focus_entity_ids:
            sub_nodes = set()
            for fid in focus_entity_ids:
                if G.has_node(fid):
                    sub_nodes.add(fid)
                    # Get neighbors up to max_depth
                    current_level = {fid}
                    for _ in range(max_depth):
                        next_level = set()
                        for n in current_level:
                            next_level.update(G.neighbors(n))
                            if hasattr(G, "predecessors"):
                                next_level.update(G.predecessors(n))
                        sub_nodes.update(next_level)
                        current_level = next_level

            H = G.subgraph(sub_nodes).copy()
        else:
            H = G

        # Convert to serialized JSON response
        nodes_out = []
        for n, data in H.nodes(data=True):
            is_suspicious = bool(focus_entity_ids and n in focus_entity_ids)
            nodes_out.append({
                "id": str(n),
                "label": data.get("label", str(n)),
                "type": data.get("type", "UNKNOWN"),
                "properties": data.get("properties", {}),
                "is_suspicious": is_suspicious
            })

        edges_out = []
        for u, v, k, data in H.edges(keys=True, data=True):
            is_hl = bool(focus_entity_ids and (u in focus_entity_ids or v in focus_entity_ids))
            edges_out.append({
                "source": str(u),
                "target": str(v),
                "type": data.get("type", "RELATION"),
                "label": data.get("label", ""),
                "properties": data.get("properties", {}),
                "is_highlighted": is_hl
            })

        return {
            "nodes": nodes_out,
            "edges": edges_out,
            "highlighted_path": list(focus_entity_ids) if focus_entity_ids else [],
            "metadata": {"total_nodes": len(nodes_out), "total_edges": len(edges_out)}
        }
