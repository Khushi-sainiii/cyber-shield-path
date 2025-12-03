export interface TrainingModule {
  id: string;
  title: string;
  icon: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  content: {
    overview: string;
    howItWorks: string[];
    realWorldExamples: string[];
    warningSignals: string[];
    preventionTips: string[];
    quiz?: {
      question: string;
      options: string[];
      correct: number;
    }[];
  };
}

export const trainingModules: TrainingModule[] = [
  {
    id: 'phishing',
    title: 'Phishing Attacks',
    icon: '🎣',
    description: 'Learn to identify and avoid deceptive emails that trick you into revealing sensitive information.',
    duration: '15 min',
    difficulty: 'Beginner',
    content: {
      overview:
        'Phishing is a type of social engineering attack where criminals send fraudulent emails that appear to come from reputable sources. The goal is to steal sensitive data like login credentials, credit card numbers, or to install malware on the victim\'s device.',
      howItWorks: [
        'Attackers craft emails that mimic legitimate organizations (banks, tech companies, your employer)',
        'Emails contain urgent language to pressure you into acting quickly without thinking',
        'Links in the email lead to fake websites that look identical to real ones',
        'Victims enter their credentials on the fake site, which are then captured by attackers',
        'Some phishing emails contain malicious attachments that install malware when opened',
      ],
      realWorldExamples: [
        'Fake Netflix email claiming your account will be suspended unless you update payment info',
        'Email appearing to be from IT department asking you to verify your password',
        'Message from "Amazon" about a suspicious order requiring immediate verification',
        'Email from "Microsoft" about unusual sign-in activity on your account',
      ],
      warningSignals: [
        'Generic greetings like "Dear Customer" instead of your actual name',
        'Spelling and grammar errors in the email content',
        'Mismatched or suspicious sender email addresses',
        'Urgent or threatening language creating pressure to act immediately',
        'Requests for sensitive information like passwords or credit card details',
        'Suspicious links that don\'t match the claimed sender\'s domain',
      ],
      preventionTips: [
        'Always verify the sender\'s email address carefully',
        'Hover over links before clicking to see the actual URL',
        'Never provide sensitive information via email',
        'When in doubt, contact the organization directly using official contact information',
        'Enable multi-factor authentication on all important accounts',
        'Keep your software and antivirus updated',
      ],
      quiz: [
        {
          question: 'What is the primary goal of a phishing attack?',
          options: [
            'To improve email delivery rates',
            'To steal sensitive information or install malware',
            'To test email server performance',
            'To send marketing messages',
          ],
          correct: 1,
        },
        {
          question: 'Which is a common warning sign of a phishing email?',
          options: [
            'Professional formatting',
            'Your correct name in the greeting',
            'Urgent language pressuring immediate action',
            'Links to the official company website',
          ],
          correct: 2,
        },
      ],
    },
  },
  {
    id: 'baiting',
    title: 'Baiting Attacks',
    icon: '🪤',
    description: 'Understand how attackers use enticing offers to lure victims into compromising their security.',
    duration: '12 min',
    difficulty: 'Beginner',
    content: {
      overview:
        'Baiting is a social engineering technique that uses a false promise or enticing offer to pique a victim\'s curiosity and lure them into a trap. Unlike phishing which relies on impersonation, baiting exploits human greed, curiosity, or desire for something free.',
      howItWorks: [
        'Attackers create an enticing "bait" such as free software, music, movies, or gift cards',
        'The bait is delivered through physical media (USB drives) or digital downloads',
        'Victims who take the bait unknowingly download malware onto their systems',
        'Physical baiting may involve leaving infected USB drives in parking lots or lobbies',
        'Digital baiting often uses torrent sites or fake download links',
      ],
      realWorldExamples: [
        'USB drives labeled "Confidential Salary Information" left in company parking lot',
        'Free movie download links that actually contain ransomware',
        'Pop-up ads promising free gift cards in exchange for "quick surveys"',
        'Fake antivirus software that installs malware instead of protecting',
        'Promotional CDs sent to businesses claiming to contain product catalogs',
      ],
      warningSignals: [
        'Offers that seem too good to be true',
        'Unknown USB drives or storage devices found in public places',
        'Websites offering copyrighted content for free',
        'Unsolicited physical media received through mail',
        'Pop-ups claiming you\'ve won prizes or free items',
      ],
      preventionTips: [
        'Never plug in unknown USB drives or storage devices',
        'Be skeptical of free offers, especially from unknown sources',
        'Only download software from official, trusted sources',
        'Use endpoint protection that scans removable media automatically',
        'Report any suspicious physical items found at work to IT security',
        'If you find an unknown device, do not attempt to view its contents',
      ],
      quiz: [
        {
          question: 'What makes baiting different from phishing?',
          options: [
            'Baiting only works on mobile devices',
            'Baiting uses enticing offers rather than impersonation',
            'Baiting is always legal',
            'Baiting only targets IT professionals',
          ],
          correct: 1,
        },
      ],
    },
  },
  {
    id: 'smishing',
    title: 'Smishing (SMS Phishing)',
    icon: '📱',
    description: 'Recognize phishing attempts that come through text messages on your mobile device.',
    duration: '10 min',
    difficulty: 'Intermediate',
    content: {
      overview:
        'Smishing, or SMS phishing, is a variant of phishing that uses text messages instead of email. Attackers send deceptive SMS messages to trick recipients into clicking malicious links, downloading harmful apps, or divulging personal information. Mobile users are often more vulnerable because they\'re used to acting quickly on text messages.',
      howItWorks: [
        'Attackers send text messages pretending to be from banks, delivery services, or government agencies',
        'Messages often contain short links that mask the true destination URL',
        'Links may lead to fake login pages or trigger malware downloads',
        'Some smishing attacks ask you to call a phone number where scammers collect information',
        'Attackers exploit the trust people have in SMS as a communication channel',
      ],
      realWorldExamples: [
        '"Your package cannot be delivered. Click here to reschedule: [suspicious link]"',
        '"ALERT: Unusual activity on your bank account. Verify immediately: [link]"',
        '"You\'ve won a $1000 Walmart gift card! Claim now: [link]"',
        '"IRS Notice: You have an outstanding tax debt. Call this number to resolve."',
        '"Your Apple ID has been locked. Verify your identity: [link]"',
      ],
      warningSignals: [
        'Messages from unknown or unusual phone numbers',
        'Unexpected messages about packages, accounts, or prizes',
        'Shortened URLs that hide the real destination',
        'Requests to call non-official phone numbers',
        'Poor grammar or spelling in the message',
        'Pressure to act immediately with threats of account closure',
      ],
      preventionTips: [
        'Never click links in unexpected text messages',
        'Verify messages by contacting the organization directly through official channels',
        'Don\'t reply to suspicious texts - even "STOP" replies confirm your number is active',
        'Use your phone\'s built-in spam filtering features',
        'Install mobile security software on your device',
        'Report smishing attempts to your carrier by forwarding to 7726 (SPAM)',
      ],
      quiz: [
        {
          question: 'Why are smishing attacks often effective?',
          options: [
            'Text messages are always encrypted',
            'People tend to trust and quickly act on SMS messages',
            'SMS has better security than email',
            'Smartphones can\'t get malware',
          ],
          correct: 1,
        },
      ],
    },
  },
  {
    id: 'spear-phishing',
    title: 'Spear Phishing',
    icon: '🎯',
    description: 'Learn about highly targeted attacks that use personal information to deceive specific individuals.',
    duration: '18 min',
    difficulty: 'Advanced',
    content: {
      overview:
        'Spear phishing is a highly targeted form of phishing where attackers customize their approach for specific individuals or organizations. Unlike broad phishing campaigns, spear phishing involves extensive research about the target to create convincing, personalized messages. These attacks are particularly dangerous because they\'re much harder to detect.',
      howItWorks: [
        'Attackers research targets using social media, company websites, and data breaches',
        'They craft personalized emails referencing real projects, colleagues, or events',
        'Messages appear to come from trusted sources like bosses, clients, or partners',
        'The personalization makes the request seem legitimate and urgent',
        'Targets are often high-value individuals like executives (whaling) or finance staff',
      ],
      realWorldExamples: [
        'Email from "CEO" to CFO requesting an urgent wire transfer for a secret acquisition',
        'Message from "IT Support" referencing your recent help desk ticket',
        'Email from "vendor" with an invoice matching your company\'s actual suppliers',
        'Request from "HR" for W-2 forms referencing specific employee names',
        'Email about a project you\'re actually working on, with a malicious attachment',
      ],
      warningSignals: [
        'Unusual requests from executives, especially involving money or sensitive data',
        'Time pressure that prevents you from verifying through normal channels',
        'Requests to bypass normal procedures "just this once"',
        'Slight variations in email addresses (john.ceo@ vs john-ceo@)',
        'Requests for information the sender should already have access to',
        'Communications through unexpected channels (text instead of email)',
      ],
      preventionTips: [
        'Always verify unusual requests through a separate communication channel',
        'Implement strict verification procedures for financial transactions',
        'Be cautious about information you share on social media',
        'Question any request that asks you to bypass security procedures',
        'Enable email authentication protocols (SPF, DKIM, DMARC) in your organization',
        'Conduct regular security awareness training focused on targeted attacks',
        'Establish code words for verifying legitimate urgent requests',
      ],
      quiz: [
        {
          question: 'What makes spear phishing more dangerous than regular phishing?',
          options: [
            'It uses newer technology',
            'It\'s personalized and harder to detect',
            'It only targets government agencies',
            'It requires physical access to computers',
          ],
          correct: 1,
        },
        {
          question: 'What is "whaling" in the context of spear phishing?',
          options: [
            'Attacks targeting marine biologists',
            'Mass email campaigns to random users',
            'Spear phishing that targets high-level executives',
            'Phishing through fishing industry websites',
          ],
          correct: 2,
        },
      ],
    },
  },
];
