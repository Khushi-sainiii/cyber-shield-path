import { useState, useEffect } from 'react';
import { Rocket, Mail, FileWarning, Smartphone, Target, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Department {
  id: string;
  name: string;
  description: string | null;
}

const attackTypes = [
  { value: 'phishing', label: 'Phishing', icon: Mail, description: 'Fake login page attack' },
  { value: 'baiting', label: 'Baiting', icon: FileWarning, description: 'Malicious download attack' },
  { value: 'smishing', label: 'Smishing', icon: Smartphone, description: 'SMS-based phishing' },
  { value: 'spear_phishing', label: 'Spear Phishing', icon: Target, description: 'Targeted attack' },
];

const departmentTemplates: Record<string, { subject: string; body: string; sender: string }> = {
  Finance: {
    subject: '⚠️ Invoice #INV-2024-8847 - Payment Overdue',
    body: 'Dear Finance Team,\n\nWe have detected an overdue invoice requiring immediate attention. Please verify the attached payment details and process the transfer before end of business today to avoid late fees.\n\nClick here to review the invoice details.',
    sender: 'accounts@vendor-payments.com',
  },
  'Human Resources': {
    subject: '📎 Updated Employee Benefits Package - Action Required',
    body: 'Dear HR Team,\n\nPlease review the attached updated benefits package for Q2. All HR personnel must download and review the new policy document before the enrollment deadline.\n\nDownload the document to proceed.',
    sender: 'benefits@hr-portal.com',
  },
  IT: {
    subject: '🔒 Critical Security Patch - Immediate Installation Required',
    body: 'Dear IT Team,\n\nA critical zero-day vulnerability has been discovered. Please install the security patch immediately by clicking the link below. Failure to update within 24 hours may result in system compromise.\n\nInstall patch now.',
    sender: 'security@it-updates.com',
  },
  Marketing: {
    subject: '📊 Campaign Analytics Access - Verify Your Account',
    body: 'Dear Marketing Team,\n\nYour access to the campaign analytics dashboard is expiring. Please verify your credentials to maintain access to real-time campaign performance data.\n\nVerify your account now.',
    sender: 'analytics@marketing-suite.com',
  },
  Operations: {
    subject: '🚨 Supply Chain Alert - Urgent Review Required',
    body: 'Dear Operations Team,\n\nA critical supply chain disruption has been flagged. Please review the attached incident report and confirm mitigation steps immediately.\n\nView the full report.',
    sender: 'alerts@supplychain-ops.com',
  },
  Legal: {
    subject: '⚖️ Contract Amendment - Signature Required by EOD',
    body: 'Dear Legal Team,\n\nAn urgent contract amendment requires your digital signature. Please review and sign the document through the secure portal before end of day.\n\nSign the document now.',
    sender: 'contracts@legal-docs.com',
  },
  Executive: {
    subject: '🔥 Board Meeting Preparation - Confidential Materials',
    body: 'Dear Executive,\n\nPlease review the confidential board meeting materials attached. These documents contain sensitive financial projections and strategic plans.\n\nAccess the materials now.',
    sender: 'board@executive-comms.com',
  },
};

const CampaignLauncher = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({
    name: '',
    campaign_type: 'phishing',
    target_department_id: '',
    email_subject: '',
    email_body: '',
    email_sender: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await supabase.from('departments').select('*').order('name');
      if (data) setDepartments(data as Department[]);
    };
    fetchDepartments();
  }, []);

  const handleDepartmentChange = (deptId: string) => {
    setForm(prev => ({ ...prev, target_department_id: deptId }));
    
    // Auto-fill template based on department
    const dept = departments.find(d => d.id === deptId);
    if (dept && departmentTemplates[dept.name]) {
      const template = departmentTemplates[dept.name];
      setForm(prev => ({
        ...prev,
        target_department_id: deptId,
        email_subject: template.subject,
        email_body: template.body,
        email_sender: template.sender,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from('campaigns').insert({
      name: form.name,
      campaign_type: form.campaign_type as 'phishing' | 'baiting' | 'smishing' | 'spear_phishing',
      target_department_id: form.target_department_id || null,
      email_subject: form.email_subject,
      email_body: form.email_body,
      email_sender: form.email_sender,
      created_by: user.id,
      status: 'active',
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to launch campaign', { description: error.message });
    } else {
      toast.success('Campaign Launched!', {
        description: 'The simulation has been deployed to the target department.',
      });
      setForm({ name: '', campaign_type: 'phishing', target_department_id: '', email_subject: '', email_body: '', email_sender: '' });
    }
  };

  const selectedType = attackTypes.find((t) => t.value === form.campaign_type);
  const selectedDept = departments.find(d => d.id === form.target_department_id);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Launch Simulation</h2>
        <p className="text-muted-foreground mt-1">Create a department-targeted social engineering campaign</p>
      </div>

      <div className="cyber-card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              required
              className="input-cyber"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Q3 Finance Phishing Test"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Attack Type</Label>
              <Select value={form.campaign_type} onValueChange={(value) => setForm({ ...form, campaign_type: value })}>
                <SelectTrigger className="input-cyber">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {attackTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Department</Label>
              <Select value={form.target_department_id} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="input-cyber">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{dept.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedType && (
            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 text-sm">
                <selectedType.icon className="w-4 h-4 text-primary" />
                <span className="font-medium">{selectedType.label}</span>
                {selectedDept && (
                  <>
                    <span className="text-muted-foreground">→</span>
                    <Building2 className="w-4 h-4 text-accent" />
                    <span className="font-medium text-accent">{selectedDept.name}</span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sender">Sender Email (Spoofed)</Label>
            <Input
              id="sender"
              className="input-cyber"
              value={form.email_sender}
              onChange={(e) => setForm({ ...form, email_sender: e.target.value })}
              placeholder="e.g., security@company-portal.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              required
              className="input-cyber"
              value={form.email_subject}
              onChange={(e) => setForm({ ...form, email_subject: e.target.value })}
              placeholder="e.g., ⚠️ Urgent: Password Reset Required"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email Body</Label>
            <Textarea
              id="body"
              required
              className="input-cyber min-h-[150px]"
              value={form.email_body}
              onChange={(e) => setForm({ ...form, email_body: e.target.value })}
              placeholder="Write the deceptive email content here..."
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
          >
            <Rocket className="w-4 h-4" />
            {loading ? 'Deploying...' : 'Launch Simulation'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CampaignLauncher;
