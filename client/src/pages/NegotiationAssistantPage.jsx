import React, { useState, useEffect } from 'react';
import {
  GitPullRequest,
  Sparkles,
  Brain,
  CheckCircle,
  XCircle,
  Send,
  RefreshCw,
  Scale,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { contractAPI, negotiationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NegotiationAssistantPage() {
  const { isLawyer } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [clauses, setClauses] = useState([]);
  const [selectedClauseId, setSelectedClauseId] = useState('');
  const [negotiation, setNegotiation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [counterText, setCounterText] = useState('');
  const [commitReason, setCommitReason] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    const fetchContracts = async () => {
      const res = await contractAPI.getContracts({ limit: 50 });
      if (res.data?.success) {
        setContracts(res.data.contracts);
        if (res.data.contracts.length > 0) {
          setSelectedContractId(res.data.contracts[0]._id);
        }
      }
    };
    fetchContracts();
  }, []);

  useEffect(() => {
    if (!selectedContractId) return;
    const fetchContractDetails = async () => {
      const res = await contractAPI.getContract(selectedContractId);
      if (res.data?.success) {
        setClauses(res.data.data.clauses || []);
        if (res.data.data.clauses?.length > 0) {
          loadNegotiation(selectedContractId, res.data.data.clauses[0]._id);
        }
      }
    };
    fetchContractDetails();
  }, [selectedContractId]);

  const loadNegotiation = async (contractId, clauseId) => {
    try {
      setLoading(true);
      setSelectedClauseId(clauseId);
      const res = await negotiationAPI.getNegotiation(contractId, clauseId);
      if (res.data?.success) {
        setNegotiation(res.data.data);
        setCounterText(res.data.data.proposedClause || res.data.data.aiSuggestion);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitPrecedent = async () => {
    if (!negotiation) return;
    try {
      const res = await negotiationAPI.finalizeDecision(negotiation._id, {
        decision: 'approved',
        finalApprovedClause: counterText,
        reason: commitReason || 'Approved standard counterproposal under Legal Counsel review.',
      });
      if (res.data?.success) {
        setStatusMsg('Confirmed legal decision successfully saved to Hindsight persistent memory and MongoDB precedent records!');
        setTimeout(() => setStatusMsg(null), 6000);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>AI Negotiation Assistant Workspace</span>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-100 text-brand-700 rounded-md">Agent 5</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Side-by-side comparison between counterparty's original clause, AI generated wording, and approved organizational precedents.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Contract & Clause Selectors */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Agreement</label>
          <select
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            {contracts.map(c => (
              <option key={c._id} value={c._id}>{c.title} ({c.contractType})</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Clause to Negotiate</label>
          <select
            value={selectedClauseId}
            onChange={(e) => loadNegotiation(selectedContractId, e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            {clauses.map(cl => (
              <option key={cl._id} value={cl._id}>{cl.category} — {cl.clauseReference}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 3-Way Side-by-Side Comparison Workspace */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-600 mb-2" />
          <span>Generating AI counterproposals and recalling precedents...</span>
        </div>
      ) : negotiation ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            {/* Column 1: Original Clause */}
            <div className="bg-white border border-red-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-red-900 font-bold">
                <XCircle className="w-4 h-4 text-red-500" />
                <span>1. Original Counterparty Proposal</span>
              </div>
              <div className="p-3 bg-red-50/40 border border-red-100 rounded-lg font-mono text-[11px] text-slate-800 leading-relaxed min-h-[140px]">
                "{negotiation.originalClause}"
              </div>
              <p className="text-[11px] text-red-700">Counterparty draft received for review.</p>
            </div>

            {/* Column 2: AI Suggestion */}
            <div className="bg-white border border-brand-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-brand-900 font-bold">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>2. AI Suggestion (Agent 5)</span>
              </div>
              <div className="p-3 bg-brand-50/40 border border-brand-100 rounded-lg font-mono text-[11px] text-slate-800 leading-relaxed min-h-[140px]">
                "{negotiation.aiSuggestion}"
              </div>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div><strong>Advantages:</strong> Balanced commercial compromise.</div>
                <div><strong>Trade-offs:</strong> Requires counterparty consent.</div>
              </div>
            </div>

            {/* Column 3: Approved Precedent */}
            <div className="bg-white border border-purple-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-purple-900 font-bold">
                <Brain className="w-4 h-4 text-purple-600" />
                <span>3. Hindsight Approved Precedent</span>
              </div>
              <div className="p-3 bg-purple-50/40 border border-purple-100 rounded-lg font-mono text-[11px] text-purple-950 font-medium leading-relaxed min-h-[140px]">
                "{negotiation.approvedPrecedentText || 'No prior approved precedent in memory for this category.'}"
              </div>
              <p className="text-[11px] text-purple-700">Corporate legal standard</p>
            </div>
          </div>

          {/* Final Resolution Workspace */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Draft Final Counterproposal & Commit to Precedent Memory
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lawyer-Refined Final Clause:
              </label>
              <textarea
                rows={4}
                value={counterText}
                onChange={(e) => setCounterText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Legal Reason for Approval / Modification:
              </label>
              <input
                type="text"
                placeholder="e.g. Standard Delaware 12-month trailing fee liability cap applied."
                value={commitReason}
                onChange={(e) => setCommitReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleCommitPrecedent}
                className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve & Save as Organizational Precedent</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
