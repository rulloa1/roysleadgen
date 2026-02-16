
export enum LeadStatus {
  NEW_LEAD = 'New Lead',
  READY = 'Ready',
  SENT = 'Sent',
  RESPONDED = 'Responded',
  CONVERTED = 'Converted'
}

export type WebsiteTemplate = 'Professional' | 'Modern' | 'Minimalist';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  website?: string;
  status: LeadStatus;
  demoUrl?: string;
  htmlContent?: string;
  emailBody: string;
  emailSubject: string;
  websiteUrl?: string;
  emailSent: boolean;
  selectedTemplate?: WebsiteTemplate;
  websiteGenerated?: boolean;
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  readyLeads: number;
  emailsSent: number;
}
