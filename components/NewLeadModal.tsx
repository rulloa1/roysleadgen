
import React, { useState } from 'react';
import { Lead, LeadStatus } from '../types';

interface NewLeadModalProps {
  onClose: () => void;
  onAdd: (lead: Lead) => void;
}

const NewLeadModal: React.FC<NewLeadModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newLead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      phone: formData.phone || 'N/A',
      status: LeadStatus.NEW_LEAD,
      emailSent: false,
      emailSubject: `Luxury Portfolio: Exclusive Update for ${formData.name}`,
      emailBody: `Hi ${formData.name},\n\nI was reviewing your property profile and wanted to reach out from Monarch & Co.\n\nAt Monarch & Co, we're implementing advanced AI voice systems to ensure our clients' luxury listings receive 24/7 high-touch engagement. I’d love to show you how this technology can elevate your experience.\n\nAre you available for a brief conversation this week?\n\nBest regards,\n\nKashmir Cortave\nMonarch & Co\n(713) 299-2850`
    };

    onAdd(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl p-10 border border-slate-200">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Prospect</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Acquire Opportunity</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest block mb-2">Full Name *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Julian Montgomery"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest block mb-2">Email Address *</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="luxury@monarch.com"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest block mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(000) 000-0000"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group"
            >
              Initialize Lead
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewLeadModal;
