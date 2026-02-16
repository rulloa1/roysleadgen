
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import LeadModal from './components/LeadModal';
import NewLeadModal from './components/NewLeadModal';
import LiveCallOverlay from './components/LiveCallOverlay';
import { INITIAL_LEADS } from './data';
import { Lead, LeadStatus, DashboardStats } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'leads'>('dashboard');
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [callingLead, setCallingLead] = useState<Lead | null>(null);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>('All');

  const stats: DashboardStats = useMemo(() => {
    return {
      totalLeads: leads.length,
      newLeads: leads.filter(l => l.status === LeadStatus.NEW_LEAD).length,
      readyLeads: leads.filter(l => l.status === LeadStatus.READY).length,
      emailsSent: leads.filter(l => l.status === LeadStatus.SENT).length,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           l.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  const hotLeads = useMemo(() => {
    return leads.filter(l => l.status === LeadStatus.NEW_LEAD).slice(0, 5);
  }, [leads]);

  const handleUpdateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => {
      const newLeads = prev.map(l => l.id === id ? { ...l, ...updates } : l);
      // Synchronize selectedLead if it's the one being updated
      if (selectedLead?.id === id) {
        const updated = newLeads.find(l => l.id === id);
        if (updated) setSelectedLead(updated);
      }
      return newLeads;
    });
  };

  const handleDeleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    setSelectedLead(null);
  };

  const handleAddLead = (newLead: Lead) => {
    setLeads(prev => [newLead, ...prev]);
  };

  const getStatusColor = (status: LeadStatus) => {
    switch(status) {
      case LeadStatus.NEW_LEAD: return 'bg-orange-100 text-orange-700';
      case LeadStatus.READY: return 'bg-blue-100 text-blue-700';
      case LeadStatus.SENT: return 'bg-purple-100 text-purple-700';
      case LeadStatus.CONVERTED: return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {activeView === 'dashboard' ? 'Market Overview' : 'Leads Pipeline'}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              {activeView === 'dashboard' ? 'Performance tracking and latest acquisitions.' : 'Comprehensive management of your outreach campaign.'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-72 shadow-sm transition-all"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-4 top-4 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <button 
              onClick={() => setIsAddingLead(true)}
              className="px-6 py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              New Lead
            </button>
          </div>
        </header>

        {activeView === 'dashboard' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StatsCards stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-900">Priority Follow-ups</h3>
                  <button onClick={() => setActiveView('leads')} className="text-sm font-bold text-blue-600 hover:underline">View All Pipeline →</button>
                </div>
                <div className="space-y-4">
                  {hotLeads.map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => setSelectedLead(lead)}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-blue-600">{lead.name[0]}</div>
                        <div>
                          <p className="font-bold text-slate-900">{lead.name}</p>
                          <p className="text-xs text-slate-500">{lead.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {lead.websiteGenerated && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">SITE LIVE</span>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">High Interest</span>
                      </div>
                    </div>
                  ))}
                  {hotLeads.length === 0 && (
                    <p className="text-center py-10 text-slate-400">No priority leads at the moment.</p>
                  )}
                </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl">
                <div>
                   <h3 className="text-xl font-bold mb-2">Campaign ROI</h3>
                   <p className="text-slate-400 text-sm">Your AI automation is performing 40% better than manual outreach.</p>
                </div>
                <div className="my-8">
                   <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Conversion Rate</span>
                      <span className="font-bold">24.8%</span>
                   </div>
                   <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[24.8%]"></div>
                   </div>
                </div>
                <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all backdrop-blur-md">
                   Download Full Report
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-900">Master Pipeline</h2>
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                 {(['All', LeadStatus.NEW_LEAD, LeadStatus.READY, LeadStatus.SENT] as const).map(f => (
                   <button 
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === f ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     {f}
                   </button>
                 ))}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="px-10 py-5">Profile</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Asset</th>
                    <th className="px-10 py-5 text-right">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            {lead.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-none mb-1">{lead.name}</p>
                            <p className="text-xs text-slate-400">{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        {lead.websiteGenerated ? (
                          <div className="flex items-center gap-2 text-emerald-600">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                             <span className="text-xs font-bold">Site Generated</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">No Asset</span>
                        )}
                      </td>
                      <td className="px-10 py-6 text-right space-x-2">
                        <button 
                          onClick={() => setCallingLead(lead)}
                          className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="Initiate AI Outbound Call"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </button>
                        <button 
                          onClick={() => setSelectedLead(lead)}
                          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {selectedLead && (
        <LeadModal 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
          onUpdate={handleUpdateLead}
          onDelete={handleDeleteLead}
        />
      )}

      {isAddingLead && (
        <NewLeadModal 
          onClose={() => setIsAddingLead(false)}
          onAdd={handleAddLead}
        />
      )}

      {callingLead && (
        <LiveCallOverlay 
          lead={callingLead}
          onClose={() => setCallingLead(null)}
        />
      )}
    </div>
  );
};

export default App;
