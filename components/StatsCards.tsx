
import React from 'react';
import { DashboardStats } from '../types';

interface StatsCardsProps {
  stats: DashboardStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[
        { label: 'Total Leads', value: stats.totalLeads, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'New Leads', value: stats.newLeads, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Ready to Contact', value: stats.readyLeads, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Emails Sent', value: stats.emailsSent, color: 'text-purple-600', bg: 'bg-purple-50' },
      ].map((card, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-transform hover:scale-[1.02]">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className={`text-3xl font-bold ${card.color}`}>{card.value}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${card.bg} ${card.color}`}>+12%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
