import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from './types';
import { Shell } from './components/layout/Shell';

// Pages
import { FraudDashboard } from './pages/FraudDashboard';
import { AuditDashboard } from './pages/AuditDashboard';
import { ComplianceDashboard } from './pages/ComplianceDashboard';
import { InvestigationWorkspace } from './pages/InvestigationWorkspace';
import { AlertsPage } from './pages/AlertsPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import { BlastRadiusPage } from './pages/BlastRadiusPage';
import { AccountsPage } from './pages/AccountsPage';
import { CasesPage } from './pages/CasesPage';
import { EvidencePage } from './pages/EvidencePage';
import { EvaluationPage } from './pages/EvaluationPage';
import { SimulationPage } from './pages/SimulationPage';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('insidertrace_role');
    return (saved as UserRole) || 'FRAUD_ANALYST';
  });

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('insidertrace_role', role);
  };

  const getDefaultRedirect = () => {
    if (currentRole === 'FRAUD_ANALYST') return '/dashboard/fraud';
    if (currentRole === 'INTERNAL_AUDITOR') return '/dashboard/audit';
    return '/dashboard/compliance';
  };

  return (
    <BrowserRouter>
      <Shell currentRole={currentRole} onRoleChange={handleRoleChange}>
        <Routes>
          {/* Default Landing redirect based on active persona */}
          <Route path="/" element={<Navigate to={getDefaultRedirect()} replace />} />
          <Route path="/dashboard" element={<Navigate to={getDefaultRedirect()} replace />} />

          {/* 3 Major Dashboards */}
          <Route path="/dashboard/fraud" element={<FraudDashboard />} />
          <Route path="/dashboard/audit" element={<AuditDashboard />} />
          <Route path="/dashboard/compliance" element={<ComplianceDashboard />} />

          {/* Investigation Workspace (Shared & Deep Links) */}
          <Route path="/investigations" element={<InvestigationWorkspace />} />
          <Route path="/investigations/:id" element={<InvestigationWorkspace />} />
          <Route path="/alerts/:id" element={<InvestigationWorkspace />} />

          {/* Alert Queue */}
          <Route path="/alerts" element={<AlertsPage />} />

          {/* Staff Surveillance & Blast Radius */}
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/employees/:id/blast-radius" element={<BlastRadiusPage />} />

          {/* Accounts & Mules Ledger */}
          <Route path="/accounts" element={<AccountsPage />} />

          {/* Case Adjudication Operations */}
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:id" element={<CasesPage />} />

          {/* Evidence Integrity & SHA-256 Verification */}
          <Route path="/evidence" element={<EvidencePage />} />

          {/* Evaluation Benchmarks */}
          <Route path="/evaluation" element={<EvaluationPage />} />

          {/* Adversarial Red-Team Simulator */}
          <Route path="/simulation" element={<SimulationPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={getDefaultRedirect()} replace />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}

export default App;
