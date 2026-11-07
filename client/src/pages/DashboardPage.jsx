import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  Database,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  Calendar,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Brain,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { reportAPI, contractAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';

const COLORS = ['#3b81b2', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await reportAPI.getOverview();
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const kpis = data?.kpis || {
    totalContracts: 5,
    activeContracts: 3,
    pendingApprovals: 2,
    highRiskContracts: 1,
    expiringContracts: 1,
    completedReviews: 3,
    overdueObligations: 1,
    precedentsStored: 4,
  };

  const charts = data?.charts || {
    statusDistribution: [
      { name: 'Active', value: 3 },
      { name: 'Under Review', value: 1 },
      { name: 'Negotiation', value: 1 },
    ],
    contractsByType: [
      { type: 'Vendor Agreement', count: 2 },
      { type: 'NDA', count: 1 },
      { type: 'Software License', count: 1 },
      { type: 'Employment', count: 1 },
    ],
    monthlyTrends: [
      { month: 'Oct 2026', contracts: 2, precedentsUsed: 1 },
      { month: 'Nov 2026', contracts: 4, precedentsUsed: 3 },
    ],
    riskDistribution: [
      { level: 'Critical', count: 1 },
      { level: 'High', count: 0 },
      { level: 'Medium', count: 1 },
      { level: 'Low', count: 3 },
    ],
    clauseRiskCategories: [
      { category: 'Unlimited Liability', incidents: 2 },
      { category: 'Unilateral Indemnity', incidents: 1 },
      { category: 'Automatic Renewal', incidents: 1 },
    ],
  };

  const kpiCards = [
    {
      title: 'Total Contracts',
      value: kpis.totalContracts,
      icon: FileText,
      color: 'text-brand-600 bg-brand-50 border-brand-200',
      action: () => navigate('/contracts'),
      trend: '+12% this month',
    },
    {
      title: 'Active Contracts',
      value: kpis.activeContracts,
      icon: CheckCircle,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      action: () => navigate('/contracts?status=Active'),
      trend: 'Compliant & executed',
    },
    {
      title: 'Pending Approvals',
      value: kpis.pendingApprovals,
      icon: Clock,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      action: () => navigate('/approvals'),
      trend: 'Requires legal sign-off',
    },
    {
      title: 'High-Risk Contracts',
      value: kpis.highRiskContracts,
      icon: ShieldAlert,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      action: () => navigate('/contracts?riskLevel=Critical'),
      trend: 'Exceeds risk tolerance',
    },
    {
      title: 'Expiring in 30 Days',
      value: kpis.expiringContracts,
      icon: Calendar,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      action: () => navigate('/renewals'),
      trend: 'Notice window active',
    },
    {
      title: 'Completed Reviews',
      value: kpis.completedReviews,
      icon: TrendingUp,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      action: () => navigate('/contracts?status=Approved'),
      trend: 'Turnaround: 1.8 days',
    },
    {
      title: 'Overdue Obligations',
      value: kpis.overdueObligations,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50 border-red-200',
      action: () => navigate('/obligations?status=overdue'),
      trend: 'Immediate action needed',
    },
    {
      title: 'Precedents in Memory',
      value: kpis.precedentsStored,
      icon: Database,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      action: () => navigate('/memory'),
      trend: 'Hindsight persistent bank',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Executive Contract Intelligence Dashboard</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-100 text-brand-700 rounded-md">Live</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time lifecycle monitoring, AI risk scoring, and persistent organizational precedent memory.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Refresh */}
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-600' : 'text-slate-400'}`} />
            <span>Refresh</span>
          </button>

          {/* Quick upload button */}
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Upload Contract</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={kpi.action}
              className="bg-white border border-slate-200/80 rounded-xl p-4 hover:shadow-card hover:border-brand-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{kpi.title}</span>
                <div className={`p-2 rounded-lg border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div className="text-2xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {kpi.value}
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{kpi.trend}</div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Donut */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Contract Status Distribution</h3>
              <p className="text-[11px] text-slate-400">Current workflow breakdown</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {charts.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-100 text-[11px]">
            {charts.statusDistribution.map((entry, idx) => (
              <div key={idx} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-600">{entry.name}:</span>
                <span className="font-semibold text-slate-800">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Contract Creation & Precedent Application */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Creation Trends & Precedent Reuse</h3>
              <p className="text-[11px] text-slate-400">Volume of contracts analyzed vs. precedent recall applications</p>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-brand-500"></span>
                <span className="text-slate-600">Contracts Created</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-purple-500"></span>
                <span className="text-slate-600">Precedents Recalled</span>
              </div>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyTrends}>
                <defs>
                  <linearGradient id="colorContracts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b81b2" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b81b2" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrecedents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="contracts" stroke="#3b81b2" fillOpacity={1} fill="url(#colorContracts)" />
                <Area type="monotone" dataKey="precedentsUsed" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPrecedents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row: Risk Distribution & Contracts By Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Distribution Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Risk Severity Distribution</h3>
              <p className="text-[11px] text-slate-400">Contracts grouped by AI risk assessment</p>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Contracts by Type */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Contracts By Type</h3>
              <p className="text-[11px] text-slate-400">Active repository agreements breakdown</p>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.contractsByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <YAxis dataKey="type" type="category" width={110} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#14b8a6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Precedent Memory Updates & Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Precedent Memory Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Precedent Memory Engine</h3>
            </div>
            <button
              onClick={() => navigate('/memory')}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center space-x-1"
            >
              <span>Explore Memory</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100 flex items-start space-x-3">
              <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-semibold text-purple-950">
                  Approved Standard: 12-Month Aggregate Liability Cap
                </div>
                <div className="text-[11px] text-purple-700 mt-0.5">
                  Applied to Vendor & SaaS contracts. Recalled on 8 subsequent contract reviews.
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-semibold text-slate-800">
                  Approved Standard: Reciprocal Bilateral Indemnification
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Restricts customer indemnity to gross negligence and IP infringement.
                </div>
              </div>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-100 flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-semibold text-rose-950">
                  Rejected Standard: 50% Liquidated Delay Damages
                </div>
                <div className="text-[11px] text-rose-700 mt-0.5">
                  Marked legally punitive under Delaware commercial contract law.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Audit Trail</h3>
            </div>
            <button
              onClick={() => navigate('/audit')}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center space-x-1"
            >
              <span>Full Audit Log</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {(data?.recentActivity || []).slice(0, 4).map((act, i) => (
              <div key={i} className="flex items-start space-x-3 text-xs border-b border-slate-50 pb-2.5 last:border-0">
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">
                    {act.action?.replace(/_/g, ' ')}: {act.resourceTitle || act.resourceType}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    By {act.userName} • {new Date(act.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
