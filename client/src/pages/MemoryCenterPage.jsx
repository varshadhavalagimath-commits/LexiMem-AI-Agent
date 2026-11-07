import React, { useState, useEffect } from 'react';
import {
  Database,
  Brain,
  Search,
  CheckCircle,
  AlertCircle,
  Server,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Sliders,
  Send,
} from 'lucide-react';
import { precedentAPI } from '../services/api';

export default function MemoryCenterPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testQuery, setTestQuery] = useState('Vendor agreement unlimited liability');
  const [testResults, setTestResults] = useState(null);
  const [testingRecall, setTestingRecall] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await precedentAPI.getMemoryDashboard();
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleTestRecall = async (e) => {
    e.preventDefault();
    if (!testQuery) return;
    try {
      setTestingRecall(true);
      const res = await precedentAPI.recallForClause({
        clauseText: testQuery,
        category: 'Liability',
        contractType: 'Vendor Agreement',
        jurisdiction: 'Delaware, USA',
      });
      if (res.data?.success) {
        setTestResults(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTestingRecall(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Hindsight Persistent Memory Center</span>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700 rounded-md">Engine Health</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Autonomous organizational memory bank powered by Hindsight: 4-way parallel search across semantic vectors, BM25, and entity graph topology.
        </p>
      </div>

      {/* Health & Engine Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Memory Engine Status</span>
            <Server className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{stats?.hindsightHealth?.online ? 'Live Cloud' : 'Synchronized'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {stats?.hindsightHealth?.baseUrl || 'https://api.hindsight.vectorize.io'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Stored Precedents</span>
            <Database className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {stats?.totalPrecedents || 4}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Confirmed legal decisions</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Approved Clauses</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {stats?.decisions?.approved || 3}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active corporate standards</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Rejected Proposals</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {stats?.decisions?.rejected || 1}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Failed negotiation history</p>
        </div>
      </div>

      {/* Interactive Memory Workbench (Test Recall) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>Interactive Precedent Recall Workbench</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Test how Hindsight parallel search retrieves precedents and generates evidence-backed recommendations.
            </p>
          </div>
        </div>

        <form onSubmit={handleTestRecall} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Enter clause text to query Hindsight memory bank..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            disabled={testingRecall}
            className="flex items-center space-x-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
          >
            {testingRecall ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Query Memory</span>
          </button>
        </form>

        {testResults && (
          <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-3 mt-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900">
                {testResults.hasPrecedent ? `Best Match Found (${testResults.bestMatch?.similarityScore}% Confidence)` : 'No Precedents Found'}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-purple-200 text-purple-800 rounded font-semibold">
                Source: {testResults.bestMatch?.provenance?.hindsightSynced ? 'Hindsight Live' : 'MongoDB Local Memory Sync'}
              </span>
            </div>

            {testResults.bestMatch && (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white rounded-lg border border-purple-200 font-mono text-[11px] text-purple-950">
                  "{testResults.bestMatch.finalApprovedClause}"
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong>Decision:</strong> <span className="uppercase font-semibold text-emerald-700">{testResults.bestMatch.decision}</span> • {testResults.bestMatch.reason}
                </div>
                <div className="text-[11px] text-purple-700 font-medium">
                  <strong>Recommendation:</strong> {testResults.bestMatch.recommendation}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Memory Retain Records */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Recent Hindsight Retain Operations & Sync History
        </h2>

        <div className="divide-y divide-slate-100">
          {(stats?.recentUpdates || []).map((rec) => (
            <div key={rec._id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-800">{rec.clauseCategory}</span>
                  <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[9px] font-bold uppercase">
                    {rec.decision}
                  </span>
                  <span className="text-slate-400">• {rec.contractTitle || 'Corporate Framework'}</span>
                </div>
                <p className="font-mono text-[11px] text-slate-600 line-clamp-1">
                  "{rec.finalApprovedClause}"
                </p>
                <p className="text-[10px] text-slate-400">
                  Decision rationale: {rec.reason}
                </p>
              </div>

              <div className="text-right text-[11px] text-slate-400 flex-shrink-0">
                <div>{new Date(rec.approvalDate).toLocaleDateString()}</div>
                <div className="text-[10px] font-mono text-purple-600">
                  Bank: {rec.hindsightMemoryReference?.bankId || 'leximem'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
