import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Building2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { getEmployees } from '../services/api';
import { Employee } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

export const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getEmployees();
      setEmployees(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employee registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        emp.id.toLowerCase().includes(q) ||
        emp.role_id.toLowerCase().includes(q) ||
        emp.branch_id.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (branchFilter && emp.branch_id !== branchFilter) return false;
    return true;
  });

  const branches = Array.from(new Set(employees.map((e) => e.branch_id))).filter(Boolean);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-indigo-400 uppercase">
              Staff Surveillance
            </span>
            <span className="text-xs text-slate-400">Pseudonymized Employee Registry</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-100">
            Monitored Bank Personnel
          </h1>
          <p className="text-xs text-slate-400">
            Internal audit profiling, peer deviation tracking, and access telemetry
          </p>
        </div>

        <button
          onClick={loadEmployees}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-slate-100 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee ID, role, branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs font-mono text-slate-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Tracking <strong>{filteredEmployees.length}</strong> personnel profiles
        </div>
      </div>

      {/* Employees Grid / Table */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              <span className="text-xs text-slate-400">Loading staff records...</span>
            </div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-6 text-center text-slate-400">
            <Users className="h-8 w-8 text-slate-500 mb-2" />
            <span className="text-sm font-semibold text-slate-300">No employee records found.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 pl-4">Employee ID</th>
                  <th className="py-3">Pseudonym</th>
                  <th className="py-3">Designation / Role</th>
                  <th className="py-3">Branch Location</th>
                  <th className="py-3">Normal Shift</th>
                  <th className="py-3">Surveillance Status</th>
                  <th className="py-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredEmployees.map((emp) => {
                  const isHighRisk = emp.id === 'EMP-017' || emp.id === 'EMP-022';
                  return (
                    <tr
                      key={emp.id}
                      onClick={() => navigate(`/employees/${emp.id}`)}
                      className="cursor-pointer transition-colors hover:bg-slate-800/40"
                    >
                      <td className="py-3.5 pl-4 font-bold text-indigo-400">
                        {emp.id}
                      </td>
                      <td className="py-3.5 text-slate-400 text-[11px]">{emp.pseudonym_id}</td>
                      <td className="py-3.5 font-sans font-medium text-slate-200">
                        {emp.role_id}
                      </td>
                      <td className="py-3.5 font-sans text-slate-300">
                        {emp.branch_id}
                      </td>
                      <td className="py-3.5 text-slate-400 text-[11px]">
                        {emp.normal_work_start} – {emp.normal_work_end}
                      </td>
                      <td className="py-3.5 font-sans">
                        {isHighRisk ? (
                          <RiskBadge tier="CRITICAL" size="sm" pulsing />
                        ) : (
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase text-slate-400">
                            STANDARD
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 text-right font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/employees/${emp.id}`);
                          }}
                          className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-500/20"
                        >
                          Intelligence Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
