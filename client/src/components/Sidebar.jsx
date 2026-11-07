import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  Brain,
  Database,
  GitPullRequest,
  CheckSquare,
  Clock,
  Calendar,
  ShieldCheck,
  BarChart3,
  History,
  Scale,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Contracts', href: '/contracts', icon: FileText },
  { name: 'Upload Contract', href: '/upload', icon: UploadCloud },
  { name: 'Precedent Intelligence', href: '/precedents', icon: Brain, badge: 'Hindsight' },
  { name: 'Memory Center', href: '/memory', icon: Database },
  { name: 'Negotiation Assistant', href: '/negotiation', icon: GitPullRequest },
  { name: 'Approvals', href: '/approvals', icon: CheckSquare },
  { name: 'Obligations', href: '/obligations', icon: Clock },
  { name: 'Renewals', href: '/renewals', icon: Calendar },
  { name: 'Policy Center', href: '/policies', icon: ShieldCheck },
  { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
  { name: 'Audit Logs', href: '/audit', icon: History, role: ['admin', 'lawyer'] },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-navy-950 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-navy-900 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-navy-900/80 bg-navy-950">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white shadow-md shadow-brand-900/40">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide flex items-center space-x-1">
              <span>LexiMem</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-brand-500/20 text-brand-400 rounded border border-brand-500/30">AI</span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider">Contract Precedent Agent</div>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
          Contract Lifecycle
        </div>

        {navigation.map((item) => {
          if (item.role && !item.role.includes(user?.role)) {
            return null;
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-navy-900/60'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent-500/20 text-accent-400 border border-accent-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Organization Badge Footer */}
      <div className="p-3 border-t border-navy-900/80 bg-navy-950/80">
        <div className="p-2.5 rounded-lg bg-navy-900/60 border border-navy-800/60 text-xs">
          <div className="text-[11px] font-semibold text-slate-200 truncate">
            {user?.organization?.name || 'Apex Global Technologies'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active Organization"></span>
          </div>
        </div>
      </div>
    </aside>
  );
}
