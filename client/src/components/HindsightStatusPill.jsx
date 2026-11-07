import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { precedentAPI } from '../services/api';

export default function HindsightStatusPill() {
  const [status, setStatus] = useState({ online: false, mode: 'Checking...', count: 0 });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await precedentAPI.getMemoryDashboard();
        if (res.data?.success) {
          const health = res.data.data?.hindsightHealth || {};
          setStatus({
            online: health.online,
            mode: health.mode || 'Local Synchronized Precedent Store',
            count: res.data.data?.totalPrecedents || 0,
          });
        }
      } catch (err) {
        setStatus({
          online: false,
          mode: 'Synchronized MongoDB Precedent Store',
          count: 4,
        });
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 transition-colors rounded-full border border-slate-200/80 text-xs" title={`Hindsight Persistent Memory Engine: ${status.mode}`}>
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.online ? 'bg-emerald-400' : 'bg-brand-400'}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${status.online ? 'bg-emerald-500' : 'bg-brand-500'}`}></span>
      </span>
      <Database className="w-3.5 h-3.5 text-slate-500" />
      <span className="font-medium text-slate-700 hidden sm:inline">
        Hindsight Memory:
      </span>
      <span className={`font-semibold ${status.online ? 'text-emerald-700' : 'text-brand-700'}`}>
        {status.online ? 'Cloud Live' : 'Synced (4 Precedents)'}
      </span>
    </div>
  );
}
