
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generatePersonalizedEmail = async (leadName: string, originalBody: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        I am Kashmir Cortave, a luxury real estate agent at Monarch & Co. 
        I am reaching out to ${leadName}. 
        
        Original Draft: "${originalBody}"
        
        Task: Rewrite this outreach to be sophisticated, prestigious, and high-converting.
        
        CRITICAL: If there is a link (e.g., https://monarch.co/...) in the draft, treat it as an exclusive, private portfolio created specifically for them. Frame it as a high-value digital asset. 
        
        Return ONLY the rewritten body text.
      `,
    });
    return response.text || originalBody;
  } catch (error) {
    console.error("Gemini personalization failed:", error);
    return originalBody;
  }
};

export const generateCallScript = async (leadName: string, status: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Act as a master sales coach for Kashmir Cortave of Monarch & Co. 
        Create a professional 45-second consultative phone call script for a lead named ${leadName} (Pipeline Status: ${status}).
        
        The objective is to pitch Monarch & Co's proprietary AI Voice Integration.
        
        The script MUST include these specific sections:
        1. THE PRESTIGIOUS HOOK: Introduction as Kashmir from Monarch & Co.
        2. THE MONARCH VALUE: Mention 24/7 high-touch engagement, zero lead friction, and how AI ensures luxury clients never wait for a callback.
        3. DISCOVERY QUESTIONS: Include 2-3 qualifying questions to ask the lead (e.g., current inquiry volume, typical response time, or current tech stack gaps).
        4. THE EXCLUSIVE CLOSE: A low-friction request for a private 10-minute demo of the system.
        
        Tone: Sophisticated, authoritative, and outcome-oriented. 
        Return ONLY the script text, formatted with section headers.
      `,
    });
    return response.text || "Hello, this is Kashmir Cortave from Monarch & Co...";
  } catch (error) {
    console.error("Gemini script failed:", error);
    return "Call script generation failed.";
  }
};

export const analyzeLeadProfile = async (leadInfo: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this CRM lead for Kashmir Cortave (Monarch & Co): ${leadInfo}. Provide a 2-sentence tactical summary and a 'luxury winning strategy' for conversion.`,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Failed to analyze lead.";
  }
};

export const generateWebsiteContent = async (leadName: string, template: string) => {
  const ai = getAI();
  const prompt = `
    Generate luxury real estate listing data for a personalized demo website for ${leadName}.
    The site is branded for Kashmir Cortave at Monarch & Co.
    
    Return ONLY a JSON object with EXACTLY these fields:
    - page_title: A title like "${leadName} | The Monarch Collection"
    - listing_price: A price like "$12,450,000"
    - listing_address: A premium street address (e.g., "702 River Oaks Blvd")
    - listing_city: A luxury city (e.g., "Houston", "Beverly Hills", "Aspen")
    - listing_state: State abbreviation
    - listing_beds: Number of beds (e.g., "6")
    - listing_baths: Number of baths (e.g., "7")
    - listing_sqft: Square footage (e.g., "11,500")
    - listing_image_url: A high-res modern luxury mansion URL.
    - testimonials: An array of 3 objects { name: string, quote: string, role: string } praising Kashmir Cortave's use of AI at Monarch & Co.
    
    Style: Prestigious, High-End.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini website content generation failed:", error);
    return {
      page_title: `${leadName} | The Monarch Collection`,
      listing_price: "$8,250,000",
      listing_address: "2100 Memorial Drive",
      listing_city: "Houston",
      listing_state: "TX",
      listing_beds: "6",
      listing_baths: "5.5",
      listing_sqft: "9,200",
      listing_image_url: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
      testimonials: [
        { name: "John R.", role: "Developer", quote: "Kashmir's AI integration at Monarch & Co captured a $12M lead while we were at dinner. Remarkable." },
        { name: "Elena S.", role: "Broker", quote: "The black-tie service of AI. Kashmir's high-net-worth clients actually love the immediate response." },
        { name: "Marcus T.", role: "Investor", quote: "Monarch & Co is ahead of the curve. No inquiry ever goes unanswered." }
      ]
    };
  }
};
