import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Shield,
  RefreshCw,
  Code,
} from 'lucide-react';
import { auditAPI } from '../services/api';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('All');
  const [resourceFilter, setResourceFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditAPI.getAuditLogs({
        action: actionFilter,
        resourceType: resourceFilter,
        limit: 50,
      });
      if (res.data?.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, resourceFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Immutable Regulatory Audit Trail</span>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-100 text-brand-700 rounded-md">SOC 2 / ISO 27001</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tamper-evident system activity log recording all uploads, AI inferences, lawyer precedent approvals, and workflow state transitions.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="All">All Resource Types</option>
          <option value="contract">Contract</option>
          <option value="precedent">Precedent</option>
          <option value="approval">Approval</option>
          <option value="user">User</option>
          <option value="policy">Policy</option>
        </select>

        <button onClick={fetchLogs} className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-lg">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Action Event</th>
              <th className="py-3 px-4">Resource Target</th>
              <th className="py-3 px-4">Authorized User</th>
              <th className="py-3 px-4 text-right">Audit Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400 font-sans">Loading audit records...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400 font-sans">No audit records found.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-sans">
                    <span className="capitalize font-medium">{log.resourceType}:</span> {log.resourceTitle || log.resourceId}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-sans">
                    {log.userName}
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] font-semibold"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Audit Event Payload: {selectedLog.action}
            </h3>

            <div className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-xs overflow-x-auto max-h-96">
              <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold font-sans"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
