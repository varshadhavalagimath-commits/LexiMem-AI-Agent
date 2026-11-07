import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { approvalAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import { useAuth } from '../context/AuthContext';

export default function ApprovalsPage() {
  const navigate = useNavigate();
  const { user, isLawyer } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await approvalAPI.getApprovals();
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (id, decision) => {
    const comments = window.prompt(`Enter review comments for ${decision.toUpperCase()}:`, 'Approved in accordance with legal policy.');
    if (comments === null) return;
    try {
      if (decision === 'approved') {
        await approvalAPI.approveContract(id, { comments });
      } else if (decision === 'rejected') {
        await approvalAPI.rejectContract(id, { comments });
      } else {
        await approvalAPI.requestChanges(id, { comments });
      }
      setSuccessMsg(`Contract successfully marked as ${decision.toUpperCase()}.`);
      fetchApprovals();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const pending = data?.pendingContracts || [];
  const history = data?.recentDecisions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Contract Approvals & Sign-off Queue</span>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-700 rounded-md">Workflow</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review pending agreements, evaluate risk findings, and record formal authorized legal decisions.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Pending Queue */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Pending Legal Approval ({pending.length})
          </h2>
          <button onClick={fetchApprovals} className="p-1 hover:bg-slate-200 rounded">
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-brand-500 mb-2" />
              <span>Loading approval queue...</span>
            </div>
          ) : pending.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">All Contracts Approved</p>
              <p className="text-[11px] mt-0.5">There are no pending agreements waiting for your review.</p>
            </div>
          ) : (
            pending.map((c) => (
              <div key={c._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900 hover:text-brand-600 cursor-pointer" onClick={() => navigate(`/contracts/${c._id}`)}>
                      {c.title}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">{c.contractType}</span>
                    <StatusBadge status={c.status} />
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Counterparty: <strong className="text-slate-700">{c.counterparty || 'N/A'}</strong> • Value: <strong className="font-mono text-slate-700">${c.value?.amount?.toLocaleString() || '0'}</strong>
                  </p>

                  <div className="flex items-center space-x-2">
                    <RiskBadge level={c.riskLevel} score={c.riskScore} />
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
                      Smart Routed to Legal Counsel (Risk: {c.riskScore}/100)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/contracts/${c._id}`)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Inspect Document
                  </button>

                  {isLawyer && (
                    <>
                      <button
                        onClick={() => handleAction(c._id, 'changes_requested')}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold"
                      >
                        Request Changes
                      </button>

                      <button
                        onClick={() => handleAction(c._id, 'approved')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
                      >
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Approval Decisions History */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Recent Workflow Sign-off Decisions
          </h2>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {history.length === 0 ? (
            <div className="p-6 text-center text-slate-400">No decisions recorded yet.</div>
          ) : (
            history.map((h) => (
              <div key={h._id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">
                    {h.contractId?.title || 'Contract'} — <span className="uppercase text-emerald-700 font-bold">{h.decision}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    "{h.comments || 'Approved standard agreement.'}"
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  <div>By {h.reviewerId?.name || 'Legal Counsel'}</div>
                  <div>{new Date(h.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
