import React, { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Archive,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Scale,
  Clock,
} from 'lucide-react';
import { precedentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PrecedentIntelligencePage() {
  const { user, isLawyer } = useAuth();
  const [precedents, setPrecedents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [decision, setDecision] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // New precedent form state
  const [newPrecedent, setNewPrecedent] = useState({
    contractTitle: 'Standard Corporate Legal Baseline',
    contractType: 'Vendor Agreement',
    clauseCategory: 'Liability',
    originalClause: '',
    finalApprovedClause: '',
    decision: 'approved',
    reason: '',
    jurisdiction: 'Delaware, USA',
  });

  const fetchPrecedents = async () => {
    try {
      setLoading(true);
      const res = await precedentAPI.getPrecedents({
        query,
        category,
        decision,
      });
      if (res.data?.success) {
        setPrecedents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load precedents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrecedents();
  }, [query, category, decision]);

  const handleCreatePrecedent = async (e) => {
    e.preventDefault();
    try {
      const res = await precedentAPI.commitPrecedent(newPrecedent);
      if (res.data?.success) {
        setModalOpen(false);
        setSuccessMessage('Approved precedent committed to Hindsight Persistent Memory and MongoDB!');
        fetchPrecedents();
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleSupersede = async (id) => {
    const reason = window.prompt('Enter legal reason for superseding this historical precedent:');
    if (!reason) return;
    try {
      await precedentAPI.supersedePrecedent(id, { reason });
      setSuccessMessage('Precedent marked superseded in organizational memory.');
      fetchPrecedents();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFeedback = async (id, reaction) => {
    try {
      await precedentAPI.recordFeedback(id, { reaction });
      setSuccessMessage(`Precedent rated as ${reaction}. Hindsight ranking updated.`);
      fetchPrecedents();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Precedent Intelligence Catalog</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700 rounded-md">Hindsight Bank</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Confirmed organizational precedents learned from lawyer-approved contract negotiations.
          </p>
        </div>

        {isLawyer && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Approved Precedent</span>
          </button>
        )}
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search approved wording, rationale, contract..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="All">All Categories</option>
            <option value="Liability">Liability</option>
            <option value="Indemnification">Indemnification</option>
            <option value="Confidentiality">Confidentiality</option>
            <option value="Termination">Termination</option>
            <option value="Governing Law">Governing Law</option>
            <option value="Payment">Payment</option>
          </select>

          <select
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="All">All Decisions</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="modified">Modified</option>
            <option value="superseded">Superseded</option>
          </select>

          <button
            onClick={fetchPrecedents}
            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Precedents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
            <span>Querying Hindsight memory bank...</span>
          </div>
        ) : precedents.length === 0 ? (
          <div className="col-span-2 py-16 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            <Brain className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No Precedents Found</p>
            <p className="text-[11px] mt-0.5">Approved clauses from contract reviews will appear here automatically.</p>
          </div>
        ) : (
          precedents.map((prec) => (
            <div
              key={prec._id}
              className={`bg-white border rounded-xl p-5 shadow-sm space-y-3 transition-all ${
                prec.status === 'superseded' ? 'opacity-60 bg-slate-50/70 border-slate-200' : 'border-purple-200/80 hover:border-purple-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-purple-900">{prec.clauseCategory}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      prec.decision === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      prec.decision === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      prec.decision === 'superseded' ? 'bg-slate-200 text-slate-600 line-through' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {prec.decision}
                    </span>
                    {prec.hindsightMemoryReference?.status === 'synced' && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 rounded font-semibold">
                        Hindsight Synced
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Source: <strong className="text-slate-600">{prec.contractTitle || 'Corporate Standard'}</strong> ({prec.contractType}, {prec.jurisdiction})
                  </div>
                </div>

                {isLawyer && prec.status !== 'superseded' && (
                  <button
                    onClick={() => handleSupersede(prec._id)}
                    className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold"
                    title="Mark this precedent outdated / superseded"
                  >
                    Supersede
                  </button>
                )}
              </div>

              {/* Approved Language */}
              <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                <span className="text-[10px] font-bold uppercase text-purple-800 block mb-1">
                  Final Approved Standard Wording:
                </span>
                <p className="font-mono text-[11px] text-purple-950 font-medium leading-relaxed">
                  "{prec.finalApprovedClause}"
                </p>
              </div>

              {/* Original Counterparty Proposal */}
              {prec.originalClause && (
                <div className="text-xs text-slate-500">
                  <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Rejected Counterparty Proposal:</span>
                  <p className="font-mono text-[10.5px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 line-through opacity-80">
                    "{prec.originalClause}"
                  </p>
                </div>
              )}

              {/* Decision Rationale */}
              <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                <span className="font-semibold text-slate-800 block text-[11px]">Decision Rationale:</span>
                <p className="text-[11px] text-slate-600 mt-0.5">{prec.reason}</p>
              </div>

              {/* Metadata & Lawyer Feedback */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="text-[11px] text-slate-400">
                  Approved by {prec.approvedBy?.name || 'Legal Counsel'} • {new Date(prec.approvalDate).toLocaleDateString()}
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-slate-400 mr-1">Recall rating:</span>
                  <button
                    onClick={() => handleFeedback(prec._id, 'useful')}
                    className="p-1 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded"
                    title="Mark Useful"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback(prec._id, 'not_relevant')}
                    className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded"
                    title="Mark Not Relevant"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Record Approved Precedent */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Record Approved Legal Precedent</h3>
            <p className="text-xs text-slate-500">
              Only verified lawyer-approved decisions are saved into Hindsight persistent memory.
            </p>

            <form onSubmit={handleCreatePrecedent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clause Category</label>
                  <select
                    value={newPrecedent.clauseCategory}
                    onChange={(e) => setNewPrecedent({ ...newPrecedent, clauseCategory: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Liability">Liability</option>
                    <option value="Indemnification">Indemnification</option>
                    <option value="Confidentiality">Confidentiality</option>
                    <option value="Termination">Termination</option>
                    <option value="Governing Law">Governing Law</option>
                    <option value="Payment">Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contract Type</label>
                  <select
                    value={newPrecedent.contractType}
                    onChange={(e) => setNewPrecedent({ ...newPrecedent, contractType: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Vendor Agreement">Vendor Agreement</option>
                    <option value="NDA">NDA</option>
                    <option value="Software Licensing Agreement">Software Licensing</option>
                    <option value="Service Agreement">Service Agreement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Approved Clause Language</label>
                <textarea
                  rows={3}
                  required
                  value={newPrecedent.finalApprovedClause}
                  onChange={(e) => setNewPrecedent({ ...newPrecedent, finalApprovedClause: e.target.value })}
                  placeholder="e.g. Total aggregate liability shall be capped at 12 months fees paid under this Agreement."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Decision Reason / Rationale</label>
                <input
                  type="text"
                  required
                  value={newPrecedent.reason}
                  onChange={(e) => setNewPrecedent({ ...newPrecedent, reason: e.target.value })}
                  placeholder="e.g. Mandatory compliance with corporate policy PO-2024-01 liability limit."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-semibold"
                >
                  Commit Precedent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
