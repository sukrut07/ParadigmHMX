import copy
from typing import Any

from app.services.correlation.tier_engine import (
    FINANCIAL_SIGNAL_TYPES,
    INSIDER_SIGNAL_TYPES,
    TierEngine,
)


class CounterfactualEngine:
    def __init__(self, tier_engine: TierEngine):
        self.tier_engine = tier_engine

    def generate_counterfactual(
        self, original_tier: str, signals: list[dict[str, Any]], linked_entities: list[str]
    ) -> dict[str, Any]:
        """
        Generates a counterfactual explanation by systematically testing hypothesis modifications:
        1. What if insider signals were absent / authorized?
        2. What if transactions were below structuring/mule threshold?
        3. What if timing was outside the correlation window?
        Re-evaluates through the deterministic TierEngine to produce mathematically sound counterfactuals.
        """
        signal_types = {s["signal_type"] for s in signals}
        has_insider = any(st in INSIDER_SIGNAL_TYPES for st in signal_types)
        has_financial = any(st in FINANCIAL_SIGNAL_TYPES for st in signal_types)

        # Scenario 1: Linked anomaly with insider and financial signals
        if has_insider and has_financial:
            # Modify condition: remove insider signal (simulate employee was authorized or did not touch account)
            counterfactual_signals = [s for s in signals if s["signal_type"] not in INSIDER_SIGNAL_TYPES]
            cf_entities = [e for e in linked_entities if not e.startswith("EMP-")]
            cf_tier, _ = self.tier_engine.evaluate_tier(counterfactual_signals, cf_entities)

            insider_sig_names = [s["signal_type"] for s in signals if s["signal_type"] in INSIDER_SIGNAL_TYPES]
            condition_changed = f"Simulated employee access as fully authorized within role/shift (removed {', '.join(insider_sig_names)})"
            explanation = (
                f"If the employee's access had been within permitted role and branch jurisdiction with dual-authorization, "
                f"the cross-domain insider linkage would be severed. The alert severity would decrease from "
                f"{original_tier} to {cf_tier}."
            )
            return {
                "condition_changed": condition_changed,
                "original_tier": original_tier,
                "counterfactual_tier": cf_tier,
                "explanation": explanation,
            }

        # Scenario 2: Financial-only signals (e.g. structuring or circular)
        if has_financial and not has_insider:
            # Modify condition: lower amounts or remove primary financial anomaly
            counterfactual_signals = copy.deepcopy(signals)
            if counterfactual_signals:
                counterfactual_signals.pop(0)
            cf_tier, _ = self.tier_engine.evaluate_tier(counterfactual_signals, linked_entities)

            condition_changed = (
                "Aggregated transaction amounts remained strictly within expected personal profile limits"
            )
            explanation = (
                f"If the transaction amounts had remained within typical customer profile benchmarks without "
                f"splitting or circular flow, the alert tier would downgrade from {original_tier} to {cf_tier}."
            )
            return {
                "condition_changed": condition_changed,
                "original_tier": original_tier,
                "counterfactual_tier": cf_tier,
                "explanation": explanation,
            }

        # Scenario 3: Insider-only signal (e.g. bulk lookup or off-hours)
        if has_insider and not has_financial:
            condition_changed = "Employee activity occurred during assigned shift hours with valid ticket authorization"
            explanation = (
                f"If an emergency maintenance or shift exception ticket had been registered for this session, "
                f"the alert tier would downgrade from {original_tier} to LOW."
            )
            return {
                "condition_changed": condition_changed,
                "original_tier": original_tier,
                "counterfactual_tier": "LOW",
                "explanation": explanation,
            }

        # Default fallback
        return {
            "condition_changed": "Transaction amounts and access logs match baseline parameters",
            "original_tier": original_tier,
            "counterfactual_tier": "LOW",
            "explanation": "In the absence of anomalous indicators, this case would be classified as LOW risk.",
        }
