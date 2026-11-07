import React, { useState } from 'react';
import { Search, Bell, Shield, User, LogOut, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import HindsightStatusPill from './HindsightStatusPill';

export default function Navbar({ onSearch }) {
  const { user, logout, switchDemoRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchValue);
  };

  const roles = [
    { key: 'admin', label: 'Admin (Victoria Vance)', role: 'admin' },
    { key: 'lawyer', label: 'Legal Manager (David Sterling)', role: 'lawyer' },
    { key: 'business_user', label: 'Contract Employee (Marcus Chen)', role: 'business_user' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Global Search */}
      <form onSubmit={handleSearchSubmit} className="relative w-80 max-w-md hidden md:block">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search contracts, clauses, counterparties..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Hindsight Memory Health */}
        <HindsightStatusPill />

        {/* Demo Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className="flex items-center space-x-1.5 px-3 py-1 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg text-xs font-medium border border-brand-200/80 transition-colors"
            title="Fast Persona Switcher for Evaluation"
          >
            <Shield className="w-3.5 h-3.5 text-brand-600" />
            <span className="capitalize">{user?.role?.replace('_', ' ') || 'Role'}</span>
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>

          {roleSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Switch Demo Persona
              </div>
              {roles.map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    switchDemoRole(r.key);
                    setRoleSwitcherOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${user?.role === r.role ? 'font-semibold text-brand-600 bg-brand-50/50' : 'text-slate-700'}`}
                >
                  <div>
                    <div>{r.label}</div>
                    <div className="text-[10px] text-slate-400 uppercase">{r.role}</div>
                  </div>
                  {user?.role === r.role && <Check className="w-4 h-4 text-brand-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 pl-2 pr-1 py-1 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center font-semibold text-xs shadow-sm">
              {user?.name?.slice(0, 2).toUpperCase() || 'LM'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'User'}</div>
              <div className="text-[10px] text-slate-500">{user?.department || 'Legal Team'}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded uppercase font-semibold">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
