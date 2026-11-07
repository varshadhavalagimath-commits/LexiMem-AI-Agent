import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Archive,
  ArrowUpDown,
  Plus,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { contractAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import { useAuth } from '../context/AuthContext';

export default function ContractsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [contractType, setContractType] = useState('All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [riskLevel, setRiskLevel] = useState(searchParams.get('riskLevel') || 'All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await contractAPI.getContracts({
        search,
        contractType,
        status,
        riskLevel,
        page,
        limit: 10,
      });
      if (res.data?.success) {
        setContracts(res.data.contracts);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [search, contractType, status, riskLevel, page]);

  const handleArchive = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to archive this contract?')) {
      await contractAPI.archiveContract(id);
      fetchContracts();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Contract Repository</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage company-wide legal agreements, review status, and risk assessments.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Contract</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, counterparty, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Contract Types</option>
            <option value="Vendor Agreement">Vendor Agreement</option>
            <option value="NDA">NDA</option>
            <option value="Software Licensing Agreement">Software Licensing</option>
            <option value="Employment Agreement">Employment</option>
            <option value="Consulting Agreement">Consulting</option>
            <option value="Service Agreement">Service Agreement</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Approved">Approved</option>
            <option value="Changes Requested">Changes Requested</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Risk Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={fetchContracts}
            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg"
            title="Refresh Table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Contract Title & Type</th>
                <th className="py-3 px-4">Counterparty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">AI Risk Assessment</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Effective / Expiry</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
                    <span>Loading contract repository...</span>
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No contracts matched the selected filters</p>
                    <p className="text-[11px] mt-0.5">Try adjusting your query or upload a new agreement.</p>
                  </td>
                </tr>
              ) : (
                contracts.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/contracts/${c._id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 hover:text-brand-600 transition-colors">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span>{c.contractType}</span>
                        <span>•</span>
                        <span>v{c.currentVersion}</span>
                        {c.isScanned && (
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-700 text-[9px] rounded font-semibold">
                            Scanned / OCR
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700">{c.counterparty || 'N/A'}</span>
                      <div className="text-[11px] text-slate-400">{c.jurisdiction}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="py-3.5 px-4">
                      <RiskBadge level={c.riskLevel} score={c.riskScore} />
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {c.value?.amount ? `$${c.value.amount.toLocaleString()}` : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{c.effectiveDate ? new Date(c.effectiveDate).toLocaleDateString() : 'N/A'}</div>
                      <div className="text-[11px] text-slate-400">
                        Exp: {c.expirationDate ? new Date(c.expirationDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/contracts/${c._id}`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-md"
                        title="Review Contract"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <a
                        href={contractAPI.downloadContractUrl(c._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-md inline-block"
                        title="Download Original Document"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      {user?.role === 'admin' && (
                        <button
                          onClick={(e) => handleArchive(c._id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold">{contracts.length}</span> of{' '}
            <span className="font-semibold">{pagination.total}</span> contracts
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-600 disabled:opacity-50 hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="font-semibold text-slate-700">
              Page {page} of {pagination.totalPages || 1}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-600 disabled:opacity-50 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
