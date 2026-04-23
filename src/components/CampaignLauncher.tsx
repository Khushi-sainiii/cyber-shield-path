import { useState } from 'react';
import { Rocket, Mail, FileWarning, Smartphone, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const attackTypes = [
  { value: 'phishing', label: 'Phishing', icon: Mail, description: 'Fake login page attack' },
  { value: 'baiting', label: 'Baiting', icon: FileWarning, description: 'Malicious download attack' },
  { value: 'smishing', label: 'Smishing', icon: Smartphone, description: 'SMS-based phishing' },
  { value: 'spear_phishing', label: 'Spear Phishing', icon: Target, description: 'Targeted attack' },
];

const CampaignLauncher = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', type: 'phishing' as 'phishing' | 'baiting' | 'smishing' | 'spear_phishing', subject: '', body: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be signed in');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('campaigns').insert({
      name: form.title,
      campaign_type: form.type,
      email_subject: form.subject,
      email_body: form.body,
      status: 'active',
      created_by: user.id,
    });
    setLoading(false);
    if (error) {
      toast.error('Failed to launch campaign', { description: error.message });
      return;
    }
    toast.success('Campaign launched!', { description: 'Switch to an employee account to test the simulation.' });
    setForm({ title: '', type: 'phishing', subject: '', body: '' });
  };

  const selectedType = attackTypes.find((t) => t.value === form.type);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Launch Simulation</h2>
        <p className="text-muted-foreground mt-1">Create a social engineering campaign to test employee awareness</p>
      </div>

      <div className="cyber-card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Name</Label>
            <Input id="title" required className="input-cyber" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Q3 Security Audit" />
          </div>

          <div className="space-y-2">
            <Label>Attack Type</Label>
            <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as typeof form.type })}>
              <SelectTrigger className="input-cyber">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {attackTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">- {type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedType && (
            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 text-sm">
                <selectedType.icon className="w-4 h-4 text-primary" />
                <span className="font-medium">{selectedType.label}:</span>
                <span className="text-muted-foreground">{selectedType.description}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input id="subject" required className="input-cyber" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g., ⚠️ Urgent: Password Reset Required" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email Body</Label>
            <Textarea id="body" required className="input-cyber min-h-[150px]" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write the deceptive email content here..." />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2">
            <Rocket className="w-4 h-4" />
            {loading ? 'Deploying...' : 'Launch Simulation'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CampaignLauncher;
