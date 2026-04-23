import { useEffect, useState } from 'react';
import { Mail, RefreshCw, Clock, Paperclip, ExternalLink, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Email } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { userActions } from '@/lib/actions';
import { toast } from 'sonner';

interface InboxProps {
  currentUser: { name: string; email: string };
  onEmailClick: (email: Email) => void;
}

const typeMap: Record<string, Email['type']> = {
  phishing: 'phishing',
  baiting: 'baiting',
  smishing: 'smishing',
  spear_phishing: 'spear-phishing',
};

const Inbox = ({ currentUser, onEmailClick }: InboxProps) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmails = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('campaigns')
      .select('id, name, campaign_type, email_subject, email_body, created_at, status')
      .eq('status', 'active')
      .neq('name', 'Simulation Logs')
      .order('created_at', { ascending: false })
      .limit(20);

    const built: Email[] = (data ?? []).map((c) => ({
      id: c.id,
      campaign_name: c.name,
      type: typeMap[c.campaign_type] ?? 'phishing',
      subject: c.email_subject ?? '(no subject)',
      body: c.email_body ?? '',
      sent_at: new Date(c.created_at),
      status: 'sent',
    }));
    setEmails(built);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
    const channel = supabase
      .channel('inbox_campaigns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, () => fetchEmails())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTypeColor = (type: Email['type']) => {
    switch (type) {
      case 'phishing': return 'bg-destructive/20 text-destructive';
      case 'baiting': return 'bg-warning/20 text-warning';
      case 'smishing': return 'bg-primary/20 text-primary';
      case 'spear-phishing': return 'bg-accent/20 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleReport = async (e: React.MouseEvent, email: Email) => {
    e.stopPropagation();
    await userActions.reportedPhishing();
    setEmails((prev) => prev.filter((m) => m.id !== email.id));
    toast.success('Phishing reported', { description: '+20 points awarded.' });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Inbox
          </h2>
          <p className="text-muted-foreground mt-1 font-mono text-sm">{currentUser.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchEmails} disabled={loading} className="gap-2">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <div className="cyber-card p-0 overflow-hidden">
        {emails.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No active campaigns. Wait for an admin to launch one.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {emails.map((email) => (
              <div key={email.id} onClick={() => onEmailClick(email)} className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-lg">
                        {email.type === 'phishing' && '🎣'}
                        {email.type === 'baiting' && '🪤'}
                        {email.type === 'smishing' && '📱'}
                        {email.type === 'spear-phishing' && '🎯'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{email.campaign_name}</p>
                      <p className="text-xs text-muted-foreground">security@{email.campaign_name.toLowerCase().replace(/\s+/g, '')}.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {email.sent_at.toLocaleDateString()}
                  </div>
                </div>

                <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">{email.subject}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{email.body}</p>

                <div className="flex items-center justify-between">
                  <span className={cn('px-2 py-1 rounded text-xs font-medium capitalize', getTypeColor(email.type))}>
                    {email.type.replace('-', ' ')}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={(e) => handleReport(e, email)}>
                      <Flag className="w-3 h-3" /> Report
                    </Button>
                    <Button size="sm" variant="secondary" className="gap-1 text-xs">
                      {email.type === 'baiting' ? (
                        <><Paperclip className="w-3 h-3" /> Download</>
                      ) : (
                        <><ExternalLink className="w-3 h-3" /> Verify Now</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
