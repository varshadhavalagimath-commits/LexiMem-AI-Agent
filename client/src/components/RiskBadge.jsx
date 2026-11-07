import React from 'react';
import { AlertTriangle, AlertOctagon, Info, ShieldCheck, AlertCircle } from 'lucide-react';

const riskConfig = {
  Critical: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertOctagon,
  },
  High: {
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: AlertTriangle,
  },
  Medium: {
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertCircle,
  },
  Low: {
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ShieldCheck,
  },
  Informational: {
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Info,
  },
};

export default function RiskBadge({ level = 'Low', score, showIcon = true, className = '' }) {
  const config = riskConfig[level] || riskConfig.Low;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${config.color} ${className}`}>
      {showIcon && <Icon className="w-3.5 h-3.5 mr-1 flex-shrink-0" />}
      <span>{level}</span>
      {score !== undefined && (
        <span className="ml-1.5 px-1.5 py-0.2 bg-white/70 rounded text-[10px] font-mono font-bold">
          {score}
        </span>
      )}
    </span>
  );
}
