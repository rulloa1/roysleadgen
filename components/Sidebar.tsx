
import React from 'react';

interface SidebarProps {
  activeView: 'dashboard' | 'leads';
  setActiveView: (view: 'dashboard' | 'leads') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="w-64 bg-slate-950 h-screen sticky top-0 text-white flex flex-col p-6 border-r border-white/5">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <span className="bg-blue-600 p-1.5 rounded-lg text-white">M</span>
          Monarch CRM
        </h1>
        <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-[0.2em] font-black">Luxury Portfolio Mgmt</p>
      </div>

      <nav className="flex-1 space-y-2">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
            activeView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
          </svg>
          Market Overview
        </button>
        <button
          onClick={() => setActiveView('leads')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
            activeView === 'leads' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Leads Pipeline
        </button>
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-inner">K</div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">Kashmir Cortave</p>
            <p className="text-[10px] text-slate-500 truncate uppercase font-black tracking-widest">Monarch & Co</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
