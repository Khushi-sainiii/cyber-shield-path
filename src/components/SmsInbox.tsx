import { useState } from 'react';
import { Smartphone, AlertTriangle, Flag, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface SmsMessage {
  id: string;
  sender: string;
  preview: string;
  body: string;
  link: string;
  category: 'delivery' | 'otp' | 'bank' | 'prize';
  receivedAt: string;
}

const initialMessages: SmsMessage[] = [
  {
    id: 'sms-1',
    sender: '+1-800-DELIVER',
    category: 'delivery',
    preview: 'Your package is on hold. Confirm address...',
    body: 'FedEx: Your package #FX9821 is on hold due to incomplete address. Confirm now to avoid return:',
    link: 'http://fedex-redelivery-portal.co/confirm',
    receivedAt: '2 min ago',
  },
  {
    id: 'sms-2',
    sender: 'CHASE-ALERT',
    category: 'bank',
    preview: 'Suspicious login detected on your account...',
    body: 'CHASE Alert: Suspicious login from unknown device on your account ending 4421. If this was not you, secure now:',
    link: 'http://chase-secure-login.net/verify',
    receivedAt: '14 min ago',
  },
  {
    id: 'sms-3',
    sender: '447892',
    category: 'otp',
    preview: 'Your verification code is 458219. Do NOT share...',
    body: 'Your verification code is 458219. Did not request this? Cancel the request and reset your password here:',
    link: 'http://account-security-reset.io/cancel',
    receivedAt: '1 hr ago',
  },
  {
    id: 'sms-4',
    sender: 'PRIZE-WIN',
    category: 'prize',
    preview: '🎉 You won a $500 Amazon gift card! Claim now',
    body: 'Congratulations! You have been randomly selected for a $500 Amazon gift card. Claim within 24h:',
    link: 'http://amazon-gift-claim.shop/win',
    receivedAt: 'Yesterday',
  },
];

interface SmsInboxProps {
  onMaliciousClick: (msg: SmsMessage) => void;
}

const SmsInbox = ({ onMaliciousClick }: SmsInboxProps) => {
  const [messages, setMessages] = useState<SmsMessage[]>(initialMessages);
  const [selected, setSelected] = useState<SmsMessage | null>(initialMessages[0]);

  const handleReport = (msg: SmsMessage) => {
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    if (selected?.id === msg.id) setSelected(null);
    toast.success('Smishing attempt reported', {
      description: 'Great catch! +20 points awarded for reporting.',
    });
  };

  const handleClick = (msg: SmsMessage) => {
    onMaliciousClick(msg);
  };

  const categoryStyle = (cat: SmsMessage['category']) => {
    switch (cat) {
      case 'delivery':
        return 'bg-warning/20 text-warning';
      case 'bank':
        return 'bg-destructive/20 text-destructive';
      case 'otp':
        return 'bg-primary/20 text-primary';
      case 'prize':
        return 'bg-accent/20 text-accent';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Smartphone className="w-6 h-6" />
          SMS Inbox
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Simulated text messages — practice spotting smishing attacks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Message list */}
        <div className="cyber-card p-0 overflow-hidden lg:col-span-1">
          {messages.length === 0 ? (
            <div className="p-8 text-center">
              <ShieldCheck className="w-10 h-10 mx-auto text-success mb-2" />
              <p className="text-muted-foreground text-sm">Inbox clear. Stay vigilant!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelected(msg)}
                  className={cn(
                    'w-full text-left p-4 hover:bg-secondary/50 transition-colors',
                    selected?.id === msg.id && 'bg-secondary/70'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold text-foreground">{msg.sender}</span>
                    <span className="text-[10px] text-muted-foreground">{msg.receivedAt}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{msg.preview}</p>
                  <span
                    className={cn(
                      'inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium uppercase',
                      categoryStyle(msg.category)
                    )}
                  >
                    {msg.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail pane — phone mockup */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="cyber-card">
              <div className="mx-auto max-w-sm bg-background border-2 border-border rounded-3xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">From</p>
                    <p className="font-semibold text-foreground">{selected.sender}</p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium uppercase',
                      categoryStyle(selected.category)
                    )}
                  >
                    {selected.category}
                  </span>
                </div>

                <div className="bg-secondary/50 rounded-2xl rounded-tl-sm p-3 mb-3">
                  <p className="text-sm text-foreground leading-relaxed">{selected.body}</p>
                  <button
                    onClick={() => handleClick(selected)}
                    className="mt-2 text-primary text-sm font-mono underline break-all hover:text-primary/80"
                  >
                    {selected.link}
                  </button>
                </div>

                <p className="text-[10px] text-muted-foreground text-center">{selected.receivedAt}</p>
              </div>

              <div className="flex gap-2 mt-4 max-w-sm mx-auto">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => handleReport(selected)}
                >
                  <Flag className="w-4 h-4" />
                  Report Smishing
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => handleClick(selected)}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Open Link
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-3">
                ⚠️ Educational simulation — no real messages or links
              </p>
            </div>
          ) : (
            <div className="cyber-card text-center py-12">
              <Smartphone className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Select a message to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmsInbox;
