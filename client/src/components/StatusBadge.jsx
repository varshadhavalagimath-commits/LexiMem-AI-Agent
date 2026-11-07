import React from 'react';

const statusStyles = {
  // Contract statuses
  'Draft': 'bg-slate-100 text-slate-700 border-slate-200',
  'Submitted': 'bg-blue-50 text-blue-700 border-blue-200',
  'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Changes Requested': 'bg-orange-50 text-orange-700 border-orange-200',
  'Negotiation': 'bg-purple-50 text-purple-700 border-purple-200',
  'Pending Approval': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Signed': 'bg-teal-50 text-teal-700 border-teal-200',
  'Active': 'bg-green-50 text-green-700 border-green-200',
  'Expired': 'bg-rose-50 text-rose-700 border-rose-200',
  'Terminated': 'bg-red-50 text-red-700 border-red-200',
  'Archived': 'bg-gray-100 text-gray-600 border-gray-200',

  // Obligation / Precedent statuses
  'pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'in_progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'overdue': 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
  'approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'rejected': 'bg-rose-50 text-rose-700 border-rose-200',
  'modified': 'bg-purple-50 text-purple-700 border-purple-200',
  'superseded': 'bg-slate-100 text-slate-500 border-slate-200 line-through',
};

export default function StatusBadge({ status, className = '' }) {
  const style = statusStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {status ? status.replace('_', ' ') : 'Unknown'}
    </span>
  );
}
