import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  AlertTriangle,
  Scale,
  CheckCircle,
  FileText,
  TrendingDown,
  Info,
} from 'lucide-react';
import { policyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PolicyCenterPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const [newPolicy, setNewPolicy] = useState({
    title: '',
    category: 'Liability',
    description: '',
    standardTerm: '',
    strictness: 'mandatory',
    approvedJurisdictions: 'Delaware, USA, New York, USA',
  });

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await policyAPI.getPolicies();
      if (res.data?.success) {
        setPolicies(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newPolicy,
        approvedJurisdictions: newPolicy.approvedJurisdictions.split(',').map(j => j.trim()),
      };
      await policyAPI.createPolicy(payload);
      setModalOpen(false);
      setSuccessMsg('Corporate policy standard created successfully.');
      fetchPolicies();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Corporate Legal Policy & Compliance Center</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-100 text-brand-700 rounded-md">Governance</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure organization-wide contracting rules, liability caps, and preferred jurisdictions.
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Configure Policy Rule</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Policy Drift Detection Alert Card (Advanced Feature 4) */}
      <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-2">
        <div className="flex items-center space-x-2 text-purple-900 font-bold">
          <TrendingDown className="w-4 h-4 text-purple-600" />
          <span>AI Policy Drift Detection: Precedent Feedback Insight</span>
        </div>
        <p className="text-purple-800 text-[11px] leading-relaxed">
          The Precedent Engine noticed that 3 recently negotiated SaaS agreements adopted a <strong>1.5x fee multiplier</strong> for data protection breaches instead of the standard 1.0x cap. Consider updating the corporate baseline to reflect current negotiation realities.
        </p>
      </div>

      {/* Policies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policies.map((p) => (
          <div key={p._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-slate-900">{p.title}</span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                    p.strictness === 'mandatory' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {p.strictness}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Category: {p.category}</div>
              </div>
              <ShieldCheck className="w-5 h-5 text-brand-600" />
            </div>

            <p className="text-xs text-slate-600">{p.description}</p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="font-semibold text-slate-700 block text-[11px] mb-1">Standard Approved Term:</span>
              <p className="font-mono text-[11px] text-slate-800 leading-relaxed">
                "{p.standardTerm}"
              </p>
            </div>

            {p.unacceptablePhrases && p.unacceptablePhrases.length > 0 && (
              <div className="text-xs text-rose-700">
                <span className="font-bold text-[10px] uppercase block mb-1">Unacceptable Trigger Words:</span>
                <div className="flex flex-wrap gap-1.5">
                  {p.unacceptablePhrases.map((phrase, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-rose-50 border border-rose-200 rounded text-[10px] font-mono">
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Configure Corporate Legal Policy</h3>

            <form onSubmit={handleCreatePolicy} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Policy Title</label>
                <input
                  type="text"
                  required
                  value={newPolicy.title}
                  onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                  placeholder="e.g. Confidentiality 3-Year Survival Standard"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newPolicy.category}
                    onChange={(e) => setNewPolicy({ ...newPolicy, category: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Liability">Liability</option>
                    <option value="Indemnification">Indemnification</option>
                    <option value="Confidentiality">Confidentiality</option>
                    <option value="Governing Law">Governing Law</option>
                    <option value="Termination">Termination</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Enforcement Strictness</label>
                  <select
                    value={newPolicy.strictness}
                    onChange={(e) => setNewPolicy({ ...newPolicy, strictness: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="mandatory">Mandatory</option>
                    <option value="recommended">Recommended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Policy Objective / Description</label>
                <textarea
                  rows={2}
                  required
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  placeholder="Description of rule and why it is required."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mandatory Standard Language</label>
                <textarea
                  rows={3}
                  required
                  value={newPolicy.standardTerm}
                  onChange={(e) => setNewPolicy({ ...newPolicy, standardTerm: e.target.value })}
                  placeholder="The approved clause wording to enforce."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-600 text-white rounded-md text-xs font-semibold"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
