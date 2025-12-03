export interface User {
  name: string;
  email: string;
  role: 'admin' | 'employee';
}

export interface Email {
  id: string;
  campaign_name: string;
  type: 'phishing' | 'baiting' | 'smishing' | 'spear-phishing';
  subject: string;
  body: string;
  sent_at: Date;
  status: 'sent' | 'clicked' | 'compromised';
}

export interface Stats {
  total_sent: number;
  total_clicked: number;
  vulnerability_score: number;
}

const emails: Email[] = [
  {
    id: 'email-1',
    campaign_name: 'IT Security',
    type: 'phishing',
    subject: '⚠️ Urgent: Your Password Expires in 24 Hours',
    body: 'Dear Employee,\n\nYour company password will expire in 24 hours. To avoid losing access to your account, please verify your credentials immediately by clicking the link below.\n\nThis is an automated security notice.',
    sent_at: new Date(),
    status: 'sent',
  },
  {
    id: 'email-2',
    campaign_name: 'HR Department',
    type: 'baiting',
    subject: '📎 Q4 Bonus Structure - Confidential',
    body: 'Hi Team,\n\nPlease find attached the confidential Q4 bonus structure document. Download and review your projected bonus before the end of the week.\n\nBest regards,\nHR Team',
    sent_at: new Date(),
    status: 'sent',
  },
  {
    id: 'email-3',
    campaign_name: 'CEO Office',
    type: 'spear-phishing',
    subject: '🔥 URGENT: Wire Transfer Required ASAP',
    body: 'Hi,\n\nI need you to process an urgent wire transfer for a confidential acquisition. Please respond immediately with your availability. Do not discuss this with anyone else.\n\nSent from my iPhone',
    sent_at: new Date(),
    status: 'sent',
  },
];

export const MOCK_DB = {
  stats: { total_sent: 15, total_clicked: 4, vulnerability_score: 72 } as Stats,
  emails,
};

export const api = {
  get: async (endpoint: string): Promise<{ data: Stats | Email[] }> => {
    await new Promise((r) => setTimeout(r, 300));
    if (endpoint.includes('/stats')) return { data: { ...MOCK_DB.stats } };
    if (endpoint.includes('/inbox/')) return { data: [...MOCK_DB.emails] };
    return { data: [] as Email[] };
  },
  post: async (endpoint: string, body?: Record<string, unknown>): Promise<{ data: Record<string, unknown> }> => {
    await new Promise((r) => setTimeout(r, 300));
    if (endpoint.includes('/campaigns/launch') && body) {
      MOCK_DB.stats.total_sent += 1;
      const newEmail: Email = {
        id: `email-${Date.now()}`,
        campaign_name: (body.title as string) || 'Security Team',
        type: body.type as Email['type'],
        subject: body.subject as string,
        body: body.body as string,
        sent_at: new Date(),
        status: 'sent',
      };
      MOCK_DB.emails.unshift(newEmail);
      return { data: { message: 'Launched' } };
    }
    if (endpoint.includes('/track/click')) {
      MOCK_DB.stats.total_clicked += 1;
      MOCK_DB.stats.vulnerability_score = Math.max(0, MOCK_DB.stats.vulnerability_score - 5);
      return { data: { status: 'tracked' } };
    }
    if (endpoint.includes('/track/compromise')) {
      MOCK_DB.stats.vulnerability_score = Math.max(0, MOCK_DB.stats.vulnerability_score - 15);
      return { data: { message: 'Compromised' } };
    }
    return { data: {} };
  },
};
