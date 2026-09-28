import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Building2
} from 'lucide-react';
import { getAccounts } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';

export const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState('');

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAccounts({
        account_type: typeFilter || undefined,
      });
      setAccounts(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load accounts ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [typeFilter]);

  const filteredAccounts = accounts.filter((a) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        a.id.toLowerCase().includes(q) ||
        (a.customer_id && a.customer_id.toLowerCase().includes(q)) ||
        (a.branch_id && a.branch_id.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Financial Registry
            </span>
            <span className="text-xs text-slate-400">Account Ledgers & Mule Nodes</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-100">
            Monitored Bank Accounts
          </h1>
          <p className="text-xs text-slate-400">
            High-risk beneficiary accounts, rapid pass-through transit hubs, and retail deposits
          </p>
        </div>

        <button
          onClick={loadAccounts}
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
              placeholder="Search account ID, customer, branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-mono text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Account Types</option>
            <option value="SAVINGS">SAVINGS</option>
            <option value="CURRENT">CURRENT</option>
            <option value="SALARY">SALARY</option>
          </select>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <strong>{filteredAccounts.length}</strong> accounts
        </div>
      </div>

      {/* Accounts Table */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
              <span className="text-xs text-slate-400">Loading account ledger...</span>
            </div>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-6 text-center text-slate-400">
            <CreditCard className="h-8 w-8 text-slate-500 mb-2" />
            <span className="text-sm font-semibold text-slate-300">No accounts match search.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 pl-4">Account ID</th>
                  <th className="py-3">Customer ID</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Branch</th>
                  <th className="py-3">Daily Limit</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredAccounts.map((acc) => {
                  const isSuspicious =
                    acc.id === 'ACC-0231' ||
                    acc.id === 'ACC-8801' ||
                    acc.id === 'ACC-8802' ||
                    acc.id === 'ACC-8803';
                  return (
                    <tr
                      key={acc.id}
                      className="cursor-pointer transition-colors hover:bg-slate-800/40"
                    >
                      <td className="py-3.5 pl-4 font-bold text-cyan-400 flex items-center gap-2">
                        <span>{acc.id}</span>
                        {isSuspicious && (
                          <span className="rounded bg-red-950/80 border border-red-500/40 px-1.5 py-0.5 text-[9px] text-red-400">
                            FLAGGED
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-slate-400">{acc.customer_id}</td>
                      <td className="py-3.5 font-sans font-medium text-slate-300">{acc.account_type}</td>
                      <td className="py-3.5 font-sans text-slate-300">{acc.branch_id}</td>
                      <td className="py-3.5 text-slate-200">
                        ₹{(acc.daily_limit / 100000).toFixed(1)}L
                      </td>
                      <td className="py-3.5 font-sans">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase text-slate-300">
                          {acc.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-right font-sans">
                        <button
                          onClick={() => navigate(`/alerts?search=${acc.id}`)}
                          className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20"
                        >
                          Find Alerts
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
