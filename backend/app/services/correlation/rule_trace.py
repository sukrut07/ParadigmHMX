from typing import Any


def _compute_risk_breakdown(
    tier: str,
    signals: list[dict[str, Any]],
    accounts: list[str],
    employees: list[str],
) -> dict[str, Any]:
    """
    Computes explainable, multi-dimensional risk levels across 5 key dimensions:
    1. Insider Privilege & Policy Misuse
    2. Money-Flow Topology & Laundering (circular transfers, structuring, rapid passthrough)
    3. Customer Profile & KYC Alignment
    4. Causal Temporal Proximity (action-to-transaction velocity)
    5. Network Blast Radius & Entity Exposure
    """
    signal_types = {s.get("signal_type") for s in signals}
    severities = {s.get("severity") for s in signals}

    # 1. Insider Privilege Risk
    insider_indicators = []
    insider_score = 0
    if "OUT_OF_ROLE_ACCESS" in signal_types:
        insider_indicators.append("Employee performed unauthorized operations outside assigned RBAC permissions or branch jurisdiction.")
        insider_score += 40
    if "PRIVILEGE_ABUSE" in signal_types:
        insider_indicators.append("Unapproved managerial override or limit boost executed without dual-control signoff.")
        insider_score += 45
    if "OFF_HOURS_ACCESS" in signal_types:
        insider_indicators.append("Session initiated during off-hours/weekend without emergency authorization ticket.")
        insider_score += 25
    if "BULK_LOOKUP" in signal_types:
        insider_indicators.append("Anomalous high-velocity customer account queries (z-score > 2.5) indicating reconnaissance.")
        insider_score += 30

    if insider_score >= 70 or ("PRIVILEGE_ABUSE" in signal_types and "CRITICAL" in severities):
        insider_level = "CRITICAL"
    elif insider_score >= 40:
        insider_level = "HIGH"
    elif insider_score > 0:
        insider_level = "MEDIUM"
    else:
        insider_level = "NONE"
        insider_indicators.append("No direct insider privilege abuse detected in this alert cluster.")

    # 2. Money Flow & Laundering Topology Risk
    topology_indicators = []
    topology_score = 0
    if "CIRCULAR_TRANSFER" in signal_types:
        topology_indicators.append("Directed multi-hop circular transfer loop detected returning funds to originator or mule ring.")
        topology_score += 50
    if "STRUCTURING" in signal_types:
        topology_indicators.append("Transaction splitting detected intentionally skirting mandatory statutory reporting thresholds.")
        topology_score += 45
    if "RAPID_PASSTHROUGH" in signal_types:
        topology_indicators.append("Mule account behavior: Inbound lump-sum dissipated > 85% within 4 hours.")
        topology_score += 40

    if topology_score >= 80 or "CIRCULAR_TRANSFER" in signal_types:
        topology_level = "CRITICAL" if "CIRCULAR_TRANSFER" in signal_types and topology_score >= 70 else "HIGH"
    elif topology_score >= 40:
        topology_level = "HIGH"
    elif topology_score > 0:
        topology_level = "MEDIUM"
    else:
        topology_level = "LOW"
        topology_indicators.append("No complex circular or structured transfer topologies observed.")

    # 3. Customer Profile & KYC Alignment Risk
    profile_indicators = []
    profile_score = 0
    if "PROFILE_MISMATCH" in signal_types:
        profile_indicators.append("Payment volume significantly exceeds customer occupation profile and monthly income ceiling.")
        profile_score += 45
    # Check if account parameter changes touched KYC or contact info
    for s in signals:
        for ev in s.get("evidence", []):
            if ev.get("record_type") == "account_change" and ev.get("field") in ("phone", "email", "address", "KYC"):
                profile_indicators.append(f"Security contact field '{ev.get('field')}' modified immediately prior to outbound transfer.")
                profile_score += 40
                break

    if profile_score >= 70:
        profile_level = "CRITICAL"
    elif profile_score >= 40:
        profile_level = "HIGH"
    elif profile_score > 0:
        profile_level = "MEDIUM"
    else:
        profile_level = "LOW"
        profile_indicators.append("Account transactions align with baseline customer KYC demographics.")

    # 4. Causal Temporal Proximity Risk (Action -> Change -> Outflow)
    causal_indicators = []
    causal_score = 0
    if "ACTION_TRANSACTION_LINK" in signal_types:
        causal_indicators.append("Direct causal sequence: Internal employee parameter modification followed by rapid outbound fund dissipation.")
        causal_score += 55
        if employees and accounts:
            causal_score += 35
            causal_indicators.append(f"High temporal proximity: Transactions executed in tight temporal window following employee {employees[0]} action.")

    if causal_score >= 75:
        causal_level = "CRITICAL"
    elif causal_score >= 40:
        causal_level = "HIGH"
    elif causal_score > 0:
        causal_level = "MEDIUM"
    else:
        causal_level = "NONE"
        causal_indicators.append("Independent events with no direct action-to-transaction causal linkage.")

    # 5. Network Exposure & Blast Radius Risk
    network_indicators = []
    total_entities = len(accounts) + len(employees)
    if total_entities >= 4:
        network_level = "HIGH"
        network_score = 85
        network_indicators.append(f"Broad network exposure: Alert cluster links {len(accounts)} accounts and {len(employees)} internal operators.")
    elif total_entities >= 2:
        network_level = "MEDIUM"
        network_score = 60
        network_indicators.append(f"Multi-entity cluster: Involves {len(accounts)} account(s) and {len(employees)} employee(s).")
    else:
        network_level = "LOW"
        network_score = 30
        network_indicators.append("Isolated entity event with limited institutional blast radius.")

    return {
        "insider_privilege_risk": {
            "level": insider_level,
            "score": min(insider_score, 100),
            "title": "Insider Privilege & Policy Misuse",
            "indicators": insider_indicators,
        },
        "money_flow_topology_risk": {
            "level": topology_level,
            "score": min(topology_score, 100),
            "title": "Money-Flow Topology & Laundering Patterns",
            "indicators": topology_indicators,
        },
        "profile_kyc_mismatch_risk": {
            "level": profile_level,
            "score": min(profile_score, 100),
            "title": "Customer Profile & KYC Alignment",
            "indicators": profile_indicators,
        },
        "causal_temporal_linkage_risk": {
            "level": causal_level,
            "score": min(causal_score, 100),
            "title": "Causal Action-Transaction Temporal Linkage",
            "indicators": causal_indicators,
        },
        "network_exposure_risk": {
            "level": network_level,
            "score": min(network_score, 100),
            "title": "Network Exposure & Blast Radius",
            "indicators": network_indicators,
        },
    }


def build_rule_trace(
    tier: str,
    matched_rules: list[dict[str, Any]],
    signals: list[dict[str, Any]],
    accounts: list[str],
    employees: list[str],
) -> dict[str, Any]:
    """
    Builds machine-readable rules, multi-dimensional risk levels, and a clear human explanation.
    """
    rules_list = []
    for r in matched_rules:
        rules_list.append(
            {
                "rule": r.get("rule", "RULE_MATCH"),
                "name": r.get("name", ""),
                "matched": r.get("matched", True),
                "signals": r.get("signals", []),
                "entities": r.get("entities", []),
                "description": r.get("description", ""),
            }
        )

    # Synthesize human explanation
    emp_str = ", ".join(employees) if employees else "unidentified actor"
    acc_str = ", ".join(accounts) if accounts else "target accounts"
    signal_explanations = [s.get("explanation", "") for s in signals if s.get("explanation")]

    primary_sig_text = signal_explanations[0] if signal_explanations else ""
    secondary_sig_text = signal_explanations[1] if len(signal_explanations) > 1 else ""

    if employees and accounts:
        human_explanation = (
            f"Alert classified as {tier} because insider activity by employee(s) {emp_str} directly intersected "
            f"with suspicious financial patterns on account(s) {acc_str}. "
            f"Evidence shows: {primary_sig_text} "
            + (f"Concurrently: {secondary_sig_text}" if secondary_sig_text else "")
        )
    elif employees:
        human_explanation = (
            f"Alert classified as {tier} due to policy and access violations by employee(s) {emp_str}. "
            f"Evidence indicates: {primary_sig_text}"
        )
    else:
        human_explanation = (
            f"Alert classified as {tier} due to suspicious transactional behavior across account(s) {acc_str}. "
            f"Evidence indicates: {primary_sig_text}"
        )

    # Compute multi-dimensional explainable risk levels
    risk_breakdown = _compute_risk_breakdown(tier, signals, accounts, employees)

    return {
        "tier": tier,
        "rules": rules_list,
        "human_explanation": human_explanation,
        "risk_factors": risk_breakdown,
        "risk_breakdown": risk_breakdown,
    }

