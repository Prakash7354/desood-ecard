import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowUpRight, ArrowDown, Share2, X, CheckCircle, Mail, Home, KeyRound, TrendingUp,
  FileCheck, ShieldCheck, MessagesSquare, ArrowLeftRight, HousePlus, Triangle, PaintRoller, BedDouble,
  Ruler, DraftingCompass, Rotate3d, PencilRuler, HardHat, Camera, MapPin, Lightbulb, Stamp, Sofa,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const CONTACT_EMAIL = 'info@desood.com';

const PROJECT_TYPES = [
  'House extension',
  'Loft conversion',
  'Renovation',
  'HMO / flat conversion',
  'Change of use',
  'New build',
  'Other',
];

const DISCIPLINES = [
  { icon: DraftingCompass, label: 'Architectural' },
  { icon: Stamp, label: 'Planning' },
  { icon: PencilRuler, label: 'Design' },
  { icon: Sofa, label: 'Interior' },
];

const PROCESS_STEPS = [
  { icon: Ruler, label: 'Survey' },
  { icon: PencilRuler, label: 'Design' },
  { icon: FileCheck, label: 'Planning' },
  { icon: HardHat, label: 'Build' },
];

const SERVICES = [
  {
    title: 'Planning & approvals',
    items: [
      { icon: FileCheck, name: 'Planning Permission Applications', text: 'Drawings and documents prepared and submitted to your council.' },
      { icon: ShieldCheck, name: 'Permitted Development & Lawful Development Certificates', text: 'Find out if you can build without full planning, with certainty in writing.' },
      { icon: MessagesSquare, name: 'Pre-Application Advice', text: 'Test your idea with the council before applying.' },
      { icon: ArrowLeftRight, name: 'Prior Approval & Change of Use', text: 'Routes such as commercial-to-residential for landlords and investors.' },
    ],
  },
  {
    title: 'Design',
    items: [
      { icon: HousePlus, name: 'House Extensions', text: 'Single and double storey, side return and wrap-around.' },
      { icon: Triangle, name: 'Loft Conversions', text: 'Dormer, hip-to-gable and mansard lofts that add bedrooms and value.' },
      { icon: PaintRoller, name: 'Renovations & Remodelling', text: 'Open-plan living, reconfiguration and whole-house refurbishments.' },
      { icon: BedDouble, name: 'HMO & Flat Conversions', text: 'Layouts planned around space standards, fire safety and rental demand.' },
      { icon: Sofa, name: 'Interior Design', text: 'Layouts, finishes and lighting planned around how you live.' },
    ],
  },
  {
    title: 'Technical drawings',
    items: [
      { icon: Ruler, name: 'Measured Surveys', text: 'Accurate drawings of your property as it stands today.' },
      { icon: DraftingCompass, name: 'Building Regulations Drawings', text: 'Detailed drawings for Building Control and for your builder.' },
      { icon: Rotate3d, name: '3D Visuals', text: "See your design before it's built, and decide with confidence." },
    ],
  },
];

const ENQUIRY_PROMPTS = [
  { icon: Camera, label: 'Photos' },
  { icon: MapPin, label: 'Postcode' },
  { icon: Lightbulb, label: 'Your idea' },
];

const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  // Keep only digits and a leading plus sign
  const cleaned = value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');

  // UK mobile formatting (e.g., 07474 080 809)
  if (cleaned.startsWith('07') && cleaned.length > 5) {
    if (cleaned.length <= 8) return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 11)}`;
  }

  // UK international formatting (e.g., +44 7474 080 809)
  if (cleaned.startsWith('+44') && cleaned.length > 3) {
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 10) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10, 13)}`;
  }

  return cleaned;
};

const mailtoLink = (subject: string, body = '') =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;

// vCard 3.0 lines should be folded at 75 octets
const foldVCardLine = (line: string) => line.match(/.{1,74}/g)!.join('\r\n ');

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const AUDIENCES = [
  { icon: Home, title: 'Homeowners', text: 'Extensions, loft conversions and renovations that give you the space you need, designed with planning approval in mind.' },
  { icon: KeyRound, title: 'Landlords', text: 'HMO and flat conversions and layout upgrades, designed around room-size standards and Building Regulations.' },
  { icon: TrendingUp, title: 'Property investors', text: "Feasibility studies, permitted development and change-of-use routes to understand and unlock a site's potential." },
];

const CARD_COUNT = 6;

const PAPER_CARD = 'relative bg-brand-paper rounded-[18px] p-[22px] border border-brand-ink/[0.06] shadow-[0_10px_28px_-16px_rgba(18,18,18,0.45)]';
const INK_CARD = 'relative bg-brand-ink bg-blueprint text-brand-paper rounded-[18px] p-[22px] overflow-hidden shadow-[0_18px_40px_-16px_rgba(18,18,18,0.7)]';
const INPUT = 'w-full bg-white border border-brand-concrete rounded-lg p-[12px_14px] text-[14.5px] font-body text-brand-ink mb-[9px] placeholder:text-[#767676] focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-3';
const ACTION_BUTTON = 'w-full bg-brand-paper border border-brand-ink/15 text-brand-ink p-[11px_12px] rounded-[10px] text-[12.5px] font-semibold flex items-center justify-center gap-2 shadow-sm hover:border-brand-red-deep hover:text-brand-red-deep transition-colors focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-3';

const LABEL_TONES = {
  paper: ['text-brand-red-deep', 'text-brand-graphite/60'],
  ink: ['text-brand-red', 'text-brand-steel'],
  red: ['text-white', 'text-white/70'],
};

// Card header: section name on the left, position in the card set on the right
const CardLabel = ({ label, index, tone = 'paper' }: { label: string; index: number; tone?: keyof typeof LABEL_TONES }) => {
  const [labelColor, indexColor] = LABEL_TONES[tone];
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="flex justify-between items-center font-mono text-[10.5px] tracking-[0.12em] uppercase mb-[14px]">
      <span className={labelColor}>{label}</span>
      <span className={indexColor}>{pad(index)} / {pad(CARD_COUNT)}</span>
    </div>
  );
};

// Printer's crop marks in each corner, like a business card proof
const CropMarks = ({ color }: { color: string }) => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-[9px]">
    {['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'].map((pos) => (
      <span key={pos} className={`absolute w-[10px] h-[10px] ${pos} ${color}`} />
    ))}
  </div>
);

// Faint gable outline, echoing the triangle in the Desood logo
const GableWatermark = ({ stroke }: { stroke: string }) => (
  <svg viewBox="0 0 260 150" fill="none" aria-hidden="true" className="pointer-events-none absolute -right-10 -bottom-4 w-[280px]">
    <path d="M6 148L130 14L254 148" className={stroke} strokeWidth="2" />
    <path d="M58 148L130 70L202 148" className={stroke} strokeWidth="2" />
  </svg>
);

export default function Index() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [projectType, setProjectType] = useState('');
  const [postcode, setPostcode] = useState('');
  const [details, setDetails] = useState('');
  const [showExtra, setShowExtra] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cardUrl, setCardUrl] = useState('https://card.desood.com');
  const [installPrompt, setInstallPrompt] = useState<'ios' | 'android' | null>(null);

  useEffect(() => {
    setCardUrl(window.location.href.split('#')[0].split('?')[0]);

    // Check for install prompt
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone;
    let hasDismissed = false;
    try {
      hasDismissed = !!localStorage.getItem('dismissedInstallPrompt');
    } catch {
      // Storage blocked (private mode) - just show the prompt
    }

    if (!isStandalone && !hasDismissed) {
      const ua = window.navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(ua);
      const isAndroid = /android/.test(ua);

      if (isIOS) setInstallPrompt('ios');
      else if (isAndroid) setInstallPrompt('android');
    }
  }, []);

  const dismissInstallPrompt = () => {
    setInstallPrompt(null);
    try {
      localStorage.setItem('dismissedInstallPrompt', 'true');
    } catch {
      // Storage blocked - prompt will show again next visit
    }
  };

  const downloadVCard = async () => {
    let photo = '';
    try {
      const res = await fetch('/icon-192.png');
      photo = foldVCardLine(`PHOTO;ENCODING=b;TYPE=PNG:${await blobToBase64(await res.blob())}`);
    } catch {
      // Logo is a nice-to-have; save the contact without it
    }

    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:;;;;',
      'FN:Desood',
      'ORG:Desood',
      'X-ABShowAs:COMPANY',
      'TITLE:Architectural · Planning · Design · Interior',
      `EMAIL;TYPE=WORK:${CONTACT_EMAIL}`,
      'URL:https://desood.com',
      'ADR;TYPE=WORK:;;;;;;United Kingdom',
      'NOTE:Architectural design\\, planning permission and interiors for UK homeowners\\, landlords and property investors.',
      ...(photo ? [photo] : []),
      'END:VCARD',
    ].join('\r\n');

    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Desood.vcf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Desood - Architectural · Planning · Design · Interior',
          text: 'Architectural design, planning and interiors across the UK - here is the Desood digital card.',
          url: cardUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(cardUrl);
        toast({
          title: "Link copied!",
          description: "Card link copied to clipboard.",
        });
      } catch (err) {
        toast({
          title: "Could not copy link",
          description: "Your browser blocked clipboard access. You can manually copy the URL.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast({
        title: "Missing fields",
        description: "Pop in your name and number first.",
        variant: "destructive",
      });
      return;
    }

    const body = [
      'Hi Desood,',
      '',
      "I'd like to talk about a project.",
      '',
      `Name: ${name}`,
      `Mobile: ${phone}`,
      ...(projectType ? [`Project: ${projectType}`] : []),
      ...(postcode ? [`Property postcode: ${postcode.toUpperCase()}`] : []),
      ...(details ? ['', details] : []),
      '',
      'Sent from the Desood digital card',
    ].join('\r\n');

    window.location.href = mailtoLink(`Project enquiry - ${projectType || 'New project'} - ${name}`, body);

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 6000);
  };

  return (
    <div className="flex justify-center min-h-screen bg-brand-concrete font-body text-brand-ink antialiased">
      <div className="w-full max-w-[430px] bg-brand-desk bg-drafting min-h-screen relative overflow-hidden shadow-[0_0_60px_rgba(18,18,18,0.18)] px-[14px] pt-[18px] pb-[28px] space-y-[14px]">

        {/* BUSINESS CARD */}
        <div className={`${INK_CARD} pb-[26px] animate-in fade-in zoom-in-95 duration-700`} style={{ animationFillMode: 'both', animationDelay: '150ms' }}>
          <GableWatermark stroke="stroke-white/[0.07]" />
          <CropMarks color="border-brand-red/60" />
          <div className="relative">
            <CardLabel label="Desood // Digital card" index={1} tone="ink" />

            <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
              <div className="bg-white rounded-xl p-3 flex items-center justify-center">
                <img src="/desood-logo.png" alt="Desood Design logo" width={800} height={484} className="w-full h-auto" />
              </div>

              <div className="flex flex-col items-center gap-[6px]">
                <div className="bg-white p-2 rounded-xl border border-brand-red">
                  <QRCodeSVG
                    value={cardUrl}
                    size={92}
                    fgColor="#121212"
                    bgColor="#FFFFFF"
                    level="H"
                  />
                </div>
                <div className="font-mono text-[9.5px] tracking-[0.08em] uppercase text-brand-steel text-center leading-[1.3]">
                  Scan to<br/>share this card <ArrowUpRight className="inline w-3 h-3" />
                </div>
              </div>
            </div>

            <h1 className="mt-5 flex items-end justify-between rounded-full border border-white/15 bg-white/[0.05] px-[14px] py-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              {DISCIPLINES.map(({ icon: Icon, label }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <span className="w-[5px] h-[5px] mb-[3px] rounded-full bg-brand-red shrink-0" aria-hidden="true" />}
                  <span className="flex flex-col items-center gap-[5px]">
                    <Icon className="w-[18px] h-[18px] text-brand-red" strokeWidth={1.75} aria-hidden="true" />
                    <span className="font-display text-[10px] min-[380px]:text-[11px] font-semibold tracking-[0.03em] leading-none">
                      {label}<span className="sr-only">.</span>
                    </span>
                  </span>
                </React.Fragment>
              ))}
            </h1>
            <p className="text-[12px] text-brand-steel mt-3 text-center text-balance font-mono tracking-[0.02em]">
              For homeowners, landlords &amp; property investors
            </p>

            <div className="mt-4 pt-4 border-t border-brand-steel/20 space-y-[9px] text-[13.5px]">
              <a href={mailtoLink('Project enquiry')} className="flex items-center gap-[10px] w-fit hover:text-brand-red transition-colors focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-3">
                <Mail className="w-4 h-4 text-brand-red" /> {CONTACT_EMAIL}
              </a>
              <div className="flex items-center gap-[10px] text-brand-steel">
                <MapPin className="w-4 h-4 text-brand-red" /> Projects across the United Kingdom
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-[5px] bg-brand-red" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationFillMode: 'both', animationDelay: '400ms' }}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={downloadVCard} className={ACTION_BUTTON}>
                <ArrowDown className="w-4 h-4 text-brand-red-deep" />
                Save contact
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download VCard (.vcf)</p>
            </TooltipContent>
          </Tooltip>

          <button onClick={handleShare} className={ACTION_BUTTON}>
            <Share2 className="w-4 h-4 text-brand-red-deep" />
            Share card
          </button>
        </div>

        {/* QUICK ENQUIRY */}
        <section className={`${PAPER_CARD} animate-in fade-in slide-in-from-bottom-6 duration-700`} style={{ animationFillMode: 'both', animationDelay: '600ms' }}>
          <CardLabel label="Quick enquiry" index={2} />
          <p className="font-display text-[15px] font-medium leading-[1.5] text-brand-ink pl-3 border-l-2 border-brand-red mb-[18px]">
            We design extensions, conversions and renovations across the UK, and get them through planning, so you can build with confidence.
          </p>
          <form onSubmit={handleEnquiry}>
            <input
              type="text"
              placeholder="Your name"
              aria-label="Your name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={INPUT}
            />
            <input
              type="tel"
              placeholder="Mobile number"
              aria-label="Mobile number"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              className={INPUT}
            />

            <div className="mt-1 mb-[12px]" role="group" aria-label="Project type">
              <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-brand-graphite block mb-[7px]">What's the project?</span>
              <div className="flex flex-wrap gap-[6px]">
                {PROJECT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={projectType === type}
                    onClick={() => setProjectType(projectType === type ? '' : type)}
                    className={`px-[10px] py-[6px] rounded-full text-[12px] border transition-colors focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-2 ${
                      projectType === type
                        ? 'bg-brand-red-deep border-brand-red-deep text-white'
                        : 'bg-white border-brand-ink/15 text-brand-graphite hover:border-brand-red-deep hover:text-brand-red-deep'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {!showExtra ? (
              <button
                type="button"
                onClick={() => setShowExtra(true)}
                className="w-full text-left text-[11.5px] font-mono text-brand-graphite hover:text-brand-red-deep mb-[12px] transition-colors"
              >
                + Add postcode &amp; project details (optional)
              </button>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <input
                  type="text"
                  placeholder="Property postcode"
                  aria-label="Property postcode"
                  autoComplete="postal-code"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className={`${INPUT} uppercase placeholder:normal-case`}
                />
                <textarea
                  placeholder="Tell us briefly what you're planning"
                  aria-label="Project details"
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className={`${INPUT} resize-none`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowExtra(false);
                    setPostcode('');
                    setDetails('');
                  }}
                  className="w-full text-left text-[11.5px] font-mono text-brand-graphite hover:text-brand-red-deep mb-[12px] transition-colors"
                >
                  - Hide optional fields
                </button>
              </div>
            )}
            {isSuccess ? (
              <div className="w-full bg-brand-red-deep text-white p-[13px] rounded-lg text-[14px] font-semibold flex flex-col items-center justify-center gap-1 animate-in zoom-in duration-300" role="status">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 animate-in slide-in-from-bottom-2 fade-in duration-500" />
                  Opening your email app…
                </span>
                <span className="text-[11.5px] font-normal font-mono opacity-90">
                  Nothing happened? Email <a href={mailtoLink('Project enquiry')} className="underline">{CONTACT_EMAIL}</a>
                </span>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full bg-brand-red-deep text-white p-[13px] rounded-lg text-[14.5px] font-semibold tracking-[0.01em] hover:brightness-110 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-3 flex items-center justify-center gap-2"
              >
                Send my enquiry
              </button>
            )}
          </form>

          <a
            href={mailtoLink('Project enquiry')}
            className="mt-[10px] w-full border-[1.5px] border-brand-red-deep text-brand-red-deep p-[12px] rounded-lg text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-brand-red-tint transition-colors focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-3"
          >
            <Mail className="w-4 h-4" /> {CONTACT_EMAIL}
          </a>
        </section>

        {/* ABOUT */}
        <section className={PAPER_CARD}>
          <CardLabel label="About Desood" index={3} />
          <h2 className="font-display text-[22px] font-bold mb-[12px] leading-[1.25]">
            Good design, planned properly from day one
          </h2>
          <div className="text-[14px] leading-[1.65] text-brand-graphite space-y-3">
            <p>
              Desood is a UK architectural design practice helping people improve, extend and add value to their property. We take you from first idea to approved, buildable drawings, with planning rules designed in from the start rather than fixed at the end.
            </p>
            <p>
              Whether you're extending a family home, converting a rental or testing what a site could become, we explain your options in plain English and look after the application with your local council.
            </p>
          </div>

          <div className="relative mt-7">
            <div className="absolute top-[22px] left-[12.5%] right-[12.5%] border-t border-dashed border-brand-red/50" aria-hidden="true" />
            <ol className="relative grid grid-cols-4" aria-label="How a project runs">
              {PROCESS_STEPS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex flex-col items-center gap-2">
                  <span className="w-11 h-11 rounded-full bg-white border border-brand-concrete shadow-sm flex items-center justify-center text-brand-red-deep">
                    <Icon className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-brand-graphite">{label}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-7 pt-6 border-t border-brand-concrete">
            <div className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-brand-red-deep mb-[14px]">Our approach</div>
            <div className="space-y-5">
              <div>
                <h4 className="font-display font-semibold text-[16px] text-brand-ink flex items-center gap-[8px]">
                  <span className="w-6 h-6 rounded-full bg-brand-red-tint text-brand-red-deep flex items-center justify-center text-[12px] border border-brand-red">P</span>
                  lanning-led
                </h4>
                <p className="text-[13.5px] leading-[1.6] text-brand-graphite mt-2">
                  We check permitted development rights, local policy and constraints such as conservation areas before we draw, so your design is shaped to get approved.
                </p>
              </div>
              <div>
                <h4 className="font-display font-semibold text-[16px] text-brand-ink flex items-center gap-[8px]">
                  <span className="w-6 h-6 rounded-full bg-brand-red-tint text-brand-red-deep flex items-center justify-center text-[12px] border border-brand-red">D</span>
                  esign that adds value
                </h4>
                <p className="text-[13.5px] leading-[1.6] text-brand-graphite mt-2">
                  Practical layouts that suit how you live, let or sell, balancing light, space and budget with long-term property value.
                </p>
              </div>
              <div>
                <h4 className="font-display font-semibold text-[16px] text-brand-ink flex items-center gap-[8px]">
                  <span className="w-6 h-6 rounded-full bg-brand-red-tint text-brand-red-deep flex items-center justify-center text-[12px] border border-brand-red">C</span>
                  lear from start to finish
                </h4>
                <p className="text-[13.5px] leading-[1.6] text-brand-graphite mt-2">
                  No jargon. You'll always know what stage your project is at, what the council needs and what comes next.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* WHO WE HELP */}
        <section className={PAPER_CARD}>
          <CardLabel label="Who we help" index={4} />
          <div className="divide-y divide-brand-concrete">
            {AUDIENCES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3 items-start py-[14px] first:pt-0 last:pb-0">
                <span className="w-9 h-9 shrink-0 rounded-lg bg-brand-red-tint border border-brand-red/40 flex items-center justify-center text-brand-red-deep">
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display font-semibold text-[15.5px]">{title}</h3>
                  <p className="text-[13px] leading-[1.55] text-brand-graphite mt-[3px]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SERVICES */}
        <section className={INK_CARD}>
          <CropMarks color="border-brand-red/60" />
          <div className="relative">
            <CardLabel label="What we do" index={5} tone="ink" />
            <h2 className="font-display text-[22px] font-bold mb-[18px]">
              From first sketch to approval
            </h2>

            <figure className="relative mb-6 rounded-xl overflow-hidden border border-brand-steel/25">
              <img
                src="/plans-to-home.jpg"
                alt="Architectural floor plans with a drafting compass and pencil, beside a tablet showing a finished kitchen"
                width={800}
                height={528}
                loading="lazy"
                decoding="async"
                className="w-full h-auto block"
              />
              <figcaption className="absolute left-3 bottom-3 bg-brand-ink/85 backdrop-blur-sm text-brand-paper font-mono text-[10px] tracking-[0.1em] uppercase px-[10px] py-[6px] rounded-md flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red" aria-hidden="true" />
                From plans to finished home
              </figcaption>
            </figure>

            {SERVICES.map((group, i) => (
              <div key={group.title} className={`py-4 border-t border-brand-steel/20 ${i === SERVICES.length - 1 ? 'pb-1' : ''}`}>
                <h3 className="font-display text-[16.5px] font-semibold mb-4 flex items-baseline gap-[10px]">
                  <span className="font-mono text-[11px] font-normal text-brand-red">0{i + 1}</span>
                  {group.title}
                </h3>
                <div className="space-y-4">
                  {group.items.map(({ icon: Icon, name, text }) => (
                    <div key={name} className="flex gap-3 items-start">
                      <span className="w-9 h-9 shrink-0 rounded-lg bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red">
                        <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <div>
                        <div className="text-[13.5px] font-semibold text-brand-paper mb-[2px] leading-[1.35]">{name}</div>
                        <p className="text-[12.5px] leading-[1.5] text-brand-steel">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section className="relative bg-brand-red-deep text-white rounded-[18px] p-[22px] pb-[28px] text-center overflow-hidden shadow-[0_18px_40px_-16px_rgba(214,0,9,0.6)]">
          <GableWatermark stroke="stroke-white/[0.12]" />
          <CropMarks color="border-white/50" />
          <div className="relative">
            <CardLabel label="Start your project" index={6} tone="red" />
            <h2 className="font-display text-[22px] font-bold mb-[10px] leading-[1.25] mt-2">
              Tell us what you're planning
            </h2>
            <p className="text-[14px] leading-[1.6] text-white/90 mb-[20px] max-w-[300px] mx-auto">
              Send a few details and photos of your property and we'll come back to you with the next steps.
            </p>

            <ul className="flex justify-center gap-6 mb-[22px]" aria-label="What to send">
              {ENQUIRY_PROMPTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex flex-col items-center gap-[6px]">
                  <span className="w-10 h-10 rounded-full bg-white/15 border border-white/35 flex items-center justify-center">
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-white/85">{label}</span>
                </li>
              ))}
            </ul>

            <a href={mailtoLink('Project enquiry')} className="inline-flex items-center gap-2 bg-white text-brand-red-deep p-[13px_22px] rounded-lg text-[14px] font-semibold hover:bg-brand-paper active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-3">
              <Mail className="w-4 h-4" /> Email {CONTACT_EMAIL}
            </a>

            <button
              onClick={downloadVCard}
              className="mt-3 mx-auto flex items-center justify-center gap-2 text-[12px] font-mono tracking-[0.02em] text-white/85 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-3"
            >
              <ArrowDown className="w-4 h-4" /> Save our contact
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-[10px] text-center text-brand-graphite">
          <div className="font-display font-semibold text-[13.5px] text-brand-ink mb-[6px]">
            Designed with purpose. Planned for approval<span className="text-brand-red">.</span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.06em] flex items-center justify-center gap-1.5 flex-wrap">
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-brand-red-deep transition-colors">{CONTACT_EMAIL}</a>
            <span>·</span>
            <span>United Kingdom</span>
            <span>·</span>
            <span>© {new Date().getFullYear()} Desood</span>
          </div>
        </footer>

        {/* INSTALL PROMPT */}
        {installPrompt && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[398px] bg-brand-ink text-brand-paper p-[16px] rounded-[14px] shadow-[0_10px_40px_rgba(18,18,18,0.3)] border border-brand-red/40 z-50 animate-in slide-in-from-bottom-8 fade-in duration-500">
            <button onClick={dismissInstallPrompt} aria-label="Dismiss" className="absolute top-3 right-3 text-brand-steel hover:text-brand-paper transition-colors focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-3 rounded-full p-1">
              <X className="w-[14px] h-[14px]" />
            </button>
            <div className="flex gap-[14px] items-start pr-4">
              <div className="bg-brand-paper/10 p-[10px] rounded-xl shrink-0">
                <Share2 className="w-[18px] h-[18px] text-brand-red" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-[15px] mb-[4px] text-brand-paper">Save to Home Screen</h4>
                <p className="text-[12.5px] text-brand-steel leading-[1.4]">
                  {installPrompt === 'ios'
                    ? "Tap the Share button below and select 'Add to Home Screen' for quick access."
                    : "Tap your browser's menu and select 'Add to Home Screen' for quick access."}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
