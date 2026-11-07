import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { obligationAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function RenewalsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRenewals = async () => {
    try {
      setLoading(true);
      const res = await obligationAPI.getRenewalAlerts();
      if (res.data?.success) {
        setAlerts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Contract Renewal & Notice Horizon Monitoring</span>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded-md">Horizon</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Automated calendar tracking for expiring contracts and mandatory advance written non-renewal notice windows.
        </p>
      </div>

      {/* Important Principle Alert Banner */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex items-start space-x-3">
        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900">Legal Compliance Notice: Expiration vs. Non-Renewal Notice Deadline</p>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            A contract's renewal notice deadline is distinct from its final expiration date. Contracts with automatic renewal (evergreen clauses) require written notice 30, 60, or 90 days <em>prior</em> to expiration to prevent unintended financial and operational lock-in.
          </p>
        </div>
      </div>

      {/* Renewal Alerts Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
            <span>Scanning renewal deadlines...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No Critical Renewals Approaching</p>
            <p className="text-[11px] mt-0.5">All active corporate agreements are outside the 90-day alert window.</p>
          </div>
        ) : (
          alerts.map((al) => (
            <div
              key={al.contractId}
              onClick={() => navigate(`/contracts/${al.contractId}`)}
              className="bg-white border border-slate-200 hover:border-amber-400 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    al.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                    al.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                    al.urgency === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {al.urgency} Urgency
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {al.title}
                  </h3>
                  <StatusBadge status={al.status} />
                </div>

                <div className="text-[11px] text-slate-500">
                  Counterparty: <strong className="text-slate-700">{al.counterparty}</strong> • Type: {al.contractType}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                  <span className="p-1.5 bg-slate-50 rounded border border-slate-200/80 text-[11px] text-slate-700">
                    Contract Expiry: <strong className="font-mono">{new Date(al.expirationDate).toLocaleDateString()}</strong> ({al.daysToExpiry} days left)
                  </span>
                  <span className="p-1.5 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900 font-semibold">
                    Notice Deadline: <strong className="font-mono">{al.renewalNoticeDueDate ? new Date(al.renewalNoticeDueDate).toLocaleDateString() : 'N/A'}</strong> ({al.daysToNoticeDeadline} days left)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/contracts/${al.contractId}`);
                  }}
                  className="flex items-center space-x-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold"
                >
                  <span>Review Contract</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
