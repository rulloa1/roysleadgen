
import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, WebsiteTemplate } from '../types';
import { 
  generatePersonalizedEmail, 
  analyzeLeadProfile, 
  generateCallScript, 
  generateWebsiteContent 
} from '../services/gemini';

interface LeadModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => void;
  onDelete: (id: string) => void;
}

const LeadModal: React.FC<LeadModalProps> = ({ lead, onClose, onUpdate, onDelete }) => {
  const [emailBody, setEmailBody] = useState(lead.emailBody);
  const [insights, setInsights] = useState<string>('');
  const [callScript, setCallScript] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingWebsite, setIsGeneratingWebsite] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'call' | 'insights' | 'website'>('email');
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate>(lead.selectedTemplate || 'Professional');
  const [studioMode, setStudioMode] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsAnalyzing(true);
      const res = await analyzeLeadProfile(`${lead.name}, Status: ${lead.status}`);
      setInsights(res);
      setIsAnalyzing(false);
    };
    fetchInsights();
  }, [lead.id]);

  const handlePersonalize = async () => {
    setIsGenerating(true);
    const newBody = await generatePersonalizedEmail(lead.name, emailBody);
    setEmailBody(newBody);
    setIsGenerating(false);
  };

  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    const script = await generateCallScript(lead.name, lead.status);
    setCallScript(script);
    setIsGeneratingScript(false);
  };

  const handleCopyLink = () => {
    if (!lead.websiteUrl) return;
    navigator.clipboard.writeText(lead.websiteUrl);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleGenerateWebsite = async () => {
    setIsGeneratingWebsite(true);
    try {
      const content = await generateWebsiteContent(lead.name, selectedTemplate);
      
      const agent_name = "Kashmir Cortave";
      const brokerage_name = "Monarch & Co";
      const agent_phone = "(713) 299-2850";
      const agent_email = "kashmir@monarch.co"; 

      const testimonialsHtml = content.testimonials?.map((t: any) => `
        <div style="margin-bottom: 25px; padding: 25px; border: 1px solid #222; background: #1A1A1A; border-radius: 4px;">
            <p style="font-size: 11px; color: #D4AF37; font-style: italic; line-height: 1.6; margin-bottom: 15px;">"${t.quote}"</p>
            <p style="font-size: 10px; font-weight: bold; color: #fff; text-transform: uppercase; letter-spacing: 2px;">- ${t.name}</p>
            <p style="font-size: 8px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">${t.role}</p>
        </div>
      `).join('') || '';

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.page_title} | Monarch & Co</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: #0F0F0F;
            color: #E0E0E0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            overflow-x: hidden;
        }
        a { text-decoration: none; color: inherit; transition: 0.3s; }
        ul { list-style: none; }
        img { max-width: 100%; display: block; object-fit: cover; }
        .font-serif { font-family: 'Didot', 'Bodoni MT', 'Playfair Display', serif; }
        .container { max-width: 1400px; margin: 0 auto; padding: 0 40px; }
        header { padding: 40px 0; border-bottom: 1px solid #1A1A1A; background: #0F0F0F; position: sticky; top: 0; z-index: 100; }
        .brand-logo { font-size: 32px; letter-spacing: 4px; font-weight: bold; color: #FFF; }
        .brand-sub { font-size: 10px; letter-spacing: 6px; color: #666; display: block; margin-top: 10px; }
        nav ul { display: flex; gap: 50px; font-size: 11px; letter-spacing: 3px; font-weight: 600; text-transform: uppercase; }
        .search-section { padding: 80px 0; background: #111; }
        .search-bar { max-width: 800px; margin: 0 auto; position: relative; }
        .search-input { width: 100%; background: #1A1A1A; border: 1px solid #222; padding: 22px 30px; color: #fff; font-size: 16px; border-radius: 2px; }
        .main-layout { display: grid; grid-template-columns: 320px 1fr; gap: 80px; padding: 80px 0; }
        .filter-title { font-size: 24px; margin-bottom: 50px; letter-spacing: 3px; border-bottom: 1px solid #1A1A1A; padding-bottom: 20px; color: #FFF; }
        .filter-label { font-size: 11px; letter-spacing: 3px; color: #555; margin-bottom: 20px; display: block; text-transform: uppercase; }
        .property-card { background: #151515; border: 1px solid #1A1A1A; transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .property-card:hover { border-color: #D4AF37; transform: translateY(-10px); }
        .card-image-wrapper { height: 350px; overflow: hidden; }
        .card-image { width: 100%; height: 100%; transition: transform 1.2s ease; }
        .property-card:hover .card-image { transform: scale(1.1); }
        .card-details { padding: 40px; text-align: center; }
        .price { font-size: 24px; color: #D4AF37; margin-bottom: 15px; letter-spacing: 2px; }
        .address { font-size: 20px; margin-bottom: 12px; color: #FFF; font-weight: 300; }
        .specs { font-size: 12px; color: #555; letter-spacing: 3px; margin-bottom: 30px; text-transform: uppercase; }
        .btn-view { background: transparent; border: 1px solid #333; color: #FFF; padding: 15px 35px; font-size: 11px; letter-spacing: 4px; cursor: pointer; transition: 0.4s; text-transform: uppercase; }
        .property-card:hover .btn-view { background: #D4AF37; border-color: #D4AF37; color: #000; font-weight: bold; }
        footer { border-top: 1px solid #1A1A1A; padding: 120px 0; margin-top: 120px; font-size: 14px; color: #444; }
        .footer-grid { display: grid; grid-template-columns: 1.8fr 1fr 1fr; gap: 100px; }
        .footer-heading { color: #FFF; margin-bottom: 40px; font-size: 18px; letter-spacing: 3px; text-transform: uppercase; }
        .text-highlight { color: #D4AF37; }
    </style>
</head>
<body>
    <header>
        <div class="container" style="display:flex; justify-content:space-between; align-items:center;">
            <div class="brand">
                <div class="brand-logo font-serif uppercase">Theopolis</div>
                <span class="brand-sub uppercase">Premier Real Estate</span>
            </div>
            <nav>
                <ul>
                    <li><a href="#">Properties</a></li>
                    <li><a href="#">The Studio</a></li>
                    <li><a href="#">Contact</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <div class="search-section">
        <div class="container">
            <div class="search-bar text-center">
                <input type="text" class="search-input" placeholder="Explore exclusive estates in ${content.listing_city}...">
            </div>
        </div>
    </div>

    <div class="container main-layout">
        <aside>
            <div class="filter-title font-serif uppercase">Curate</div>
            
            <div style="margin-bottom: 60px;">
                <label class="filter-label">Market Strategy</label>
                <p style="font-size: 11px; color: #444; line-height: 1.8; margin-bottom: 30px;">Kashmir Cortave leverages Monarch & Co's proprietary AI systems to match elite portfolios with global buyers instantly.</p>
                ${testimonialsHtml}
            </div>
        </aside>

        <main style="display:grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 40px;">
            <div class="property-card">
                <div class="card-image-wrapper">
                    <img src="${content.listing_image_url}" class="card-image">
                </div>
                <div class="card-details">
                    <div class="price font-serif">${content.listing_price}</div>
                    <div class="address font-serif uppercase">
                        ${content.listing_address}<br><span style="color:#444">${content.listing_city}, ${content.listing_state}</span>
                    </div>
                    <div class="specs">
                        ${content.listing_beds} BEDS | ${content.listing_baths} BATHS | ${content.listing_sqft} SQ FT
                    </div>
                    <button class="btn-view">Inquire Privately</button>
                </div>
            </div>
        </main>
    </div>

    <footer>
        <div class="container footer-grid">
            <div>
                <h4 class="footer-heading font-serif">Monarch & Co</h4>
                <p style="line-height: 2;">Monarch & Co is the global benchmark for high-end real estate, representing the world's most distinguished estates. Principal agent Kashmir Cortave integrates cutting-edge AI to ensure zero lead friction and absolute discretion.</p>
                <br>
                <p style="color:#FFF;"><strong class="text-highlight">Principal Agent:</strong> ${agent_name}</p>
                <p style="color:#FFF;"><strong class="text-highlight">Brokerage:</strong> ${brokerage_name}</p>
            </div>
            <div>
                <h4 class="footer-heading font-serif">Registry</h4>
                <ul style="letter-spacing: 2px; font-size: 11px; text-transform: uppercase;">
                    <li style="margin-bottom:15px;"><a href="#">Private Collection</a></li>
                    <li style="margin-bottom:15px;"><a href="#">International Desk</a></li>
                    <li style="margin-bottom:15px;"><a href="#">Luxury Insights</a></li>
                </ul>
            </div>
            <div>
                <h4 class="footer-heading font-serif">Private Desk</h4>
                <p><a href="mailto:${agent_email}" class="text-highlight" style="font-weight:bold;">${agent_email}</a></p>
                <p style="margin-top:15px; color:#FFF;">${agent_phone}</p>
                <p style="margin-top:15px; font-size: 11px; color:#333;">2211 Norfolk St #650, Houston, TX 77098</p>
                <br>
                <p style="font-size:10px; opacity:0.3;">&copy; 2026 Monarch & Co. AI Powered by Roy.</p>
            </div>
        </div>
    </footer>
</body>
</html>`;

      // Generate a simulated secure Monarch URL
      const publicId = Math.random().toString(36).substring(7).toUpperCase();
      const simulatedUrl = `https://monarch.co/portal/private-access-${publicId}`;

      // Automatically update the email body with the new link
      const linkCta = `\n\nI’ve also curated a secure, private digital portfolio featuring properties that match your specific criteria. You can access it exclusively here:\n${simulatedUrl}\n\n`;
      const updatedBody = emailBody.includes('https://monarch.co/') 
        ? emailBody.replace(/https:\/\/monarch.co\/[^\s]+/, simulatedUrl)
        : emailBody + linkCta;

      setEmailBody(updatedBody);

      onUpdate(lead.id, { 
        htmlContent: html, 
        websiteGenerated: true, 
        websiteUrl: simulatedUrl,
        emailBody: updatedBody,
        selectedTemplate 
      });
      
      setActiveTab('email'); // Switch back to email to show the new link injected
    } catch (err) {
      console.error("Website generation UI error:", err);
    } finally {
      setIsGeneratingWebsite(false);
    }
  };

  const handleSendEmail = () => {
    onUpdate(lead.id, { emailBody, status: LeadStatus.SENT, emailSent: true });
    onClose();
  };

  const toggleStatus = () => {
    const statuses = Object.values(LeadStatus);
    const currentIndex = statuses.indexOf(lead.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    onUpdate(lead.id, { status: statuses[nextIndex] });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className={`bg-white transition-all duration-700 ease-in-out overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.4)] flex flex-col md:flex-row ${studioMode ? 'w-full h-full rounded-none' : 'rounded-[3rem] w-full max-w-6xl h-[90vh]'}`}>
        
        {/* Sidebar - Profile Area */}
        {!studioMode && (
          <div className="md:w-80 bg-slate-50 p-10 border-r border-slate-100 flex flex-col overflow-y-auto">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-200 mb-6">
                {lead.name[0]}
              </div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight mb-2">{lead.name}</h2>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${lead.status === LeadStatus.NEW_LEAD ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                {lead.status}
              </span>
              <button onClick={toggleStatus} className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 hover:text-blue-600 transition-colors">
                Cycle Pipeline →
              </button>
            </div>

            <div className="space-y-8 flex-1">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-4 block">Contact Details</span>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-slate-600 font-bold group">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <span className="truncate">{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 font-bold group">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <span>{lead.phone}</span>
                  </div>
                </div>
              </div>

              {lead.websiteGenerated && (
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col gap-3">
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Asset Ready</span>
                    <p className="text-xs text-emerald-800 font-bold">Custom luxury portfolio generated.</p>
                  </div>
                  <button 
                    onClick={handleCopyLink}
                    className="w-full py-2 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2"
                  >
                    {showCopied ? 'Link Copied' : 'Copy Portfolio URL'}
                  </button>
                </div>
              )}
            </div>

            <div className="pt-8 mt-auto border-t border-slate-200">
               <button 
                  onClick={() => { if(confirm('Permanently archive this prospect?')) onDelete(lead.id); }}
                  className="w-full py-4 text-xs font-black text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  Archive Lead
                </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          
          {/* Header Controls */}
          <div className={`px-10 py-8 border-b border-slate-100 flex items-center justify-between transition-colors duration-500 ${studioMode ? 'bg-slate-950 text-white border-slate-800' : ''}`}>
            {studioMode ? (
              <div className="flex items-center gap-6">
                <button onClick={() => setStudioMode(false)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                  Exit Studio
                </button>
                <div className="h-6 w-px bg-white/10"></div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Studio Live Preview: <span className="text-white">${lead.name}'s Monarchy</span>
                </p>
              </div>
            ) : (
              <div className="flex gap-8">
                {(['email', 'call', 'insights', 'website'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all border-b-2 relative ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-300 hover:text-slate-500'}`}
                  >
                    {tab === 'website' ? 'Portfolio Site' : tab}
                    {tab === 'website' && lead.websiteGenerated && <span className="absolute -top-1 -right-2 w-2 h-2 bg-emerald-500 rounded-full"></span>}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4">
              {activeTab === 'website' && lead.htmlContent && !studioMode && (
                <button 
                  onClick={() => setStudioMode(true)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl"
                >
                  Enter Studio Preview
                </button>
              )}
              {!studioMode && (
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* Workspace Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {activeTab === 'email' && !studioMode && (
              <div className="p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-end">
                   <div>
                     <h3 className="text-3xl font-black text-slate-900 tracking-tight">Email Strategy</h3>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Personalized by Gemini</p>
                   </div>
                   <div className="flex gap-3">
                    {lead.websiteGenerated && (
                       <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in zoom-in-95">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Portfolio Link Injected</span>
                       </div>
                    )}
                    <button 
                      onClick={handlePersonalize} 
                      disabled={isGenerating}
                      className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-5 py-3 rounded-2xl flex items-center gap-2 hover:bg-blue-100 disabled:opacity-50 transition-all border border-blue-100"
                    >
                      {isGenerating ? 'AI Writing...' : lead.websiteGenerated ? 'Re-align with Portfolio' : 'AI Personalize Outreach'}
                    </button>
                   </div>
                </div>
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Subject Line</p>
                  <p className="font-bold text-slate-800 text-xl">{lead.emailSubject}</p>
                </div>
                <div className="relative group">
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full h-[450px] p-10 bg-white border border-slate-100 rounded-[2.5rem] focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none text-slate-700 shadow-sm leading-relaxed resize-none text-xl font-medium"
                    placeholder="The outreach draft is appearing..."
                  />
                  {lead.websiteGenerated && (
                    <div className="absolute top-8 right-8 pointer-events-none">
                       <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-lg border border-blue-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">Dynamic Link Tracking Enabled</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'website' && (
              <div className={`h-full transition-all duration-700 ${studioMode ? 'bg-slate-950 p-0' : 'p-12'}`}>
                {lead.htmlContent ? (
                  <div className={`h-full flex flex-col ${studioMode ? 'animate-in zoom-in-95 duration-1000' : ''}`}>
                    <div className={`flex-1 overflow-hidden shadow-2xl relative transition-all duration-700 ${studioMode ? 'rounded-none border-none' : 'rounded-[3rem] border-8 border-slate-50 shadow-[0_40px_100px_rgba(0,0,0,0.2)]'}`}>
                      <iframe 
                        title="Live Asset Preview"
                        srcDoc={lead.htmlContent}
                        className="w-full h-full border-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[4rem] bg-slate-50 text-slate-400 p-20 text-center animate-in fade-in duration-700">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-10 shadow-2xl border border-slate-100">
                      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Luxury Asset Studio</h3>
                    <p className="max-w-md mx-auto leading-relaxed mb-12 text-lg text-slate-500 font-medium">Generate a bespoke Monarch & Co landing page for ${lead.name}. The access link will be automatically saved and added to your outreach email.</p>
                    <button 
                      onClick={handleGenerateWebsite}
                      disabled={isGeneratingWebsite}
                      className="px-12 py-6 bg-blue-600 text-white font-black rounded-3xl shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-4 disabled:opacity-50 text-sm uppercase tracking-widest"
                    >
                      {isGeneratingWebsite ? 'Roy AI is Curating Site...' : 'Construct & Sync Portfolio'}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {(activeTab === 'call' || activeTab === 'insights') && !studioMode && (
              <div className="p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight capitalize">{activeTab} Strategy</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gemini Pro Reasoning</p>
                  </div>
                  {activeTab === 'call' && (
                    <button 
                      onClick={handleGenerateScript} 
                      disabled={isGeneratingScript}
                      className="px-6 py-3 bg-orange-50 text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-orange-100 disabled:opacity-50 border border-orange-100"
                    >
                      {isGeneratingScript ? 'Writing...' : 'Update Voice Script'}
                    </button>
                  )}
                </div>
                <div className="p-12 bg-slate-50 rounded-[3.5rem] border border-slate-100 shadow-inner min-h-[500px]">
                  {activeTab === 'call' ? (
                    <p className="text-2xl font-serif italic text-slate-700 leading-[1.8] whitespace-pre-wrap">{callScript || "Generate a voice script to initiate outbound outreach."}</p>
                  ) : (
                    <p className="text-2xl font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">{isAnalyzing ? "Roy AI is analyzing market profile..." : (insights || "Strategy analysis pending...")}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer UI */}
          {!studioMode && (
            <div className="px-10 py-8 border-t border-slate-100 bg-white flex justify-end gap-5">
              <button onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Close Workspace</button>
              <button 
                onClick={handleSendEmail} 
                className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-3 text-[10px] uppercase tracking-widest"
              >
                Execute Campaign
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadModal;
