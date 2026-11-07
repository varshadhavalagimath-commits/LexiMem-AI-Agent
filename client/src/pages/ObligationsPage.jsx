import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Filter,
  CheckSquare,
  Search,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { obligationAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function ObligationsPage() {
  const [obligations, setObligations] = useState([]);
  const [stats, setStats] = useState({ total: 0, overdue: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');

  const fetchObligations = async () => {
    try {
      setLoading(true);
      const res = await obligationAPI.getObligations({
        category,
        status,
        priority,
      });
      if (res.data?.success) {
        setObligations(res.data.obligations);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObligations();
  }, [category, status, priority]);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await obligationAPI.updateObligation(id, {
        status: nextStatus,
        completionNotes: nextStatus === 'completed' ? 'Verified completed by user.' : '',
      });
      fetchObligations();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Contractual Obligation & Deadline Monitoring</span>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-100 text-brand-700 rounded-md">Agent 6</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track deliverables, payment milestones, service level commitments, and advance renewal notification deadlines.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500">Total Obligations</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-red-600 font-semibold">Overdue Deadlines</span>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-amber-600 font-semibold">Pending / In Progress</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-emerald-600 font-semibold">Completed</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.completed}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="All">All Categories</option>
          <option value="renewal_notice">Renewal Notice</option>
          <option value="payment">Payment</option>
          <option value="service_delivery">Service Delivery</option>
          <option value="reporting">Reporting</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="All">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="All">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <button onClick={fetchObligations} className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-lg">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <th className="py-3 px-4">Done</th>
              <th className="py-3 px-4">Obligation Commitment</th>
              <th className="py-3 px-4">Contract Reference</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">Loading obligations...</td>
              </tr>
            ) : obligations.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">No obligations found.</td>
              </tr>
            ) : (
              obligations.map((ob) => (
                <tr key={ob._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={ob.status === 'completed'}
                      onChange={() => handleToggleStatus(ob._id, ob.status)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    <span className={ob.status === 'completed' ? 'line-through text-slate-400' : ''}>
                      {ob.description}
                    </span>
                    <div className="text-[10px] text-slate-400">Assigned: {ob.assignedName || 'Operations'}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{ob.contractTitle}</td>
                  <td className="py-3 px-4 capitalize text-slate-600">{ob.category.replace('_', ' ')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ob.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      ob.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      ob.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ob.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {new Date(ob.dueDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={ob.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
