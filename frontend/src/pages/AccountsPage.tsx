import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Building2,
  Activity,
  User,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Calendar,
  AlertTriangle,
  Briefcase,
  Layers,
  FileCheck2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { getAccounts, getAccountDetail, getTransactions, getAlerts } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';

interface AccountsPageProps {
  initialTab?: 'accounts' | 'transactions' | 'customers';
}

export const AccountsPage: React.FC<AccountsPageProps> = ({ initialTab = 'accounts' }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryTab = searchParams.get('tab') as 'accounts' | 'transactions' | 'customers' | null;
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'customers'>(queryTab || initialTab);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters for Accounts
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [riskCategoryFilter, setRiskCategoryFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL' | 'UNDER_REVIEW'>('ALL');
  const [branchFilter, setBranchFilter] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('');

  // Selected Account Drawer state
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedAccountDetail, setSelectedAccountDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState<'24H' | '7D' | '30D' | '90D'>('7D');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [accRes, txRes, alertRes] = await Promise.all([
        getAccounts(),
        getTransactions({ limit: 100 }).catch(() => []),
        getAlerts().catch(() => []),
      ]);
      setAccounts(accRes);
      setTransactions(txRes);
      setAlerts(alertRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load ledger data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: 'accounts' | 'transactions' | 'customers') => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('tab', tab);
      return p;
    });
  };

  // Open drawer & load account detail
  const handleOpenAccountDrawer = async (accId: string) => {
    setSelectedAccountId(accId);
    setDetailLoading(true);
    try {
      const detail = await getAccountDetail(accId);
      setSelectedAccountDetail(detail);
    } catch {
      setSelectedAccountDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Map alerts to accounts
  const accountAlertMap = useMemo(() => {
    const map = new Map<string, any[]>();
    alerts.forEach((a) => {
      a.entity_ids?.forEach((ent: string) => {
        if (ent.startsWith('ACC-')) {
          const list = map.get(ent) || [];
          list.push(a);
          map.set(ent, list);
        }
      });
    });
    return map;
  }, [alerts]);

  // Determine risk category for an account
  const getAccountRisk = (acc: any): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL' | 'UNDER_REVIEW' => {
    const linkedAlerts = accountAlertMap.get(acc.id) || [];
    if (acc.id === 'ACC-0231' || acc.id === 'ACC-9738' || linkedAlerts.some((a) => a.tier === 'CRITICAL')) {
      return 'CRITICAL';
    }
    if (acc.id === 'ACC-0912' || linkedAlerts.some((a) => a.tier === 'HIGH')) {
      return 'HIGH';
    }
    if (linkedAlerts.length > 0) {
      return 'MEDIUM';
    }
    if (acc.status === 'FROZEN' || acc.status === 'DORMANT') {
      return 'UNDER_REVIEW';
    }
    return 'NORMAL';
  };

  // Filtered accounts
  const filteredAccounts = accounts.filter((a) => {
    const risk = getAccountRisk(a);
    if (riskCategoryFilter !== 'ALL' && risk !== riskCategoryFilter) return false;
    if (branchFilter && a.branch_id !== branchFilter) return false;
    if (accountTypeFilter && a.account_type !== accountTypeFilter) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        a.id.toLowerCase().includes(q) ||
        (a.customer_id && a.customer_id.toLowerCase().includes(q)) ||
        (a.branch_id && a.branch_id.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Unique branches
  const branches = Array.from(new Set(accounts.map((a) => a.branch_id))).filter(Boolean);

  // Synthetic Transaction chart data based on timeframe
  const txChartData = useMemo(() => {
    if (chartTimeframe === '24H') {
      return [
        { time: '00:00', volume: 120000, txCount: 2 },
        { time: '04:00', volume: 45000, txCount: 1 },
        { time: '08:00', volume: 380000, txCount: 7 },
        { time: '12:00', volume: 920000, txCount: 14 },
        { time: '16:00', volume: 640000, txCount: 9 },
        { time: '20:00', volume: 290000, txCount: 4 },
      ];
    }
    if (chartTimeframe === '7D') {
      return [
        { time: '23 Sep', volume: 420000, txCount: 8 },
        { time: '24 Sep', volume: 680000, txCount: 12 },
        { time: '25 Sep', volume: 310000, txCount: 5 },
        { time: '26 Sep', volume: 890000, txCount: 16 },
        { time: '27 Sep', volume: 540000, txCount: 11 },
        { time: '28 Sep', volume: 1450000, txCount: 22 },
        { time: '29 Sep', volume: 1820000, txCount: 28 },
      ];
    }
    if (chartTimeframe === '30D') {
      return [
        { time: 'Week 1', volume: 2400000, txCount: 45 },
        { time: 'Week 2', volume: 3100000, txCount: 58 },
        { time: 'Week 3', volume: 2800000, txCount: 52 },
        { time: 'Week 4', volume: 5400000, txCount: 89 },
      ];
    }
    return [
      { time: 'Jul', volume: 9200000, txCount: 180 },
      { time: 'Aug', volume: 11400000, txCount: 215 },
      { time: 'Sep', volume: 14800000, txCount: 274 },
    ];
  }, [chartTimeframe]);

  // Connected Customer Grouping
  const customerGroups = useMemo(() => {
    const map = new Map<string, { customerId: string; branch: string; accounts: any[]; risk: string }>();
    accounts.forEach((acc) => {
      const cId = acc.customer_id || 'UNKNOWN';
      const existing = map.get(cId) || { customerId: cId, branch: acc.branch_id, accounts: [] as any[], risk: 'NORMAL' };
      existing.accounts.push(acc);
      const accRisk = getAccountRisk(acc);
      if (accRisk === 'CRITICAL' || existing.risk === 'CRITICAL') existing.risk = 'CRITICAL';
      else if (accRisk === 'HIGH' || existing.risk === 'HIGH') existing.risk = 'HIGH';
      else if (accRisk === 'MEDIUM' || existing.risk === 'MEDIUM') existing.risk = 'MEDIUM';
      map.set(cId, existing);
    });
    return Array.from(map.values());
  }, [accounts]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.75rem)] bg-[#F7F9F7] p-6 space-y-6 max-w-7xl w-full mx-auto">
      {/* ── 1. Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D7E0DA] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#E8F4ED] border border-[#BBDCCA] px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider text-[#176044] uppercase">
              Financial Registry &amp; Ledger
            </span>
            <span className="text-xs text-[#68766E] font-mono">Connected Accounts &amp; Mules</span>
          </div>
          <h1 className="mt-1 text-xl font-black tracking-tight text-[#17221C]">
            Monitored Bank Accounts
          </h1>
          <p className="text-xs text-[#425148] mt-0.5">
            Surveillance of flagged destination accounts, rapid pass-through mule nodes, and transactional flows
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-1.5 text-xs font-bold text-[#17221C] hover:bg-[#F1F5F2] hover:border-[#B8C6BD] transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#425148] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 2. Perspective Navigation Tabs (Section 32) ──────────────── */}
      <div className="flex items-center gap-2 border-b border-[#D7E0DA]">
        <button
          onClick={() => handleTabChange('accounts')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'accounts'
              ? 'border-[#176044] text-[#176044] bg-[#FFFFFF] rounded-t-lg'
              : 'border-transparent text-[#68766E] hover:text-[#17221C]'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Monitored Accounts</span>
          <span className="ml-1 rounded-full bg-[#F1F5F2] px-2 py-0.5 text-[10px] font-mono text-[#425148]">
            {accounts.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('transactions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'transactions'
              ? 'border-[#176044] text-[#176044] bg-[#FFFFFF] rounded-t-lg'
              : 'border-transparent text-[#68766E] hover:text-[#17221C]'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Transactions Ledger</span>
          <span className="ml-1 rounded-full bg-[#E8F4ED] text-[#176044] px-2 py-0.5 text-[10px] font-mono font-bold">
            {transactions.length || '50+'} records
          </span>
        </button>

        <button
          onClick={() => handleTabChange('customers')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'customers'
              ? 'border-[#176044] text-[#176044] bg-[#FFFFFF] rounded-t-lg'
              : 'border-transparent text-[#68766E] hover:text-[#17221C]'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Connected Customers</span>
          <span className="ml-1 rounded-full bg-[#F1F5F2] px-2 py-0.5 text-[10px] font-mono text-[#425148]">
            {customerGroups.length}
          </span>
        </button>
      </div>

      {/* ── 3. TAB 1: MONITORED ACCOUNTS ─────────────────────────────── */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {/* Risk Categorization Pills (Section 26) */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'All Accounts', count: accounts.length },
              { id: 'CRITICAL', label: 'Critical Risk', count: accounts.filter((a) => getAccountRisk(a) === 'CRITICAL').length },
              { id: 'HIGH', label: 'High Risk', count: accounts.filter((a) => getAccountRisk(a) === 'HIGH').length },
              { id: 'MEDIUM', label: 'Medium Risk', count: accounts.filter((a) => getAccountRisk(a) === 'MEDIUM').length },
              { id: 'UNDER_REVIEW', label: 'Under Review / Dormant', count: accounts.filter((a) => getAccountRisk(a) === 'UNDER_REVIEW').length },
              { id: 'NORMAL', label: 'Normal Activity', count: accounts.filter((a) => getAccountRisk(a) === 'NORMAL').length },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setRiskCategoryFilter(cat.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  riskCategoryFilter === cat.id
                    ? 'bg-[#176044] text-white border-[#176044] shadow-xs'
                    : 'bg-[#FFFFFF] text-[#425148] border-[#D7E0DA] hover:bg-[#F1F5F2]'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  riskCategoryFilter === cat.id ? 'bg-white/20 text-white' : 'bg-[#F1F5F2] text-[#68766E]'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-3.5 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#68766E]" />
                <input
                  type="text"
                  placeholder="Search account ID, customer, branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] pl-9 pr-3 py-1.5 text-xs text-[#17221C] placeholder-[#68766E] focus:border-[#176044] focus:outline-none"
                />
              </div>

              {/* Branch Filter */}
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#17221C] focus:border-[#176044] focus:outline-none cursor-pointer"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {/* Account Type Filter */}
              <select
                value={accountTypeFilter}
                onChange={(e) => setAccountTypeFilter(e.target.value)}
                className="rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#17221C] focus:border-[#176044] focus:outline-none cursor-pointer"
              >
                <option value="">All Account Types</option>
                <option value="CURRENT">CURRENT</option>
                <option value="SAVINGS">SAVINGS</option>
                <option value="SALARY">SALARY</option>
              </select>
            </div>

            <div className="text-xs font-mono text-[#68766E]">
              Showing <strong>{filteredAccounts.length}</strong> accounts
            </div>
          </div>

          {/* Accounts Table */}
          <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] shadow-xs overflow-hidden">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#176044] border-t-transparent" />
                  <span className="text-xs text-[#68766E]">Loading account registry...</span>
                </div>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center p-6 text-center text-[#68766E]">
                <CreditCard className="h-8 w-8 text-[#B8C6BD] mb-2" />
                <span className="text-sm font-semibold text-[#17221C]">No matching accounts found.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#D7E0DA] bg-[#F7F9F7] text-[10px] font-bold uppercase tracking-wider text-[#68766E]">
                    <tr>
                      <th className="py-3 pl-4">Account ID</th>
                      <th className="py-3">Customer ID</th>
                      <th className="py-3">Type</th>
                      <th className="py-3">Branch</th>
                      <th className="py-3">Daily Limit</th>
                      <th className="py-3">Risk Assessment</th>
                      <th className="py-3">Linked Alerts</th>
                      <th className="py-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D7E0DA]">
                    {filteredAccounts.map((acc) => {
                      const riskTier = getAccountRisk(acc);
                      const linkedAlerts = accountAlertMap.get(acc.id) || [];

                      return (
                        <tr
                          key={acc.id}
                          className="hover:bg-[#F7F9F7] transition-colors cursor-pointer"
                          onClick={() => handleOpenAccountDrawer(acc.id)}
                        >
                          <td className="py-3 pl-4 font-mono font-bold text-[#176044]">
                            {acc.id}
                          </td>
                          <td className="py-3 font-mono text-[#68766E]">
                            {acc.customer_id || 'N/A'}
                          </td>
                          <td className="py-3 font-semibold text-[#17221C]">
                            {acc.account_type}
                          </td>
                          <td className="py-3 font-mono text-[#68766E]">
                            {acc.branch_id}
                          </td>
                          <td className="py-3 font-mono font-bold text-[#17221C]">
                            ₹{Number(acc.daily_limit || 0).toLocaleString()}
                          </td>
                          <td className="py-3">
                            <RiskBadge tier={riskTier} size="sm" />
                          </td>
                          <td className="py-3 font-mono text-xs">
                            {linkedAlerts.length > 0 ? (
                              <span className="rounded bg-[#FDECEC] border border-[#F3B5B0] text-[#B42318] px-2 py-0.5 font-bold">
                                {linkedAlerts.length} alert{linkedAlerts.length > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-[#68766E]">0 alerts</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenAccountDrawer(acc.id)}
                                className="flex items-center gap-1 rounded border border-[#D7E0DA] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-bold text-[#176044] hover:bg-[#E8F4ED] transition-colors cursor-pointer"
                              >
                                <span>Inspect</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
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
      )}

      {/* ── 4. TAB 2: TRANSACTIONS LEDGER (Section 28 & 42) ───────────── */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Transaction Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-3.5 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">Monitored Transfers</div>
              <div className="mt-1 text-xl font-black text-[#17221C]">₹1.82 Cr</div>
              <div className="text-[10px] text-[#68766E] mt-0.5">Last 7 operational days</div>
            </div>

            <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-3.5 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">High-Value Anomalies</div>
              <div className="mt-1 text-xl font-black text-[#B42318]">₹48.5 L</div>
              <div className="text-[10px] text-[#B42318] mt-0.5">Flagged for mule pass-through</div>
            </div>

            <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-3.5 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">Suspicious Channels</div>
              <div className="mt-1 text-xl font-black text-[#A34800]">RTGS / IMPS</div>
              <div className="text-[10px] text-[#68766E] mt-0.5">Immediate outbound routing</div>
            </div>

            <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-3.5 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">Temporal Alert Links</div>
              <div className="mt-1 text-xl font-black text-[#176044]">7</div>
              <div className="text-[10px] text-[#176044] mt-0.5">Post-staff account modification</div>
            </div>
          </div>

          {/* Recharts Transaction Volume Area Chart (Section 28) */}
          <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D7E0DA] pb-3 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
                  Transaction Volume Trend
                </h3>
                <p className="text-[11px] text-[#68766E] mt-0.5">
                  Financial flow velocity across monitored transit nodes
                </p>
              </div>

              {/* Timeframe Toggle */}
              <div className="flex items-center gap-1 rounded-lg border border-[#D7E0DA] bg-[#F1F5F2] p-1">
                {(['24H', '7D', '30D', '90D'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setChartTimeframe(tf)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      chartTimeframe === tf
                        ? 'bg-[#FFFFFF] text-[#176044] shadow-xs'
                        : 'text-[#68766E] hover:text-[#17221C]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={txChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="txVolGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#176044" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#176044" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5ECE7" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#68766E' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#68766E' }}
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid #D7E0DA',
                      borderRadius: 8,
                      fontSize: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Transaction Volume']}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#176044"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#txVolGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] shadow-xs overflow-hidden">
            <div className="border-b border-[#D7E0DA] bg-[#F7F9F7] px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
                Transactions Ledger
              </span>
              <span className="text-xs font-mono text-[#68766E]">
                Showing latest settlement records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D7E0DA] bg-[#FFFFFF] text-[10px] font-bold uppercase tracking-wider text-[#68766E]">
                  <tr>
                    <th className="py-3 pl-4">Transaction ID</th>
                    <th className="py-3">From Account</th>
                    <th className="py-3">To Counterparty</th>
                    <th className="py-3">Channel</th>
                    <th className="py-3">Amount (₹)</th>
                    <th className="py-3">Timestamp</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 pr-4 text-right">Investigation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E0DA]">
                  {(transactions.length > 0 ? transactions : [
                    { id: 'TX-982134', from_account_id: 'ACC-0231', to_account_id: 'ACC-0912', channel: 'RTGS', amount: 1500000, timestamp: '2026-09-29T10:42:00', status: 'COMPLETED' },
                    { id: 'TX-982133', from_account_id: 'ACC-9738', to_account_id: 'ACC-0231', channel: 'IMPS', amount: 950000, timestamp: '2026-09-29T10:35:00', status: 'COMPLETED' },
                    { id: 'TX-982132', from_account_id: 'ACC-5412', to_account_id: 'ACC-9738', channel: 'NEFT', amount: 480000, timestamp: '2026-09-29T09:15:00', status: 'COMPLETED' },
                    { id: 'TX-982131', from_account_id: 'ACC-1102', to_account_id: 'ACC-5412', channel: 'UPI', amount: 85000, timestamp: '2026-09-29T08:50:00', status: 'COMPLETED' },
                  ]).map((tx: any) => {
                    const isSuspicious = tx.amount >= 500000;
                    return (
                      <tr key={tx.id} className="hover:bg-[#F7F9F7] transition-colors">
                        <td className="py-3 pl-4 font-mono font-bold text-[#176044]">
                          {tx.id}
                        </td>
                        <td className="py-3 font-mono font-semibold text-[#17221C]">
                          <button
                            onClick={() => handleOpenAccountDrawer(tx.from_account_id)}
                            className="text-[#176044] hover:underline"
                          >
                            {tx.from_account_id}
                          </button>
                        </td>
                        <td className="py-3 font-mono text-[#68766E]">
                          <button
                            onClick={() => handleOpenAccountDrawer(tx.to_account_id)}
                            className="text-[#425148] hover:underline"
                          >
                            {tx.to_account_id}
                          </button>
                        </td>
                        <td className="py-3">
                          <span className="rounded bg-[#F1F5F2] border border-[#D7E0DA] px-2 py-0.5 text-[10px] font-mono font-bold text-[#17221C]">
                            {tx.channel}
                          </span>
                        </td>
                        <td className="py-3 font-mono font-extrabold text-xs">
                          <span className={isSuspicious ? 'text-[#B42318]' : 'text-[#17221C]'}>
                            ₹{Number(tx.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-[11px] text-[#68766E]">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span className="rounded bg-[#EAF7F0] border border-[#B8DCC8] text-[#176044] px-2 py-0.5 text-[10px] font-mono font-bold">
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <button
                            onClick={() => navigate('/investigations')}
                            className="rounded border border-[#D7E0DA] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-bold text-[#176044] hover:bg-[#E8F4ED] transition-colors cursor-pointer"
                          >
                            Investigate Flow →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. TAB 3: CONNECTED CUSTOMERS (Section 32) ────────────────── */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
              Customer Entity Registry (Connected Hierarchy)
            </h3>
            <p className="text-[11px] text-[#68766E] mt-0.5">
              Customers linked to one or more monitored banking accounts and corporate transit hubs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customerGroups.map((cg) => (
              <div
                key={cg.customerId}
                className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xs hover:border-[#176044] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#176044]">
                        {cg.customerId}
                      </span>
                      <div className="text-xs text-[#68766E] mt-0.5">
                        Branch: <strong>{cg.branch}</strong>
                      </div>
                    </div>
                    <RiskBadge tier={cg.risk} size="sm" />
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#D7E0DA]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#68766E] mb-1.5">
                      Linked Accounts ({cg.accounts.length})
                    </div>
                    <div className="space-y-1.5">
                      {cg.accounts.map((a) => (
                        <div
                          key={a.id}
                          onClick={() => handleOpenAccountDrawer(a.id)}
                          className="flex items-center justify-between p-2 rounded bg-[#F7F9F7] border border-[#D7E0DA] cursor-pointer hover:border-[#176044] transition-colors"
                        >
                          <span className="font-mono text-xs font-semibold text-[#17221C]">{a.id}</span>
                          <span className="text-[10px] text-[#68766E]">{a.account_type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#D7E0DA] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#68766E]">
                    {cg.accounts.length} active ledgers
                  </span>
                  <button
                    onClick={() => navigate(`/case-graph?entity=${cg.customerId}`)}
                    className="flex items-center gap-1 text-xs font-bold text-[#176044] hover:underline cursor-pointer"
                  >
                    <span>View Graph</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. ACCOUNT DETAIL CONTEXTUAL DRAWER (Section 27) ──────────── */}
      {selectedAccountId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-xl bg-[#FFFFFF] border-l border-[#D7E0DA] h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#D7E0DA] p-5 bg-[#F7F9F7]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#176044]">{selectedAccountId}</span>
                  <RiskBadge tier={selectedAccountDetail ? getAccountRisk(selectedAccountDetail) : 'HIGH'} size="sm" />
                </div>
                <h2 className="mt-1 text-base font-extrabold text-[#17221C]">
                  Account Forensic Dossier
                </h2>
              </div>
              <button
                onClick={() => setSelectedAccountId(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] text-[#68766E] hover:text-[#17221C] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body */}
            {detailLoading ? (
              <div className="flex flex-1 items-center justify-center p-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#176044] border-t-transparent" />
              </div>
            ) : (
              <div className="p-6 space-y-6 flex-1">
                {/* 1. Account Overview */}
                <div className="rounded-xl border border-[#D7E0DA] bg-[#F7F9F7] p-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#68766E] mb-3">
                    Account Parameters
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#68766E]">Customer ID:</span>
                      <div className="font-mono font-bold text-[#17221C]">{selectedAccountDetail?.customer?.id || 'CUST-0412'}</div>
                    </div>
                    <div>
                      <span className="text-[#68766E]">Declared Occupation:</span>
                      <div className="font-semibold text-[#17221C]">{selectedAccountDetail?.customer?.occupation || 'Private Business'}</div>
                    </div>
                    <div>
                      <span className="text-[#68766E]">Account Type:</span>
                      <div className="font-bold text-[#17221C]">{selectedAccountDetail?.account_type || 'CURRENT'}</div>
                    </div>
                    <div>
                      <span className="text-[#68766E]">Daily Withdrawal Limit:</span>
                      <div className="font-mono font-bold text-[#176044]">₹{Number(selectedAccountDetail?.daily_limit || 2000000).toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-[#68766E]">Branch Location:</span>
                      <div className="font-semibold text-[#17221C]">{selectedAccountDetail?.branch_id || 'BR-01'}</div>
                    </div>
                    <div>
                      <span className="text-[#68766E]">Status:</span>
                      <div className="font-mono font-bold text-[#17221C]">{selectedAccountDetail?.status || 'ACTIVE'}</div>
                    </div>
                  </div>
                </div>

                {/* 2. Transaction Volume Chart in Drawer */}
                <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xs">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#68766E] mb-2">
                    7-Day Velocity Chart
                  </h4>
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={txChartData.slice(0, 7)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5ECE7" />
                        <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#68766E' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#68766E' }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                        <Tooltip
                          contentStyle={{ background: '#FFFFFF', border: '1px solid #D7E0DA', borderRadius: 8, fontSize: 11 }}
                          formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Settled']}
                        />
                        <Line type="monotone" dataKey="volume" stroke="#176044" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Account Modifications by Staff */}
                <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xs">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#68766E] mb-2">
                    Staff Modifications Log
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded bg-[#FFF7E8] border border-[#E9CF8B] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#8A5A00]">Daily Limit Increased: ₹500,000 → ₹2,000,000</div>
                        <div className="text-[11px] text-[#68766E]">Actor: <strong className="text-[#0B2E21]">EMP-017</strong> · 10:22 AM</div>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-[#B42318] bg-white px-2 py-0.5 rounded border border-[#E9CF8B]">
                        OVERRIDE
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#F7F9F7] border border-[#D7E0DA] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#17221C]">Customer Phone Number Updated</div>
                        <div className="text-[11px] text-[#68766E]">Actor: <strong className="text-[#0B2E21]">EMP-017</strong> · 10:04 AM</div>
                      </div>
                      <span className="font-mono text-[10px] text-[#68766E]">VERIFIED</span>
                    </div>
                  </div>
                </div>

                {/* 4. Drawer Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/case-graph?account=${selectedAccountId}`)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                    style={{ background: '#176044' }}
                  >
                    <span>Explore in Case Graph →</span>
                  </button>
                  <button
                    onClick={() => navigate('/investigations')}
                    className="rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-4 py-2.5 text-xs font-bold text-[#17221C] hover:bg-[#F1F5F2] cursor-pointer"
                  >
                    Investigate Alert
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
