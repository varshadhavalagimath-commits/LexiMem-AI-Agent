import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  ShieldCheck,
  Brain,
  GitPullRequest,
  Clock,
  Download,
  CheckCircle,
  XCircle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Upload,
  Calendar,
  AlertOctagon,
  RefreshCw,
  Scale,
} from 'lucide-react';
import { contractAPI, precedentAPI, negotiationAPI, approvalAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import { useAuth } from '../context/AuthContext';

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLawyer } = useAuth();

  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('risks');
  const [selectedClause, setSelectedClause] = useState(null);

  // Negotiation & Precedent Commit modal / state
  const [negotiatingClause, setNegotiatingClause] = useState(null);
  const [negotiationData, setNegotiationData] = useState(null);
  const [customCounterproposal, setCustomCounterproposal] = useState('');
  const [commitReason, setCommitReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  // New version upload modal
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [versionFile, setVersionFile] = useState(null);
  const [versionNotes, setVersionNotes] = useState('');
  const [uploadingVersion, setUploadingVersion] = useState(false);

  // Approval modal
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalDecision, setApprovalDecision] = useState('approved');
  const [approvalComments, setApprovalComments] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await contractAPI.getContract(id);
      if (res.data?.success) {
        setContractData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load contract details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-500 mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading Contract Intelligence...</p>
      </div>
    );
  }

  if (!contractData || !contractData.contract) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h2 className="text-sm font-bold text-slate-800">Contract Not Found</h2>
        <button
          onClick={() => navigate('/contracts')}
          className="mt-3 px-3 py-1.5 bg-brand-600 text-white rounded text-xs font-semibold"
        >
          Back to Repository
        </button>
      </div>
    );
  }

  const { contract, clauses = [], riskFindings = [], obligations = [], versions = [] } = contractData;

  // Handle open negotiation workspace for a specific clause
  const handleOpenNegotiation = async (clause) => {
    setSelectedClause(clause);
    setNegotiatingClause(clause);
    setActiveTab('negotiation');
    try {
      const res = await negotiationAPI.getNegotiation(contract._id, clause._id);
      if (res.data?.success) {
        setNegotiationData(res.data.data);
        setCustomCounterproposal(res.data.data.proposedClause || res.data.data.aiSuggestion);
      }
    } catch (err) {
      console.error('Negotiation fetch error:', err);
    }
  };

  // Commit lawyer-approved final decision to Precedent Memory (Step 7 & 8 of Demo)
  const handleApproveAndCommitPrecedent = async () => {
    if (!negotiationData) return;
    try {
      const approvedWording = customCounterproposal || negotiationData.proposedClause || negotiationData.aiSuggestion;
      const rationale = commitReason || 'Approved standard corporate liability ceiling under Legal Counsel review.';

      const res = await negotiationAPI.finalizeDecision(negotiationData._id, {
        decision: 'approved',
        finalApprovedClause: approvedWording,
        reason: rationale,
      });

      if (res.data?.success) {
        setActionSuccess('Approved decision committed to Hindsight Persistent Memory and MongoDB precedent records! Subsequent contract reviews will now recall this precedent.');
        fetchDetails();
        setTimeout(() => setActionSuccess(null), 8000);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleRecordFeedback = async (precedentId, reaction) => {
    try {
      await precedentAPI.recordFeedback(precedentId, { reaction });
      setActionSuccess(`Precedent marked as ${reaction}. Neural ranking updated in Hindsight.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadVersionSubmit = async (e) => {
    e.preventDefault();
    if (!versionFile) return;
    try {
      setUploadingVersion(true);
      const fd = new FormData();
      fd.append('document', versionFile);
      fd.append('changeSummary', versionNotes);
      await contractAPI.uploadVersion(contract._id, fd);
      setVersionModalOpen(false);
      setVersionFile(null);
      setVersionNotes('');
      fetchDetails();
      setActionSuccess('New revised contract version uploaded and compared against previous version!');
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setUploadingVersion(false);
    }
  };

  const handleLifecycleApprovalSubmit = async () => {
    try {
      let res;
      if (approvalDecision === 'approved') {
        res = await approvalAPI.approveContract(contract._id, { comments: approvalComments });
      } else if (approvalDecision === 'rejected') {
        res = await approvalAPI.rejectContract(contract._id, { comments: approvalComments });
      } else {
        res = await approvalAPI.requestChanges(contract._id, { comments: approvalComments });
      }
      setApprovalModalOpen(false);
      fetchDetails();
      setActionSuccess(`Contract lifecycle updated: ${approvalDecision.toUpperCase()}`);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb & Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="hover:text-brand-600 cursor-pointer" onClick={() => navigate('/contracts')}>Contracts</span>
              <span>/</span>
              <span className="text-slate-600 font-medium">{contract.contractType}</span>
              <span>/</span>
              <span>v{contract.currentVersion}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>{contract.title}</span>
            </h1>
            <p className="text-xs text-slate-500">
              Counterparty: <span className="font-semibold text-slate-700">{contract.counterparty || 'Counterparty'}</span> • Jurisdiction: <span className="font-semibold text-slate-700">{contract.jurisdiction}</span> • Value: <span className="font-mono font-semibold text-slate-700">${contract.value?.amount?.toLocaleString() || '0'}</span>
            </p>
          </div>

          {/* Badges & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={contract.status} />
            <RiskBadge level={contract.riskLevel} score={contract.riskScore} />

            <a
              href={contractAPI.downloadContractUrl(contract._id)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
              title="Download Original Contract"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Original Doc</span>
            </a>

            <button
              onClick={() => setVersionModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
              title="Upload Revised Version"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>New Version</span>
            </button>

            {isLawyer && (
              <button
                onClick={() => setApprovalModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Workflow Sign-off</span>
              </button>
            )}
          </div>
        </div>

        {/* Success Alert Banner */}
        {actionSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
        )}

        {/* Scanned Document OCR Warning */}
        {contract.isScanned && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Scanned Document Detected</p>
              <p className="text-[11px] text-amber-700">
                Text layer was below the machine-readable density threshold. Optical Character Recognition (OCR) is required for deep analysis. Non-OCR text was extracted where feasible.
              </p>
            </div>
          </div>
        )}

        {/* AI Review Summary Box */}
        {contract.aiReviewSummary && (
          <div className="mt-4 p-3.5 bg-brand-50/60 border border-brand-100 rounded-lg text-xs">
            <div className="flex items-center space-x-1.5 text-brand-900 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>AI Legal Post-Review Summary:</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-[11px]">{contract.aiReviewSummary}</p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 border-b border-slate-200 mt-6 -mb-6 overflow-x-auto text-xs">
          {[
            { key: 'risks', label: `Risk Findings (${riskFindings.length})`, icon: AlertTriangle },
            { key: 'clauses', label: `Document Clauses (${clauses.length})`, icon: FileText },
            { key: 'precedents', label: 'Precedent Intelligence', icon: Brain, badge: 'Hindsight' },
            { key: 'negotiation', label: 'Negotiation Assistant', icon: GitPullRequest },
            { key: 'versions', label: `Version History (v${contract.currentVersion})`, icon: Layers },
            { key: 'obligations', label: `Obligations (${obligations.length})`, icon: Clock },
            { key: 'timeline', label: 'Lifecycle Timeline', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-1.5 px-4 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-brand-600 text-brand-600 bg-brand-50/20'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-purple-100 text-purple-700 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT 1: RISK FINDINGS */}
      {activeTab === 'risks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Identified Contractual Risks & Precedent Matches
            </h2>
            <span className="text-xs text-slate-400">
              Risk score: <strong className="text-slate-800">{contract.riskScore}/100</strong>
            </span>
          </div>

          {riskFindings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No critical risk findings detected</p>
              <p className="text-[11px] mt-0.5">Clauses meet standard corporate contract policy tolerances.</p>
            </div>
          ) : (
            riskFindings.map((risk) => (
              <div
                key={risk._id}
                className={`bg-white border rounded-xl p-5 shadow-sm space-y-3 transition-all ${
                  risk.severity === 'Critical' ? 'border-red-200 hover:border-red-400' : 'border-slate-200 hover:border-brand-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <RiskBadge level={risk.severity} />
                      <span className="text-xs font-semibold text-slate-500">{risk.clauseReference}</span>
                      <span className="text-xs text-slate-400">• Page {risk.pageNumber}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{risk.riskTitle}</h3>
                  </div>

                  <button
                    onClick={() => {
                      const matchedClause = clauses.find(c => c._id === risk.clauseId || c.category === risk.clauseCategory) || clauses[0];
                      handleOpenNegotiation(matchedClause);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-semibold border border-brand-200 transition-colors flex-shrink-0"
                  >
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span>Negotiate Clause</span>
                  </button>
                </div>

                {/* Quoted Clause */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 font-mono text-[11px] text-slate-800 leading-relaxed">
                  "{risk.clauseText}"
                </div>

                {/* Explanation & Business Impact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-red-50/40 rounded-lg border border-red-100/70">
                    <span className="font-bold text-red-900 block mb-1">Legal Risk Explanation:</span>
                    <p className="text-slate-700 text-[11px]">{risk.explanation}</p>
                  </div>
                  <div className="p-3 bg-amber-50/40 rounded-lg border border-amber-100/70">
                    <span className="font-bold text-amber-900 block mb-1">Potential Business Impact:</span>
                    <p className="text-slate-700 text-[11px]">{risk.businessImpact}</p>
                  </div>
                </div>

                {/* Precedent Recommendation Box (Module G) */}
                {risk.relevantPrecedent ? (
                  <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs font-bold text-purple-900">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span>Hindsight Precedent Match Found ({risk.relevantPrecedent.similarityScore}% Similarity)</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-purple-200 text-purple-800 rounded">
                        Organizational Memory Active
                      </span>
                    </div>

                    <div className="text-[11px] text-purple-800">
                      <strong>Approved Historical Language:</strong>
                      <p className="mt-1 p-2 bg-white rounded border border-purple-200 font-mono text-[10.5px] text-slate-800">
                        "{risk.relevantPrecedent.approvedWording}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500">
                        Source: {risk.relevantPrecedent.summary}
                      </span>
                      <button
                        onClick={() => {
                          const matchedClause = clauses.find(c => c._id === risk.clauseId || c.category === risk.clauseCategory) || clauses[0];
                          handleOpenNegotiation(matchedClause);
                        }}
                        className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-1"
                      >
                        <span>Apply Precedent in Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-500 flex items-center justify-between">
                    <span className="text-[11px]">No prior approved precedent recorded for this clause category in Hindsight.</span>
                    <span className="text-[10px] font-semibold text-slate-400">First Instance Review</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT 2: DOCUMENT CLAUSES */}
      {activeTab === 'clauses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Clause Catalog */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 max-h-[600px] overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Extracted Clauses Catalog
            </h3>
            {clauses.map((cl, i) => (
              <div
                key={cl._id}
                onClick={() => setSelectedClause(cl)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedClause?._id === cl._id
                    ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                    : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800">{cl.category}</span>
                  <RiskBadge level={cl.riskLevel} showIcon={false} />
                </div>
                <div className="text-[11px] text-slate-500 truncate">{cl.clauseReference}</div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{cl.text}</div>
              </div>
            ))}
          </div>

          {/* Clause Detail Viewer */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm md:col-span-2 space-y-4">
            {selectedClause ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{selectedClause.category}</span>
                    <h3 className="text-sm font-bold text-slate-900">{selectedClause.clauseReference}</h3>
                  </div>
                  <RiskBadge level={selectedClause.riskLevel} />
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-500 mb-1">Clause Exact Wording:</h4>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 leading-relaxed select-text">
                    {selectedClause.text}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleOpenNegotiation(selectedClause)}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span>Open in Negotiation Assistant</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-slate-400 text-xs">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>Select any extracted clause from the left catalog to inspect.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PRECEDENT INTELLIGENCE */}
      {activeTab === 'precedents' && (
        <div className="space-y-4">
          <div className="bg-purple-900 text-white rounded-xl p-5 shadow-card flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-accent-400" />
                <h2 className="text-sm font-bold">Hindsight Precedent Intelligence Engine</h2>
              </div>
              <p className="text-xs text-purple-200 mt-1 max-w-2xl">
                The agent retrieves historical approved decisions from Hindsight memory bank, compares clause structure, and explains rationale. Unverified AI outputs are never treated as legal precedent.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {clauses.filter(c => c.matchedPrecedentId).length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                <Brain className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No Historical Precedents Recalled for this Document</p>
                <p className="text-[11px] mt-0.5">When lawyers approve negotiated clauses, confirmed decisions will populate this persistent memory bank.</p>
              </div>
            ) : (
              clauses.filter(c => c.matchedPrecedentId).map((cl) => {
                const prec = cl.matchedPrecedentId;
                return (
                  <div key={cl._id} className="bg-white border border-purple-200 rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-purple-900">{cl.category} Clause</span>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold uppercase">
                          {prec.decision || 'Approved Precedent'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">Jurisdiction: {prec.jurisdiction}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-semibold text-slate-500 block mb-1">Current Agreement Clause:</span>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] text-slate-800">
                          "{cl.text}"
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold text-purple-700 block mb-1">Approved Precedent Language:</span>
                        <div className="p-3 bg-purple-50/70 border border-purple-200 rounded font-mono text-[11px] text-purple-950 font-medium">
                          "{prec.finalApprovedClause}"
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
                      <strong>Legal Rationale for Historical Decision:</strong>
                      <p className="mt-0.5 text-[11px] text-slate-700">{prec.reason}</p>
                    </div>

                    {/* Precedent Evaluation Feedback buttons (Module G) */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[11px] text-slate-400">Rate this precedent recommendation:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRecordFeedback(prec._id, 'useful')}
                          className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[11px]"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Useful</span>
                        </button>
                        <button
                          onClick={() => handleRecordFeedback(prec._id, 'not_relevant')}
                          className="flex items-center space-x-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded text-[11px]"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          <span>Not Relevant</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: NEGOTIATION ASSISTANT (Module H) */}
      {activeTab === 'negotiation' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <GitPullRequest className="w-4 h-4 text-brand-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Negotiation Workspace: {negotiatingClause ? negotiatingClause.category : 'Select Clause'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Side-by-side comparison between counterparty's original wording, AI generated alternative, and approved precedent.
              </p>
            </div>

            {/* Quick clause selector if none active */}
            <select
              value={negotiatingClause?._id || ''}
              onChange={(e) => {
                const found = clauses.find(c => c._id === e.target.value);
                if (found) handleOpenNegotiation(found);
              }}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="">Select a clause to negotiate</option>
              {clauses.map(c => (
                <option key={c._id} value={c._id}>{c.category} - {c.clauseReference}</option>
              ))}
            </select>
          </div>

          {negotiatingClause && negotiationData ? (
            <div className="space-y-6">
              {/* 3-Column Side-by-Side Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                {/* Column 1: Original Counterparty Clause */}
                <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-2">
                  <div className="font-bold text-red-900 flex items-center space-x-1.5">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Original Counterparty Text</span>
                  </div>
                  <div className="p-3 bg-white border border-red-200/80 rounded-lg font-mono text-[11px] text-slate-800 leading-relaxed min-h-[120px]">
                    {negotiationData.originalClause}
                  </div>
                  <p className="text-[10px] text-red-700 font-medium">Current proposal under review</p>
                </div>

                {/* Column 2: AI Suggestion */}
                <div className="p-4 bg-brand-50/50 border border-brand-200 rounded-xl space-y-2">
                  <div className="font-bold text-brand-900 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <span>AI Counterproposal Draft</span>
                  </div>
                  <div className="p-3 bg-white border border-brand-200/80 rounded-lg font-mono text-[11px] text-slate-800 leading-relaxed min-h-[120px]">
                    {negotiationData.aiSuggestion}
                  </div>
                  <div className="text-[10px] text-brand-700">
                    <strong>Rationale:</strong> {negotiationData.rationale}
                  </div>
                </div>

                {/* Column 3: Approved Precedent (Hindsight) */}
                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2">
                  <div className="font-bold text-purple-900 flex items-center space-x-1.5">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span>Hindsight Approved Precedent</span>
                  </div>
                  <div className="p-3 bg-white border border-purple-200/80 rounded-lg font-mono text-[11px] text-purple-950 font-medium leading-relaxed min-h-[120px]">
                    {negotiationData.approvedPrecedentText || 'No prior approved precedent on file for this specific category.'}
                  </div>
                  <p className="text-[10px] text-purple-700 font-medium">Organizational legal standard</p>
                </div>
              </div>

              {/* Lawyer Editing & Precedent Commit Form */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Final Negotiated Language (Lawyer Sign-off)
                  </h3>
                  <span className="text-[11px] text-slate-500">Lawyer Verified Resolution</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Editable Final Clause (Will be applied to contract):
                  </label>
                  <textarea
                    rows={4}
                    value={customCounterproposal}
                    onChange={(e) => setCustomCounterproposal(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-lg font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Decision Reason (Will be preserved in Hindsight Precedent Memory):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Capped aggregate liability at 12 months fees ($150,000) in accordance with Policy PO-2024-01."
                    value={commitReason}
                    onChange={(e) => setCommitReason(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-slate-500 max-w-lg">
                    🛡️ <strong>Safety Guarantee:</strong> AI outputs are never automatically treated as precedents. Committing records an immutable, verified legal precedent in Hindsight.
                  </span>

                  <button
                    onClick={handleApproveAndCommitPrecedent}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve & Save to Precedent Memory</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">
              <GitPullRequest className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No Clause Currently Active for Negotiation</p>
              <p className="text-[11px] mt-0.5">Select a clause from the dropdown above or click "Negotiate Clause" on any risk finding.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: VERSIONS & COMPARISON */}
      {activeTab === 'versions' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Contract Version History & Redline Differences
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every revision preserves original document integrity and automatically highlights clause-level changes.
              </p>
            </div>

            <button
              onClick={() => setVersionModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Revision</span>
            </button>
          </div>

          <div className="space-y-4">
            {versions.map((ver) => (
              <div key={ver._id} className="p-4 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-brand-100 text-brand-800 text-xs font-bold rounded">
                      Version {ver.versionNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">{ver.fileReference?.originalName}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Uploaded: {new Date(ver.createdAt).toLocaleDateString()} by {ver.uploadedBy?.name || 'Counsel'}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{ver.changeSummary || 'Document update revision.'}</p>

                {ver.differences && ver.differences.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200/80">
                    <span className="text-[11px] font-bold uppercase text-slate-600 block">
                      Detected Clause Differences:
                    </span>
                    {ver.differences.map((diff, idx) => (
                      <div key={idx} className="text-xs flex items-start space-x-2 border-t border-slate-200/60 pt-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          diff.changeType === 'modified' ? 'bg-amber-100 text-amber-800' :
                          diff.changeType === 'added' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {diff.changeType}
                        </span>
                        <div className="flex-1">
                          <span className="font-semibold text-slate-800">{diff.section}: </span>
                          <span className="text-slate-600">{diff.materialImpact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: OBLIGATIONS */}
      {activeTab === 'obligations' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Contractual Obligations & Key Dates
            </h2>
            <span className="text-xs text-slate-400">Total Obligations: {obligations.length}</span>
          </div>

          <div className="divide-y divide-slate-100">
            {obligations.map((ob) => (
              <div key={ob._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-800">{ob.description}</div>
                  <div className="text-[11px] text-slate-400">
                    Category: <span className="capitalize">{ob.category}</span> • Assigned to: {ob.assignedName || 'Legal Ops'}
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="font-medium text-slate-700">{new Date(ob.dueDate).toLocaleDateString()}</div>
                    <span className={`text-[10px] uppercase font-bold ${ob.status === 'overdue' ? 'text-rose-600' : 'text-slate-400'}`}>
                      {ob.status}
                    </span>
                  </div>
                  <StatusBadge status={ob.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: LIFECYCLE TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Contract Lifecycle Stages & Approval Trail
          </h2>

          <div className="relative border-l-2 border-brand-200 ml-4 pl-6 space-y-6 text-xs">
            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
              <div className="font-bold text-slate-900">Contract Intake & Ingestion</div>
              <div className="text-[11px] text-slate-400">Completed • {new Date(contract.createdAt).toLocaleDateString()}</div>
              <p className="text-slate-600 mt-1">Uploaded and extracted using Document Processor with OCR check.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
              <div className="font-bold text-slate-900">AI Risk & Precedent Memory Analysis</div>
              <div className="text-[11px] text-slate-400">Completed • Agent Orchestrator</div>
              <p className="text-slate-600 mt-1">Identified risks, matched Hindsight precedents, and calculated risk score ({contract.riskScore}/100).</p>
            </div>

            <div className="relative">
              <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ${contract.status === 'Approved' || contract.status === 'Active' ? 'bg-emerald-500' : 'bg-brand-500 ring-4 ring-brand-100'}`}></span>
              <div className="font-bold text-slate-900">Legal Counsel Review & Negotiation</div>
              <div className="text-[11px] text-slate-400">Active Stage</div>
              <p className="text-slate-600 mt-1">Lawyer reviews flagged clauses, proposes counterproposals, and commits precedents to memory.</p>
            </div>

            <div className="relative">
              <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ${contract.status === 'Approved' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
              <div className="font-bold text-slate-900">Final Corporate Approval & Execution</div>
              <div className="text-[11px] text-slate-400">Current Status: {contract.status}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Version Upload */}
      {versionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Upload Revised Contract Version</h3>
            <p className="text-xs text-slate-500">
              Upload the revised counterparty draft. LexiMem will preserve v{contract.currentVersion} and redline the changes.
            </p>

            <form onSubmit={handleUploadVersionSubmit} className="space-y-4 text-xs">
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => setVersionFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Revision Notes / Summary</label>
                <textarea
                  rows={3}
                  value={versionNotes}
                  onChange={(e) => setVersionNotes(e.target.value)}
                  placeholder="e.g. Revised Section 8.1 with counterproposal liability cap."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVersionModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!versionFile || uploadingVersion}
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-xs font-semibold"
                >
                  {uploadingVersion ? 'Comparing...' : 'Upload & Compare'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Workflow Sign-off */}
      {approvalModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Legal Review Sign-off</h3>
            <p className="text-xs text-slate-500">
              Submit your formal decision on {contract.title}. All decisions are recorded in the audit log.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Decision</label>
                <select
                  value={approvalDecision}
                  onChange={(e) => setApprovalDecision(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="approved">Approve Contract</option>
                  <option value="changes_requested">Request Further Changes</option>
                  <option value="rejected">Reject & Terminate</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Review Comments</label>
                <textarea
                  rows={3}
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder="e.g. Terms reviewed and acceptable. Liability cap verified."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setApprovalModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLifecycleApprovalSubmit}
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-xs font-semibold"
                >
                  Submit Sign-off
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
