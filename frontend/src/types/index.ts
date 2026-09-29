export type UserRole = 'FRAUD_ANALYST' | 'INTERNAL_AUDITOR' | 'COMPLIANCE_HEAD' | 'ADMIN' | 'ANALYST' | 'AUDITOR' | 'REVIEWER';

export type RiskTier = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface EvidenceItem {
  record_type: string;
  record_id: string;
  field: string;
  value: string;
  details?: Record<string, any>;
}

export interface RuleMatch {
  rule: string;
  name: string;
  matched: boolean;
  signals: string[];
  entities: string[];
  description?: string;
}

export interface RiskFactorItem {
  level: RiskTier | 'NONE';
  score: number;
  title: string;
  indicators: string[];
}

export interface RiskFactorsBreakdown {
  insider_privilege_risk?: RiskFactorItem;
  money_flow_topology_risk?: RiskFactorItem;
  profile_kyc_mismatch_risk?: RiskFactorItem;
  causal_temporal_linkage_risk?: RiskFactorItem;
  network_exposure_risk?: RiskFactorItem;
}

export interface RuleTrace {
  rules: RuleMatch[];
  human_explanation: string;
  risk_factors?: RiskFactorsBreakdown;
  risk_breakdown?: RiskFactorsBreakdown;
}

export interface CounterfactualExplanation {
  condition_changed: string;
  original_tier: string;
  counterfactual_tier: string;
  explanation: string;
}

export interface GraphNode {
  data: {
    id: string;
    label: string;
    type: 'employee' | 'account' | 'customer' | 'transaction' | 'device';
    risk?: RiskTier;
    sublabel?: string;
    properties?: Record<string, any>;
  };
}

export interface GraphEdge {
  data: {
    id: string;
    source: string;
    target: string;
    relationship: string;
    type?: string;
    label?: string;
    amount?: number;
    timestamp?: string;
  };
}

export interface GraphData {
  elements: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  focus_entities?: string[];
  total_nodes?: number;
  total_edges?: number;
}

export interface TimelineItem {
  id: string;
  timestamp: string;
  event_type: 'ACCESS_LOG' | 'ACCOUNT_CHANGE' | 'TRANSACTION' | 'SIGNAL';
  actor?: string;
  account_id?: string;
  target_id?: string;
  description: string;
  severity?: RiskTier;
  amount?: number;
  time_delta_display?: string;
  details?: Record<string, any>;
}

export interface AlertListItem {
  id: string;
  tier: RiskTier;
  title: string;
  summary: string;
  primary_signal?: string;
  employee_id?: string;
  account_id?: string;
  status: 'OPEN' | 'IN_REVIEW' | 'ESCALATED' | 'CLOSED';
  created_at: string;
  updated_at: string;
}

export interface AlertDetail {
  id: string;
  tier: RiskTier;
  title: string;
  summary: string;
  signal_ids: string[];
  entity_ids: string[];
  evidence: EvidenceItem[];
  evidence_record_ids: string[];
  rule_trace: RuleTrace;
  counterfactual: CounterfactualExplanation;
  graph_snapshot: GraphData;
  timeline_snapshot: TimelineItem[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  pseudonym_id: string;
  role_id: string;
  branch_id: string;
  normal_work_start: string;
  normal_work_end: string;
  status: string;
}

export interface EmployeeRiskRow {
  employee_id: string;
  pseudonym_id: string;
  role: string;
  branch_id: string;
  risk: RiskTier;
  access_count: number;
  modifications: number;
  overrides: number;
  off_hours: number;
  linked_alerts_count: number;
  deviation_sigma: string;
}

export interface EmployeeBlastRadius {
  employee: Employee;
  role_name: string;
  accounts_touched: string[];
  customers_touched: string[];
  devices_used: string[];
  actions_performed: Record<string, number>;
  transactions_following_actions: {
    transaction_id: string;
    from_account: string;
    to_account: string;
    amount: number;
    channel: string;
    timestamp: string;
  }[];
  alerts_involved: string[];
  suspicious_accounts: string[];
  risk_clusters: {
    cluster_name: string;
    accounts: string[];
    alerts: string[];
  }[];
  timeline: TimelineItem[];
  total_actions_count: number;
  risk_level: RiskTier;
}

export interface Case {
  id: string;
  alert_id: string;
  title: string;
  status: 'OPEN' | 'IN_REVIEW' | 'ESCALATED' | 'CLOSED_CONFIRMED' | 'CLOSED_FALSE_POSITIVE';
  priority: RiskTier;
  assignee_id?: string;
  assigned_to?: string;
  closure_reason?: string;
  notes?: {
    author: string;
    text: string;
    timestamp: string;
  }[];
  notes_json?: {
    id?: string;
    author: string;
    text: string;
    timestamp: string;
  }[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface DashboardFraudData {
  kpis: {
    critical_alerts: number;
    high_alerts: number;
    medium_alerts: number;
    low_alerts: number;
    open_cases: number;
    unassigned_alerts: number;
    suspicious_employees: number;
    suspicious_accounts: number;
    alerts_today: number;
  };
  risk_distribution: Record<RiskTier, number>;
  signal_distribution: Record<string, number>;
  priority_alerts: {
    id: string;
    tier: RiskTier;
    title: string;
    summary: string;
    employee_id?: string;
    account_id?: string;
    signal_count: number;
    status: string;
    created_at?: string;
  }[];
  top_entities: {
    employees: { id: string; weight: number; risk: RiskTier }[];
    accounts: { id: string; weight: number; risk: RiskTier }[];
  };
}

export interface DashboardAuditData {
  kpis: {
    critical_employees: number;
    high_risk_employees: number;
    off_hours_events: number;
    privilege_violations: number;
    bulk_lookup_anomalies: number;
    account_modifications: number;
    employees_monitored: number;
    linked_financial_alerts: number;
  };
  behaviour_anomalies: {
    off_hours: number;
    bulk_lookup: number;
    overrides: number;
    kyc_edits: number;
    limit_changes: number;
  };
  top_deviations: {
    employee_id: string;
    role: string;
    deviation_sigma: string;
    lookups: number;
    peer_mean: number;
  }[];
  branch_risk: Record<string, {
    name: string;
    risk: RiskTier;
    active_alerts: number;
    anomalies: number;
  }>;
  employee_table: EmployeeRiskRow[];
}

export interface DashboardComplianceData {
  kpis: {
    detection_rate: number;
    precision: number;
    recall: number;
    false_positive_rate: number;
    open_cases: number;
    escalated_cases: number;
    average_resolution_days: string;
    evidence_exports: number;
  };
  case_pipeline: {
    detected: number;
    open: number;
    in_review: number;
    escalated: number;
    resolved: number;
  };
  detector_performance: {
    detector: string;
    precision: string;
    recall: string;
    f1: string;
    fpr: string;
  }[];
  ablation: {
    baseline_financial_only: {
      precision: number;
      recall: number;
      f1: number;
      fpr: number;
    };
    ours_financial_and_insider: {
      precision: number;
      recall: number;
      f1: number;
      fpr: number;
    };
    improvement_f1_delta: number;
    improvement_fpr_reduction: number;
  };
  evidence_integrity: {
    total_exports: number;
    verified: number;
    pending: number;
    failed_verification: number;
    last_verification: string;
    integrity_status: string;
  };
  benchmark_label: string;
}

export interface EvaluationData {
  overall: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
    precision: number;
    recall: number;
    f1: number;
    fpr: number;
    detection_rate: number;
  };
  ablation: {
    baseline_financial_only: { precision: number; recall: number; f1: number; fpr: number };
    ours_financial_and_insider: { precision: number; recall: number; f1: number; fpr: number };
    improvement_f1_delta: number;
    improvement_fpr_reduction: number;
  };
  hard_negatives: {
    total_hard_negatives: number;
    false_positives: number;
    true_negatives: number;
    fp_rate: number;
    scenarios_tested: string[];
  };
  scenario_breakdown: Record<string, { total: number; detected: number; rate: number }>;
}
