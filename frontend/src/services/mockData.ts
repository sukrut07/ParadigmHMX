import {
  AlertListItem,
  AlertDetail,
  Case,
  Employee,
  EmployeeBlastRadius,
  DashboardFraudData,
  DashboardAuditData,
  DashboardComplianceData,
  EvaluationData,
  GraphData,
  TimelineItem,
} from '../types';

export const MOCK_FRAUD_DASHBOARD: DashboardFraudData = {
  kpis: {
    critical_alerts: 5,
    high_alerts: 7,
    medium_alerts: 380,
    low_alerts: 0,
    open_cases: 3,
    unassigned_alerts: 389,
    suspicious_employees: 1,
    suspicious_accounts: 9,
    alerts_today: 392,
  },
  risk_distribution: {
    CRITICAL: 5,
    HIGH: 7,
    MEDIUM: 380,
    LOW: 0,
  },
  signal_distribution: {
    CIRCULAR_TRANSFER: 6,
    STRUCTURING: 4,
    RAPID_PASSTHROUGH: 36,
    PROFILE_MISMATCH: 364,
    OUT_OF_ROLE_ACCESS: 5,
    BULK_LOOKUP: 12,
    ACTION_TRANSACTION_LINK: 13,
  },
  priority_alerts: [
    {
      id: 'ALERT-81F9677A',
      tier: 'CRITICAL',
      title: 'CRITICAL: Insider Linked Risk — Employee EMP-017 & Account ACC-0231',
      summary: 'Alert classified as CRITICAL because insider activity by employee(s) EMP-017 directly intersected with suspicious financial patterns on account(s) ACC-0231, ACC-0442, ACC-0553. Detected 3-hop circular money flow (~₹480,000). Rapid mule pass-through dissipated 95.8% within 0.5 hours.',
      employee_id: 'EMP-017',
      account_id: 'ACC-0231',
      signal_count: 9,
      status: 'OPEN',
      created_at: '2026-09-29T13:54:10.620198',
    },
    {
      id: 'ALERT-2CA81F41',
      tier: 'CRITICAL',
      title: 'CRITICAL: Insider Linked Risk — Employee EMP-017 & Account ACC-9738FFBB',
      summary: 'Alert classified as CRITICAL because insider activity by employee(s) EMP-017 directly intersected with suspicious financial patterns on account(s) ACC-9738FFBB. Customer conducted transactions totaling ₹1,000,000 (28.6x declared monthly income). Employee executed unauthorized action OVERRIDE.',
      employee_id: 'EMP-017',
      account_id: 'ACC-9738FFBB',
      signal_count: 4,
      status: 'OPEN',
      created_at: '2026-09-29T13:54:10.827298',
    },
    {
      id: 'ALERT-B78BB63B',
      tier: 'CRITICAL',
      title: 'CRITICAL: Insider Linked Risk — Employee EMP-017 & Account ACC-0442',
      summary: 'Alert classified as CRITICAL: Corroborated 3-hop circular flow (ACC-0442 → ACC-0553 → ACC-0231 → ACC-0442) following unauthorized limit override by EMP-017.',
      employee_id: 'EMP-017',
      account_id: 'ACC-0442',
      signal_count: 9,
      status: 'IN_REVIEW',
      created_at: '2026-09-29T07:35:49.258508',
    },
    {
      id: 'ALERT-FFB1388A',
      tier: 'HIGH',
      title: 'HIGH: Financial Anomaly (Structuring) on Account ACC-9B2D1396',
      summary: 'Account executed 3 transactions just below threshold (₹50,000.00) totaling ₹144,500.00 within 0.5 hours to evade AML reporting thresholds.',
      employee_id: undefined,
      account_id: 'ACC-9B2D1396',
      signal_count: 1,
      status: 'OPEN',
      created_at: '2026-09-29T13:54:10.623345',
    },
    {
      id: 'ALERT-B87776B0',
      tier: 'HIGH',
      title: 'HIGH: Financial Anomaly (Structuring) on Account ACC-7701',
      summary: 'Account ACC-7701 executed 4 transactions just below threshold (₹50,000.00) totaling ₹194,400.00 within 1.3 hours to 2 recipient accounts.',
      employee_id: undefined,
      account_id: 'ACC-7701',
      signal_count: 1,
      status: 'OPEN',
      created_at: '2026-09-29T13:54:10.622412',
    },
    {
      id: 'ALERT-2E823B28',
      tier: 'HIGH',
      title: 'HIGH: Financial Anomaly (Circular Transfer) on Account ACC-8802',
      summary: 'Detected 3-hop circular money flow (ACC-8802 → ACC-8803 → ACC-8801 → ACC-8802). Total amount ~₹85,000.00 circulated through 3 accounts within 1.1 hours.',
      employee_id: undefined,
      account_id: 'ACC-8801',
      signal_count: 4,
      status: 'OPEN',
      created_at: '2026-09-29T13:54:10.621339',
    },
  ],
  top_entities: {
    employees: [
      { id: 'EMP-017', weight: 15, risk: 'CRITICAL' },
      { id: 'EMP-022', weight: 3, risk: 'CRITICAL' },
      { id: 'EMP-013', weight: 3, risk: 'CRITICAL' },
      { id: 'EMP-023', weight: 3, risk: 'CRITICAL' },
      { id: 'EMP-012', weight: 3, risk: 'CRITICAL' },
    ],
    accounts: [
      { id: 'ACC-0231', weight: 9, risk: 'CRITICAL' },
      { id: 'ACC-0442', weight: 9, risk: 'CRITICAL' },
      { id: 'ACC-0553', weight: 9, risk: 'CRITICAL' },
      { id: 'ACC-8801', weight: 6, risk: 'CRITICAL' },
      { id: 'ACC-8802', weight: 6, risk: 'CRITICAL' },
    ],
  },
};

export const MOCK_ALERT_TREND = [
  { date: 'Sep 25', CRITICAL: 1, HIGH: 3, MEDIUM: 210, LOW: 0, total: 214 },
  { date: 'Sep 26', CRITICAL: 2, HIGH: 4, MEDIUM: 280, LOW: 0, total: 286 },
  { date: 'Sep 27', CRITICAL: 3, HIGH: 5, MEDIUM: 310, LOW: 0, total: 318 },
  { date: 'Sep 28', CRITICAL: 4, HIGH: 6, MEDIUM: 350, LOW: 0, total: 360 },
  { date: 'Sep 29', CRITICAL: 5, HIGH: 7, MEDIUM: 380, LOW: 0, total: 392 },
];

export const MOCK_AUDIT_DASHBOARD: DashboardAuditData = {
  kpis: {
    critical_employees: 5,
    high_risk_employees: 0,
    off_hours_events: 0,
    privilege_violations: 5,
    bulk_lookup_anomalies: 12,
    account_modifications: 3,
    employees_monitored: 30,
    linked_financial_alerts: 5,
  },
  behaviour_anomalies: {
    off_hours: 0,
    bulk_lookup: 12,
    overrides: 5,
    kyc_edits: 3,
    limit_changes: 2,
  },
  top_deviations: [
    {
      employee_id: 'EMP-017',
      role: 'Teller',
      deviation_sigma: '+3.8σ',
      lookups: 220,
      peer_mean: 165,
    },
    {
      employee_id: 'EMP-022',
      role: 'Operations Analyst',
      deviation_sigma: '+3.2σ',
      lookups: 215,
      peer_mean: 165,
    },
    {
      employee_id: 'EMP-013',
      role: 'Branch Manager',
      deviation_sigma: '+2.1σ',
      lookups: 211,
      peer_mean: 165,
    },
  ],
  branch_risk: {
    'BR-01': {
      name: 'Metro Flagship Downtown',
      risk: 'CRITICAL',
      active_alerts: 8,
      anomalies: 92,
    },
    'BR-02': {
      name: 'Suburban Financial Hub',
      risk: 'HIGH',
      active_alerts: 3,
      anomalies: 45,
    },
    'BR-03': {
      name: 'Commercial Port Quarter',
      risk: 'MEDIUM',
      active_alerts: 2,
      anomalies: 30,
    },
    'BR-04': {
      name: 'East District Express',
      risk: 'LOW',
      active_alerts: 1,
      anomalies: 18,
    },
  },
  employee_table: [
    {
      employee_id: 'EMP-017',
      pseudonym_id: 'P-EMP-017',
      role: 'Teller',
      branch_id: 'BR-01',
      risk: 'CRITICAL',
      access_count: 220,
      modifications: 2,
      overrides: 1,
      off_hours: 0,
      linked_alerts_count: 5,
      deviation_sigma: '+3.8σ',
    },
    {
      employee_id: 'EMP-022',
      pseudonym_id: 'P-EMP-022',
      role: 'Operations Analyst',
      branch_id: 'BR-02',
      risk: 'HIGH',
      access_count: 215,
      modifications: 0,
      overrides: 0,
      off_hours: 0,
      linked_alerts_count: 1,
      deviation_sigma: '+3.2σ',
    },
    {
      employee_id: 'EMP-013',
      pseudonym_id: 'P-EMP-013',
      role: 'Branch Manager',
      branch_id: 'BR-01',
      risk: 'MEDIUM',
      access_count: 211,
      modifications: 1,
      overrides: 0,
      off_hours: 0,
      linked_alerts_count: 1,
      deviation_sigma: '+2.1σ',
    },
    {
      employee_id: 'EMP-002',
      pseudonym_id: 'P-EMP-002',
      role: 'Teller',
      branch_id: 'BR-01',
      risk: 'LOW',
      access_count: 202,
      modifications: 0,
      overrides: 0,
      off_hours: 0,
      linked_alerts_count: 0,
      deviation_sigma: '+0.9σ',
    },
  ],
};

export const MOCK_COMPLIANCE_DASHBOARD: DashboardComplianceData = {
  kpis: {
    detection_rate: 100.0,
    precision: 70.0,
    recall: 100.0,
    false_positive_rate: 9.4,
    open_cases: 2,
    escalated_cases: 1,
    average_resolution_days: '3.8 days',
    evidence_exports: 14,
  },
  case_pipeline: {
    detected: 392,
    open: 389,
    in_review: 2,
    escalated: 1,
    resolved: 14,
  },
  detector_performance: [
    { detector: 'Circular Transfer', precision: '85.7%', recall: '100.0%', f1: '92.3%', fpr: '2.1%' },
    { detector: 'Structuring / Smurfing', precision: '75.0%', recall: '100.0%', f1: '85.7%', fpr: '4.3%' },
    { detector: 'Rapid Passthrough', precision: '68.2%', recall: '95.0%', f1: '79.4%', fpr: '6.8%' },
    { detector: 'Action-Transaction Link', precision: '92.0%', recall: '100.0%', f1: '95.8%', fpr: '1.2%' },
    { detector: 'Out of Role Access', precision: '88.5%', recall: '100.0%', f1: '93.9%', fpr: '1.8%' },
  ],
  ablation: {
    baseline_financial_only: {
      precision: 0.4167,
      recall: 0.7143,
      f1: 0.5263,
      fpr: 0.2188,
    },
    ours_financial_and_insider: {
      precision: 0.7,
      recall: 1.0,
      f1: 0.8235,
      fpr: 0.0938,
    },
    improvement_f1_delta: 0.2972,
    improvement_fpr_reduction: 0.125,
  },
  evidence_integrity: {
    total_exports: 14,
    verified: 14,
    pending: 0,
    failed_verification: 0,
    last_verification: '2026-09-29T21:30:00Z',
    integrity_status: '100% Cryptographically Verified (RFC 8785 + SHA-256)',
  },
  benchmark_label: 'InsiderTrace Quantitative Ground-Truth Benchmark (30 Isolated Scenarios)',
};

export const MOCK_ALERTS: AlertListItem[] = [
  {
    id: 'ALERT-81F9677A',
    tier: 'CRITICAL',
    title: 'CRITICAL: Insider Linked Risk — Employee EMP-017 & Account ACC-0231',
    summary: 'Alert classified as CRITICAL because insider activity by employee(s) EMP-017 directly intersected with suspicious financial patterns on account(s) ACC-0231, ACC-0442, ACC-0553. Detected 3-hop circular money flow (~₹480,000). Rapid mule pass-through dissipated 95.8% within 0.5 hours.',
    primary_signal: 'CIRCULAR_TRANSFER',
    employee_id: 'EMP-017',
    account_id: 'ACC-0231',
    status: 'OPEN',
    created_at: '2026-09-29T13:54:10.620198',
    updated_at: '2026-09-29T13:54:10.620198',
  },
  {
    id: 'ALERT-2CA81F41',
    tier: 'CRITICAL',
    title: 'CRITICAL: Insider Linked Risk — Employee EMP-017 & Account ACC-9738FFBB',
    summary: 'Alert classified as CRITICAL because insider activity by employee(s) EMP-017 directly intersected with suspicious financial patterns on account(s) ACC-9738FFBB. Customer conducted transactions totaling ₹1,000,000 (28.6x declared monthly income). Employee executed unauthorized action OVERRIDE.',
    primary_signal: 'ACTION_TRANSACTION_LINK',
    employee_id: 'EMP-017',
    account_id: 'ACC-9738FFBB',
    status: 'OPEN',
    created_at: '2026-09-29T13:54:10.827298',
    updated_at: '2026-09-29T13:54:10.827298',
  },
  {
    id: 'ALERT-B78BB63B',
    tier: 'CRITICAL',
    title: 'CRITICAL: Insider Linked Risk — Employee EMP-017 & Account ACC-0442',
    summary: 'Alert classified as CRITICAL: Corroborated 3-hop circular flow (ACC-0442 → ACC-0553 → ACC-0231 → ACC-0442) following unauthorized limit override by EMP-017.',
    primary_signal: 'CIRCULAR_TRANSFER',
    employee_id: 'EMP-017',
    account_id: 'ACC-0442',
    status: 'IN_REVIEW',
    created_at: '2026-09-29T07:35:49.258508',
    updated_at: '2026-09-29T07:35:49.258508',
  },
  {
    id: 'ALERT-FFB1388A',
    tier: 'HIGH',
    title: 'HIGH: Financial Anomaly (Structuring) on Account ACC-9B2D1396',
    summary: 'Account executed 3 transactions just below threshold (₹50,000.00) totaling ₹144,500.00 within 0.5 hours to evade AML reporting thresholds.',
    primary_signal: 'STRUCTURING',
    employee_id: undefined,
    account_id: 'ACC-9B2D1396',
    status: 'OPEN',
    created_at: '2026-09-29T13:54:10.623345',
    updated_at: '2026-09-29T13:54:10.623345',
  },
  {
    id: 'ALERT-B87776B0',
    tier: 'HIGH',
    title: 'HIGH: Financial Anomaly (Structuring) on Account ACC-7701',
    summary: 'Account ACC-7701 executed 4 transactions just below threshold (₹50,000.00) totaling ₹194,400.00 within 1.3 hours to 2 recipient accounts.',
    primary_signal: 'STRUCTURING',
    employee_id: undefined,
    account_id: 'ACC-7701',
    status: 'OPEN',
    created_at: '2026-09-29T13:54:10.622412',
    updated_at: '2026-09-29T13:54:10.622412',
  },
  {
    id: 'ALERT-2E823B28',
    tier: 'HIGH',
    title: 'HIGH: Financial Anomaly (Circular Transfer) on Account ACC-8802',
    summary: 'Detected 3-hop circular money flow (ACC-8802 → ACC-8803 → ACC-8801 → ACC-8802). Total amount ~₹85,000.00 circulated through 3 accounts within 1.1 hours.',
    primary_signal: 'CIRCULAR_TRANSFER',
    employee_id: undefined,
    account_id: 'ACC-8801',
    status: 'OPEN',
    created_at: '2026-09-29T13:54:10.621339',
    updated_at: '2026-09-29T13:54:10.621339',
  },
  {
    id: 'ALERT-3299F657',
    tier: 'HIGH',
    title: 'HIGH: Financial Anomaly (Structuring) on Account ACC-7701',
    summary: 'Account executed rapid smurfing structure to split ₹200,000 across multiple mule targets.',
    primary_signal: 'STRUCTURING',
    employee_id: undefined,
    account_id: 'ACC-7701',
    status: 'ESCALATED',
    created_at: '2026-09-29T07:35:49.260000',
    updated_at: '2026-09-29T07:35:49.260000',
  },
];

export const MOCK_GRAPH_DATA: GraphData = {
  elements: {
    nodes: [
      {
        data: {
          id: 'EMP-017',
          label: 'EMP-017 (Teller)',
          type: 'employee',
          risk: 'CRITICAL',
          sublabel: 'Role: Teller | Branch: BR-01',
          properties: { role: 'Teller', branch: 'BR-01', is_suspicious: true },
        },
      },
      {
        data: {
          id: 'ACC-0231',
          label: 'ACC-0231 (Victim)',
          type: 'account',
          risk: 'CRITICAL',
          sublabel: 'Savings | Limit: ₹50,000',
          properties: { account_type: 'SAVINGS', daily_limit: 50000 },
        },
      },
      {
        data: {
          id: 'ACC-0442',
          label: 'ACC-0442 (Mule 1)',
          type: 'account',
          risk: 'CRITICAL',
          sublabel: 'Savings | Limit: ₹500,000',
          properties: { account_type: 'SAVINGS', daily_limit: 500000 },
        },
      },
      {
        data: {
          id: 'ACC-0553',
          label: 'ACC-0553 (Mule 2)',
          type: 'account',
          risk: 'CRITICAL',
          sublabel: 'Savings | Limit: ₹500,000',
          properties: { account_type: 'SAVINGS', daily_limit: 500000 },
        },
      },
      {
        data: {
          id: 'TX-01',
          label: 'TX: ₹4,80,000',
          type: 'transaction',
          risk: 'CRITICAL',
          sublabel: 'NEFT Transfer',
          properties: { amount: 480000, channel: 'NEFT' },
        },
      },
      {
        data: {
          id: 'TX-02',
          label: 'TX: ₹4,60,000',
          type: 'transaction',
          risk: 'CRITICAL',
          sublabel: 'RTGS Transfer',
          properties: { amount: 460000, channel: 'RTGS' },
        },
      },
      {
        data: {
          id: 'TX-03',
          label: 'TX: ₹4,50,000',
          type: 'transaction',
          risk: 'CRITICAL',
          sublabel: 'UPI Transfer',
          properties: { amount: 450000, channel: 'UPI' },
        },
      },
    ],
    edges: [
      {
        data: {
          id: 'EMP-017->ACC-0231-OVERRIDE',
          source: 'EMP-017',
          target: 'ACC-0231',
          relationship: 'OVERRIDE',
          type: 'OVERRIDE',
          label: 'Daily Limit Override',
          timestamp: '2026-09-29T10:14:00',
        },
      },
      {
        data: {
          id: 'EMP-017->ACC-0231-PARAM',
          source: 'EMP-017',
          target: 'ACC-0231',
          relationship: 'MODIFY_PHONE',
          type: 'PARAM_CHANGE',
          label: 'Phone Number Changed',
          timestamp: '2026-09-29T10:16:00',
        },
      },
      {
        data: {
          id: 'ACC-0231->ACC-0442-TRANSFER',
          source: 'ACC-0231',
          target: 'ACC-0442',
          relationship: 'TRANSFER',
          type: 'TRANSFER',
          label: '₹4,80,000 (NEFT)',
          amount: 480000,
          timestamp: '2026-09-29T10:30:00',
        },
      },
      {
        data: {
          id: 'ACC-0442->ACC-0553-TRANSFER',
          source: 'ACC-0442',
          target: 'ACC-0553',
          relationship: 'TRANSFER',
          type: 'TRANSFER',
          label: '₹4,60,000 (RTGS)',
          amount: 460000,
          timestamp: '2026-09-29T10:48:00',
        },
      },
      {
        data: {
          id: 'ACC-0553->ACC-0231-TRANSFER',
          source: 'ACC-0553',
          target: 'ACC-0231',
          relationship: 'TRANSFER',
          type: 'TRANSFER',
          label: '₹4,50,000 (UPI)',
          amount: 450000,
          timestamp: '2026-09-29T11:15:00',
        },
      },
    ],
  },
  highlighted_path: ['EMP-017', 'ACC-0231', 'ACC-0442', 'ACC-0553', 'ACC-0231'],
  focus_entities: ['EMP-017', 'ACC-0231'],
  total_nodes: 7,
  total_edges: 5,
};

export const MOCK_TIMELINE: TimelineItem[] = [
  {
    id: 'TL-01',
    timestamp: '2026-09-29T10:14:00',
    event_type: 'ACCESS_LOG',
    actor: 'EMP-017 (Teller)',
    account_id: 'ACC-0231',
    description: 'Teller EMP-017 viewed victim account profile and contact details without active customer ticket.',
    severity: 'MEDIUM',
    time_delta_display: 'T+0m',
  },
  {
    id: 'TL-02',
    timestamp: '2026-09-29T10:16:00',
    event_type: 'ACCOUNT_CHANGE',
    actor: 'EMP-017 (Teller)',
    account_id: 'ACC-0231',
    description: 'Security contact mobile phone changed from +91-9876543210 to burner SIM +91-9123456789 without dual OTP sign-off.',
    severity: 'HIGH',
    time_delta_display: 'T+2m',
  },
  {
    id: 'TL-03',
    timestamp: '2026-09-29T10:18:00',
    event_type: 'ACCOUNT_CHANGE',
    actor: 'EMP-017 (Teller)',
    account_id: 'ACC-0231',
    description: 'Daily transfer limit boosted from ₹50,000 to ₹10,00,000 via emergency override.',
    severity: 'CRITICAL',
    time_delta_display: 'T+4m',
  },
  {
    id: 'TL-04',
    timestamp: '2026-09-29T10:30:00',
    event_type: 'TRANSACTION',
    actor: 'ACC-0231',
    account_id: 'ACC-0231',
    target_id: 'ACC-0442',
    amount: 480000,
    description: 'Immediate outbound NEFT transfer of ₹4,80,000 to intermediate mule account ACC-0442.',
    severity: 'CRITICAL',
    time_delta_display: 'T+16m',
  },
  {
    id: 'TL-05',
    timestamp: '2026-09-29T10:48:00',
    event_type: 'TRANSACTION',
    actor: 'ACC-0442',
    account_id: 'ACC-0442',
    target_id: 'ACC-0553',
    amount: 460000,
    description: 'Mule passthrough: 95.8% of inbound funds drained via RTGS to ACC-0553 within 18 minutes.',
    severity: 'CRITICAL',
    time_delta_display: 'T+34m',
  },
  {
    id: 'TL-06',
    timestamp: '2026-09-29T11:15:00',
    event_type: 'TRANSACTION',
    actor: 'ACC-0553',
    account_id: 'ACC-0553',
    target_id: 'ACC-0231',
    amount: 450000,
    description: 'Circular laundering loop closed: ₹4,50,000 returned to originator account ACC-0231 via UPI.',
    severity: 'CRITICAL',
    time_delta_display: 'T+1h 1m',
  },
];

export const MOCK_ALERT_DETAILS: Record<string, AlertDetail> = {
  'ALERT-81F9677A': {
    id: 'ALERT-81F9677A',
    tier: 'CRITICAL',
    title: 'CRITICAL: Insider Linked Risk — Employee EMP-017 & Account ACC-0231',
    status: 'OPEN',
    summary: 'Alert classified as CRITICAL because insider activity by employee(s) EMP-017 directly intersected with suspicious financial patterns on account(s) ACC-0231, ACC-0442, ACC-0553. Evidence shows: Detected 3-hop circular money flow (ACC-0231 → ACC-0442 → ACC-0553 → ACC-0231). Total amount ~₹480,000 circulated within 0.9 hours.',
    entity_ids: ['EMP-017', 'ACC-0231', 'ACC-0442', 'ACC-0553'],
    signal_ids: ['SIG-01', 'SIG-02', 'SIG-03', 'SIG-04', 'SIG-05'],
    created_at: '2026-09-29T13:54:10.620198',
    updated_at: '2026-09-29T13:54:10.620198',
    evidence: [],
    rule_trace: {
      rules: [
        {
          rule: 'CRIT_INSIDER_LINK_CIRCULAR',
          name: 'Insider Action Linked to Circular Transfer Ring',
          matched: true,
          signals: ['SIG-01', 'SIG-02', 'SIG-03', 'SIG-04', 'SIG-05'],
          entities: ['EMP-017', 'ACC-0231', 'ACC-0442', 'ACC-0553'],
          description: 'Critical linked risk: An insider intervention was followed by circular fund movement.',
        },
      ],
      human_explanation: 'Alert classified as CRITICAL because insider activity by employee(s) EMP-017 directly intersected with suspicious financial patterns on account(s) ACC-0231, ACC-0442, ACC-0553. Evidence shows: Detected 3-hop circular money flow (ACC-0231 → ACC-0442 → ACC-0553 → ACC-0231). Total amount ~₹480,000.00 circulated through 3 accounts within 0.9 hours. Concurrently: Account ACC-0442 exhibited rapid mule/pass-through activity: received ₹480,000.00 from ACC-0231 and transferred out ₹460,000.00 (95.8%) to ACC-0553 within 0.5 hours, retaining minimal balance.',
      risk_factors: {
        insider_privilege_risk: {
          level: 'HIGH',
          score: 40,
          title: 'Insider Privilege & Policy Misuse',
          indicators: [
            'Employee performed unauthorized operations outside assigned RBAC permissions or branch jurisdiction.',
          ],
        },
        money_flow_topology_risk: {
          level: 'CRITICAL',
          score: 90,
          title: 'Money-Flow Topology & Laundering Patterns',
          indicators: [
            'Directed multi-hop circular transfer loop detected returning funds to originator or mule ring.',
            'Mule account behavior: Inbound lump-sum dissipated > 85% within 4 hours.',
          ],
        },
        profile_kyc_mismatch_risk: {
          level: 'CRITICAL',
          score: 85,
          title: 'Customer Profile & KYC Alignment',
          indicators: [
            'Payment volume significantly exceeds customer occupation profile and monthly income ceiling.',
            "Security contact field 'phone' modified immediately prior to outbound transfer.",
          ],
        },
        causal_temporal_linkage_risk: {
          level: 'CRITICAL',
          score: 90,
          title: 'Causal Action-Transaction Temporal Linkage',
          indicators: [
            'Direct causal sequence: Internal employee parameter modification followed by rapid outbound fund dissipation.',
            'High temporal proximity: Transactions executed in tight temporal window following employee EMP-017 action.',
          ],
        },
        network_exposure_risk: {
          level: 'HIGH',
          score: 85,
          title: 'Network Exposure & Blast Radius',
          indicators: [
            'Broad network exposure: Alert cluster links 3 accounts and 1 internal operators.',
          ],
        },
      },
    },
    counterfactual: {
      condition_changed: 'Simulated employee access as fully authorized within role/shift (removed OUT_OF_ROLE_ACCESS, ACTION_TRANSACTION_LINK)',
      original_tier: 'CRITICAL',
      counterfactual_tier: 'HIGH',
      explanation: 'If the employee\'s access had been within permitted role and branch jurisdiction with dual-authorization, the cross-domain insider linkage would be severed. The alert severity would decrease from CRITICAL to HIGH.',
    },
    evidence_record_ids: ['CHG-DEMO-01', 'CHG-DEMO-02', 'LOG-DEMO-02', 'TX-DEMO-01', 'TX-DEMO-02', 'TX-DEMO-03'],
    graph_snapshot: MOCK_GRAPH_DATA,
    timeline_snapshot: MOCK_TIMELINE,
  },
  'ALERT-2CA81F41': {
    id: 'ALERT-2CA81F41',
    tier: 'CRITICAL',
    title: 'CRITICAL: Insider Linked Risk — Employee EMP-017 & Account ACC-9738FFBB',
    status: 'OPEN',
    summary: 'Alert classified as CRITICAL because insider activity by employee(s) EMP-017 directly intersected with suspicious financial patterns on account(s) ACC-9738FFBB. Customer CUST-346352AF (Account ACC-9738FFBB) with declared income of ₹35,000/month conducted transactions totaling ₹1,000,000 (28.6x declared monthly income). Concurrently: Employee EMP-017 executed unauthorized action OVERRIDE.',
    entity_ids: ['EMP-017', 'ACC-9738FFBB'],
    signal_ids: ['SIG-201', 'SIG-202'],
    created_at: '2026-09-29T13:54:10.827298',
    updated_at: '2026-09-29T13:54:10.827298',
    evidence: [],
    rule_trace: {
      rules: [
        {
          rule: 'CRIT_INSIDER_LINK_OVERRIDE',
          name: 'Managerial Override Followed by Rapid Dissipation',
          matched: true,
          signals: ['SIG-201', 'SIG-202'],
          entities: ['EMP-017', 'ACC-9738FFBB'],
          description: 'Critical linked risk: An unauthorized override directly enabled massive fund transfers.',
        },
      ],
      human_explanation: 'Employee EMP-017 executed an unauthorized emergency override on ACC-9738FFBB without ticketing approval. Within 14 minutes, outbound RTGS transfers totaling ₹1,000,000 were executed to unverified external accounts.',
      risk_factors: {
        insider_privilege_risk: {
          level: 'CRITICAL',
          score: 95,
          title: 'Insider Privilege & Policy Misuse',
          indicators: ['Unauthorized OVERRIDE action without dual authentication.'],
        },
        money_flow_topology_risk: {
          level: 'HIGH',
          score: 80,
          title: 'Money-Flow Topology & Laundering Patterns',
          indicators: ['Outbound volume exceeds 28x account monthly average.'],
        },
        profile_kyc_mismatch_risk: {
          level: 'CRITICAL',
          score: 90,
          title: 'Customer Profile & KYC Alignment',
          indicators: ['Transaction amount 28.6x declared income ceiling.'],
        },
        causal_temporal_linkage_risk: {
          level: 'CRITICAL',
          score: 95,
          title: 'Causal Action-Transaction Temporal Linkage',
          indicators: ['Transfer executed 14 minutes post-override.'],
        },
        network_exposure_risk: {
          level: 'MEDIUM',
          score: 65,
          title: 'Network Exposure & Blast Radius',
          indicators: ['Single customer account linked to branch BR-01.'],
        },
      },
    },
    counterfactual: {
      condition_changed: 'Simulated employee access as fully authorized within role/shift',
      original_tier: 'CRITICAL',
      counterfactual_tier: 'HIGH',
      explanation: 'If the employee held Branch Manager authority, the insider privilege misuse factor would not trigger, reducing alert tier to HIGH.',
    },
    evidence_record_ids: ['LOG-201', 'TX-201', 'TX-202'],
    graph_snapshot: MOCK_GRAPH_DATA,
    timeline_snapshot: MOCK_TIMELINE,
  },
};

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-017',
    pseudonym_id: 'P-EMP-017',
    role_id: 'ROLE-TELLER',
    branch_id: 'BR-01',
    normal_work_start: '09:00',
    normal_work_end: '18:00',
    status: 'ACTIVE',
  },
  {
    id: 'EMP-022',
    pseudonym_id: 'P-EMP-022',
    role_id: 'ROLE-OPS',
    branch_id: 'BR-02',
    normal_work_start: '09:00',
    normal_work_end: '18:00',
    status: 'ACTIVE',
  },
  {
    id: 'EMP-001',
    pseudonym_id: 'P-EMP-001',
    role_id: 'ROLE-OPS',
    branch_id: 'BR-04',
    normal_work_start: '09:00',
    normal_work_end: '18:00',
    status: 'ACTIVE',
  },
  {
    id: 'EMP-002',
    pseudonym_id: 'P-EMP-002',
    role_id: 'ROLE-TELLER',
    branch_id: 'BR-01',
    normal_work_start: '09:00',
    normal_work_end: '18:00',
    status: 'ACTIVE',
  },
  {
    id: 'EMP-003',
    pseudonym_id: 'P-EMP-003',
    role_id: 'ROLE-BM',
    branch_id: 'BR-03',
    normal_work_start: '09:00',
    normal_work_end: '18:00',
    status: 'ACTIVE',
  },
];

export const MOCK_BLAST_RADIUS: Record<string, EmployeeBlastRadius> = {
  'EMP-017': {
    employee: MOCK_EMPLOYEES[0],
    role_name: 'Teller',
    accounts_touched: ['ACC-0231', 'ACC-0442', 'ACC-0553', 'ACC-9738FFBB'],
    customers_touched: ['CUST-0011', 'CUST-0012', 'CUST-0013', 'CUST-346352AF'],
    devices_used: ['TERM-BR01-04', 'TERM-BR01-09'],
    actions_performed: { VIEW: 14, EDIT: 2, OVERRIDE: 1 },
    transactions_following_actions: [
      {
        transaction_id: 'TX-01',
        from_account: 'ACC-0231',
        to_account: 'ACC-0442',
        amount: 480000,
        channel: 'NEFT',
        timestamp: '2026-09-29T10:30:00',
      },
    ],
    alerts_involved: ['ALERT-81F9677A', 'ALERT-2CA81F41', 'ALERT-B78BB63B'],
    suspicious_accounts: ['ACC-0231', 'ACC-0442'],
    risk_clusters: [
      {
        cluster_name: 'Metro Flagship Laundering Nexus',
        accounts: ['ACC-0231', 'ACC-0442', 'ACC-0553'],
        alerts: ['ALERT-81F9677A', 'ALERT-B78BB63B'],
      },
    ],
    timeline: MOCK_TIMELINE,
    total_actions_count: 17,
    risk_level: 'CRITICAL',
  },
};

export const MOCK_ACCOUNTS = [
  {
    id: 'ACC-0231',
    customer_id: 'CUST-0011',
    account_type: 'SAVINGS',
    branch_id: 'BR-01',
    status: 'ACTIVE',
    daily_limit: 50000.0,
    currency: 'INR',
    opened_at: '2026-02-13T00:00:00',
  },
  {
    id: 'ACC-0442',
    customer_id: 'CUST-0012',
    account_type: 'SAVINGS',
    branch_id: 'BR-01',
    status: 'ACTIVE',
    daily_limit: 500000.0,
    currency: 'INR',
    opened_at: '2026-05-04T00:00:00',
  },
  {
    id: 'ACC-0553',
    customer_id: 'CUST-0013',
    account_type: 'SAVINGS',
    branch_id: 'BR-02',
    status: 'ACTIVE',
    daily_limit: 500000.0,
    currency: 'INR',
    opened_at: '2026-06-03T00:00:00',
  },
  {
    id: 'ACC-PAYROLL-01',
    customer_id: 'CUST-0001',
    account_type: 'PAYROLL',
    branch_id: 'BR-01',
    status: 'ACTIVE',
    daily_limit: 5000000.0,
    currency: 'INR',
    opened_at: '2025-07-28T00:00:00',
  },
  {
    id: 'ACC-8801',
    customer_id: 'CUST-0021',
    account_type: 'SAVINGS',
    branch_id: 'BR-03',
    status: 'ACTIVE',
    daily_limit: 500000.0,
    currency: 'INR',
    opened_at: '2026-09-29T07:35:33',
  },
];

export const MOCK_TRANSACTIONS = [
  {
    id: 'TX-007488',
    from_account_id: 'ACC-0034',
    to_account_id: 'ACC-0165',
    amount: 3144.13,
    currency: 'INR',
    channel: 'NEFT',
    timestamp: '2026-09-29T20:59:00',
    status: 'COMPLETED',
  },
  {
    id: 'TX-011334',
    from_account_id: 'ACC-0276',
    to_account_id: 'ACC-0074',
    amount: 6771.46,
    currency: 'INR',
    channel: 'BRANCH',
    timestamp: '2026-09-29T20:56:00',
    status: 'COMPLETED',
  },
  {
    id: 'TX-006517',
    from_account_id: 'ACC-0454',
    to_account_id: 'ACC-0065',
    amount: 13777.83,
    currency: 'INR',
    channel: 'INTERNAL',
    timestamp: '2026-09-29T20:55:00',
    status: 'COMPLETED',
  },
  {
    id: 'TX-000965',
    from_account_id: 'ACC-0567',
    to_account_id: 'ACC-0260',
    amount: 1623.46,
    currency: 'INR',
    channel: 'INTERNAL',
    timestamp: '2026-09-29T20:54:00',
    status: 'COMPLETED',
  },
  {
    id: 'TX-013797',
    from_account_id: 'ACC-0408',
    to_account_id: 'ACC-0272',
    amount: 1116.04,
    currency: 'INR',
    channel: 'RTGS',
    timestamp: '2026-09-29T20:53:00',
    status: 'COMPLETED',
  },
];

let inMemoryCases: Case[] = [
  {
    id: 'CASE-F54E2840',
    alert_id: 'ALERT-3299F657',
    title: 'HIGH: Financial Anomaly (Structuring) on Account ACC-7701',
    assignee_id: 'Senior Investigator Ananya Rao (Insider Risk)',
    assigned_to: 'Senior Investigator Ananya Rao (Insider Risk)',
    status: 'ESCALATED',
    priority: 'HIGH',
    notes: [
      {
        author: 'SYSTEM_INIT',
        text: 'Bulk customer lookup pattern deviation exceeding peer group baseline (z-score > 3.0).',
        timestamp: '2026-09-29T07:35:49.513810Z',
      },
    ],
    closure_reason: undefined,
    created_at: '2026-09-29T07:35:49.513819',
    updated_at: '2026-09-29T07:35:49.514705',
  },
  {
    id: 'CASE-8FE2B171',
    alert_id: 'ALERT-7A19086C',
    title: 'HIGH: Financial Anomaly (Circular Transfer) on Account ACC-8803',
    assignee_id: 'Reviewer Vikram Seth (AML Review)',
    assigned_to: 'Reviewer Vikram Seth (AML Review)',
    status: 'OPEN',
    priority: 'HIGH',
    notes: [
      {
        author: 'SYSTEM_INIT',
        text: 'Action-transaction link verified on target account. Pending customer outreach.',
        timestamp: '2026-09-29T07:35:49.512561Z',
      },
    ],
    closure_reason: undefined,
    created_at: '2026-09-29T07:35:49.512573',
    updated_at: '2026-09-29T07:35:49.512573',
  },
  {
    id: 'CASE-47D9D754',
    alert_id: 'ALERT-B78BB63B',
    title: 'CRITICAL: Insider Linked Risk — Employee EMP-017 & Account ACC-0442',
    assignee_id: 'Analyst Priya Sharma (Fraud Ops)',
    assigned_to: 'Analyst Priya Sharma (Fraud Ops)',
    status: 'IN_REVIEW',
    priority: 'CRITICAL',
    notes: [
      {
        author: 'SYSTEM_INIT',
        text: 'Corroborated multi-hop circular flow following unauthorized override. Escalating to AML review.',
        timestamp: '2026-09-29T07:35:49.506023Z',
      },
    ],
    closure_reason: undefined,
    created_at: '2026-09-29T07:35:49.506045',
    updated_at: '2026-09-29T07:35:49.510997',
  },
];

export const MOCK_EVALUATION: EvaluationData = {
  overall: {
    tp: 7,
    tn: 29,
    fp: 3,
    fn: 0,
    precision: 0.7,
    recall: 1.0,
    f1: 0.8235,
    fpr: 0.0938,
    detection_rate: 1.0,
  },
  ablation: {
    baseline_financial_only: {
      precision: 0.4167,
      recall: 0.7143,
      f1: 0.5263,
      fpr: 0.2188,
    },
    ours_financial_and_insider: {
      precision: 0.7,
      recall: 1.0,
      f1: 0.8235,
      fpr: 0.0938,
    },
    improvement_f1_delta: 0.2972,
    improvement_fpr_reduction: 0.125,
  },
  hard_negatives: {
    total_hard_negatives: 32,
    false_positives: 3,
    true_negatives: 29,
    fp_rate: 0.0938,
    scenarios_tested: ['payroll_legitimate', 'hard_negative_rent'],
  },
  scenario_breakdown: {
    insider_collusion: { total: 1, detected: 1, rate: 1.0 },
    circular: { total: 5, detected: 5, rate: 1.0 },
    structuring: { total: 1, detected: 1, rate: 1.0 },
  },
};

/**
 * Universal Mock Fallback Router
 * Returns realistic scenario data when the backend API is unreachable or responds with 404 (e.g. Vercel unrouted SPA)
 */
export function getMockFallback<T>(endpoint: string, options?: RequestInit): T | undefined {
  const cleanPath = endpoint.split('?')[0];

  // Dashboards
  if (cleanPath === '/dashboard/fraud') {
    return MOCK_FRAUD_DASHBOARD as unknown as T;
  }
  if (cleanPath === '/dashboard/alerts/trend') {
    return MOCK_ALERT_TREND as unknown as T;
  }
  if (cleanPath === '/dashboard/audit') {
    return MOCK_AUDIT_DASHBOARD as unknown as T;
  }
  if (cleanPath === '/dashboard/compliance') {
    return MOCK_COMPLIANCE_DASHBOARD as unknown as T;
  }

  // Alerts
  if (cleanPath === '/alerts') {
    return MOCK_ALERTS as unknown as T;
  }
  if (cleanPath.startsWith('/alerts/') && cleanPath.endsWith('/graph')) {
    return MOCK_GRAPH_DATA as unknown as T;
  }
  if (cleanPath.startsWith('/alerts/') && cleanPath.endsWith('/timeline')) {
    return { events: MOCK_TIMELINE } as unknown as T;
  }
  if (cleanPath.startsWith('/alerts/')) {
    const alertId = cleanPath.replace('/alerts/', '');
    const found = MOCK_ALERT_DETAILS[alertId];
    if (found) return found as unknown as T;
    // Default fallback to first detailed alert
    return { ...MOCK_ALERT_DETAILS['ALERT-81F9677A'], id: alertId } as unknown as T;
  }

  // Cases
  if (cleanPath === '/cases') {
    if (options?.method === 'POST') {
      try {
        const body = JSON.parse(options.body as string);
        const newCase: Case = {
          id: `CASE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          alert_id: body.alert_id || 'ALERT-81F9677A',
          title: body.title || 'New Case Investigation',
          priority: body.priority || 'HIGH',
          status: 'OPEN',
          assigned_to: body.assigned_to || 'Analyst Priya Sharma (Fraud Ops)',
          assignee_id: body.assigned_to || 'Analyst Priya Sharma (Fraud Ops)',
          notes: body.notes ? [{ author: 'ANALYST-01', text: body.notes, timestamp: new Date().toISOString() }] : [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        inMemoryCases = [newCase, ...inMemoryCases];
        return newCase as unknown as T;
      } catch {
        // Fallback
      }
    }
    return inMemoryCases as unknown as T;
  }

  if (cleanPath.startsWith('/cases/') && cleanPath.endsWith('/notes')) {
    return { message: 'Note added successfully' } as unknown as T;
  }

  if (cleanPath.startsWith('/cases/')) {
    const caseId = cleanPath.replace('/cases/', '');
    if (options?.method === 'PATCH') {
      try {
        const body = JSON.parse(options.body as string);
        const existing = inMemoryCases.find((c) => c.id === caseId);
        if (existing) {
          Object.assign(existing, body, { updated_at: new Date().toISOString() });
          return existing as unknown as T;
        }
      } catch {
        // Fallback
      }
    }
    const found = inMemoryCases.find((c) => c.id === caseId);
    return (found || inMemoryCases[0]) as unknown as T;
  }

  // Employees
  if (cleanPath === '/employees') {
    return MOCK_EMPLOYEES as unknown as T;
  }
  if (cleanPath.startsWith('/employees/') && cleanPath.endsWith('/blast-radius')) {
    const empId = cleanPath.split('/')[2];
    return (MOCK_BLAST_RADIUS[empId] || MOCK_BLAST_RADIUS['EMP-017']) as unknown as T;
  }
  if (cleanPath.startsWith('/employees/')) {
    const empId = cleanPath.replace('/employees/', '');
    const found = MOCK_EMPLOYEES.find((e) => e.id === empId);
    return (found || MOCK_EMPLOYEES[0]) as unknown as T;
  }

  // Accounts & Transactions
  if (cleanPath === '/accounts') {
    return MOCK_ACCOUNTS as unknown as T;
  }
  if (cleanPath.startsWith('/accounts/')) {
    const accId = cleanPath.replace('/accounts/', '');
    const found = MOCK_ACCOUNTS.find((a) => a.id === accId);
    return (found || MOCK_ACCOUNTS[0]) as unknown as T;
  }
  if (cleanPath === '/transactions') {
    return MOCK_TRANSACTIONS as unknown as T;
  }

  // Evaluation & Simulation
  if (cleanPath === '/evaluation/metrics' || cleanPath === '/evaluation/benchmark') {
    return MOCK_EVALUATION as unknown as T;
  }
  if (cleanPath === '/simulate') {
    return {
      status: 'SUCCESS',
      scenario_injected: 'CIRCULAR_TRANSFER',
      entities_generated: 4,
      transactions_created: 6,
      alert_id: 'ALERT-SIM-01',
      simulated_at: new Date().toISOString(),
    } as unknown as T;
  }

  // Evidence verification
  if (cleanPath === '/evidence/verify') {
    return {
      valid: true,
      calculated_hash: '8f9c2d1b7a6e4f305c48b1129487625149302e1c9f4b5a6c7d8e9f0a1b2c3d4e',
      message: 'Cryptographic SHA-256 fingerprint verified against RFC 8785 canonical JSON export.',
    } as unknown as T;
  }

  return undefined;
}
