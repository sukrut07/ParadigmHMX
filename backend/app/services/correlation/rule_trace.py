from typing import List, Dict, Any

def build_rule_trace(
    tier: str,
    matched_rules: List[Dict[str, Any]],
    signals: List[Dict[str, Any]],
    accounts: List[str],
    employees: List[str]
) -> Dict[str, Any]:
    """
    Builds machine-readable rules and a clear human explanation synthesized from actual records.
    """
    rules_list = []
    for r in matched_rules:
        rules_list.append({
            "rule": r.get("rule", "RULE_MATCH"),
            "name": r.get("name", ""),
            "matched": r.get("matched", True),
            "signals": r.get("signals", []),
            "entities": r.get("entities", []),
            "description": r.get("description", "")
        })

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

    return {
        "tier": tier,
        "rules": rules_list,
        "human_explanation": human_explanation
    }
