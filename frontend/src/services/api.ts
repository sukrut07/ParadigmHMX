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
  UserRole
} from '../types';

const API_BASE = '';

function getHeaders(role?: UserRole): HeadersInit {
  let backendRole = 'ANALYST';
  if (role === 'INTERNAL_AUDITOR' || role === 'AUDITOR') backendRole = 'AUDITOR';
  else if (role === 'COMPLIANCE_HEAD' || role === 'REVIEWER') backendRole = 'REVIEWER';
  else if (role === 'ADMIN') backendRole = 'ADMIN';
  else if (role === 'FRAUD_ANALYST' || role === 'ANALYST') backendRole = 'ANALYST';

  return {
    'Content-Type': 'application/json',
    'X-User-Role': backendRole,
    'X-User-Id': 'ANALYST-01',
  };
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || err.detail || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// Dashboard Endpoints
export async function getFraudDashboard(role: UserRole = 'FRAUD_ANALYST'): Promise<DashboardFraudData> {
  return request<DashboardFraudData>('/dashboard/fraud', { headers: getHeaders(role) });
}

export async function getAuditDashboard(role: UserRole = 'INTERNAL_AUDITOR'): Promise<DashboardAuditData> {
  return request<DashboardAuditData>('/dashboard/audit', { headers: getHeaders(role) });
}

export async function getComplianceDashboard(role: UserRole = 'COMPLIANCE_HEAD'): Promise<DashboardComplianceData> {
  return request<DashboardComplianceData>('/dashboard/compliance', { headers: getHeaders(role) });
}

export async function getAlertTrend(): Promise<{ date: string; CRITICAL: number; HIGH: number; MEDIUM: number; LOW: number; total: number }[]> {
  return request('/dashboard/alerts/trend');
}

// Alerts & Investigations
export async function getAlerts(params?: {
  tier?: string;
  status?: string;
  employee_id?: string;
  account_id?: string;
}): Promise<AlertListItem[]> {
  const query = new URLSearchParams();
  if (params?.tier) query.set('tier', params.tier);
  if (params?.status) query.set('status', params.status);
  if (params?.employee_id) query.set('employee_id', params.employee_id);
  if (params?.account_id) query.set('account_id', params.account_id);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  return request<AlertListItem[]>(`/alerts${qStr}`);
}

export async function getAlertDetail(alertId: string): Promise<AlertDetail> {
  return request<AlertDetail>(`/alerts/${alertId}`);
}

export async function getAlertGraph(alertId: string, depth: number = 2): Promise<GraphData> {
  return request<GraphData>(`/alerts/${alertId}/graph?depth=${depth}`);
}

export async function getAlertTimeline(alertId: string): Promise<TimelineItem[]> {
  const res = await request<{ events: TimelineItem[] }>(`/alerts/${alertId}/timeline`);
  return res.events || [];
}

// Employees & Blast Radius
export async function getEmployees(): Promise<Employee[]> {
  return request<Employee[]>('/employees');
}

export async function getEmployee(employeeId: string): Promise<Employee> {
  return request<Employee>(`/employees/${employeeId}`);
}

export async function getEmployeeBlastRadius(employeeId: string): Promise<EmployeeBlastRadius> {
  return request<EmployeeBlastRadius>(`/employees/${employeeId}/blast-radius`);
}

export async function unmaskEmployee(employeeId: string, reason: string): Promise<any> {
  return request(`/employees/${employeeId}/unmask`, {
    method: 'POST',
    headers: getHeaders('ADMIN'),
    body: JSON.stringify({ reason }),
  });
}

// Accounts & Mules
export async function getAccounts(params?: { branch_id?: string; account_type?: string; status?: string }): Promise<any[]> {
  const query = new URLSearchParams();
  if (params?.branch_id) query.set('branch_id', params.branch_id);
  if (params?.account_type) query.set('account_type', params.account_type);
  if (params?.status) query.set('status', params.status);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  return request<any[]>(`/accounts${qStr}`);
}

export async function getAccountDetail(accountId: string): Promise<any> {
  return request<any>(`/accounts/${accountId}`);
}


// Cases & Evidence
export async function getCases(status?: string): Promise<Case[]> {
  const q = status ? `?status=${status}` : '';
  return request<Case[]>(`/cases${q}`);
}

export async function getCase(caseId: string): Promise<Case> {
  return request<Case>(`/cases/${caseId}`);
}

export async function createCase(payload: {
  alert_id: string;
  title: string;
  priority?: string;
  assigned_to?: string;
  notes?: string;
}): Promise<Case> {
  return request<Case>('/cases', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateCase(caseId: string, payload: {
  status?: string;
  priority?: string;
  assigned_to?: string;
  closure_reason?: string;
}): Promise<Case> {
  return request<Case>(`/cases/${caseId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function addCaseNote(caseId: string, text: string): Promise<any> {
  return request(`/cases/${caseId}/notes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ text }),
  });
}

export async function exportCaseBundle(caseId: string, format: 'json' | 'pdf' = 'json'): Promise<any> {
  if (format === 'pdf') {
    const url = `/cases/${caseId}/export?format=pdf`;
    const res = await fetch(url, { headers: getHeaders('AUDITOR') });
    return await res.blob();
  }
  return request(`/cases/${caseId}/export?format=json`, { headers: getHeaders('AUDITOR') });
}

export async function verifyEvidence(bundle: any, hash: string): Promise<{ valid: boolean; calculated_hash: string; message: string }> {
  return request('/evidence/verify', {
    method: 'POST',
    headers: getHeaders('AUDITOR'),
    body: JSON.stringify({ bundle, hash }),
  });
}

// Evaluation & Simulation
export async function getEvaluation(): Promise<EvaluationData> {
  return request<EvaluationData>('/evaluation/metrics');
}

export async function simulateAttack(payload: {
  scenario_type: 'structuring' | 'circular' | 'rapid_passthrough' | 'insider_collusion';
  intensity?: number;
  mutate_structure?: boolean;
}): Promise<any> {
  return request('/simulate', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
}
