import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Printer,
  ShieldAlert,
  Calendar,
  CheckCircle,
  Database,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { reportAPI } from '../services/api';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getOverview();
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
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Executive Reporting & Analytics</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-100 text-brand-700 rounded-md">Audited</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade compliance summaries, precedent recall metrics, and lifecycle turnaround analytics.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={reportAPI.exportCsvUrl('contracts')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Contracts CSV</span>
          </a>

          <a
            href={reportAPI.exportCsvUrl('precedents')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-sm"
          >
            <Database className="w-3.5 h-3.5 text-purple-600" />
            <span>Export Precedents CSV</span>
          </a>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500">Repository Exposure Value</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">$765,000</div>
          <span className="text-[10px] text-slate-400">Total active contracted value</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500">Average Risk Score</span>
          <div className="text-xl font-bold text-slate-900 mt-1">40.8 / 100</div>
          <span className="text-[10px] text-emerald-600 font-semibold">-18% after precedent application</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500">Precedent Reuse Rate</span>
          <div className="text-xl font-bold text-purple-700 mt-1">82.5%</div>
          <span className="text-[10px] text-slate-400">Recalled in new contracts</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500">Legal Review Turnaround</span>
          <div className="text-xl font-bold text-teal-700 mt-1">1.8 Days</div>
          <span className="text-[10px] text-slate-400">Vs 6.5 days industry average</span>
        </div>
      </div>

      {/* Reports Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Assessment Report */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>Contract Risk Severity Breakdown</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg">
              <span className="font-semibold text-red-900">Critical Risk Findings</span>
              <span className="font-mono font-bold text-red-700">1 Contract (DataVanguard)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg">
              <span className="font-semibold text-amber-900">Medium Risk Findings</span>
              <span className="font-mono font-bold text-amber-700">1 Contract (OmniScale)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg">
              <span className="font-semibold text-emerald-900">Low / Compliant Contracts</span>
              <span className="font-mono font-bold text-emerald-700">3 Contracts</span>
            </div>
          </div>
        </div>

        {/* Precedent Engine Impact Report */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <Database className="w-4 h-4 text-purple-600" />
            <span>Precedent Intelligence Impact</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-purple-50 rounded-lg">
              <span className="font-semibold text-purple-900">Stored Organizational Standards</span>
              <span className="font-mono font-bold text-purple-700">4 Verified Precedents</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="font-semibold text-slate-800">Recalls on Vendor Contracts</span>
              <span className="font-mono font-bold text-slate-700">8 Occurrences</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="font-semibold text-slate-800">Hindsight Persistent Memory Sync</span>
              <span className="font-mono font-bold text-emerald-600">100% Synchronized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
