import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowUpRight, ArrowDown, Share2, X, CheckCircle, Mail, Home, KeyRound, TrendingUp,
  FileCheck, ShieldCheck, MessagesSquare, ArrowLeftRight, HousePlus, Triangle, PaintRoller, BedDouble,
  Ruler, DraftingCompass, Rotate3d, PencilRuler, HardHat, Camera, MapPin, Lightbulb,
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

// Gable roof divider, echoing the triangle in the Desood logo
const RoofLine = ({ bg, roof }: { bg: string; roof: string }) => (
  <div className={`block w-full leading-none ${bg}`} aria-hidden="true">
    <svg viewBox="0 0 430 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
      <path d="M0 40L215 4L430 40Z" className={roof} />
      <path d="M0 40L215 4L430 40" className="stroke-brand-red" strokeWidth="1.5" />
    </svg>
  </div>
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
      'TITLE:Architectural Design & Planning',
      `EMAIL;TYPE=WORK:${CONTACT_EMAIL}`,
      'URL:https://desood.com',
      'ADR;TYPE=WORK:;;;;;;United Kingdom',
      'NOTE:Architectural design and planning permission for UK homeowners\\, landlords and property investors.',
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
          title: 'Desood - Architectural Design & Planning',
          text: 'Architectural design and planning permission across the UK - here is the Desood digital card.',
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
      <div className="w-full max-w-[430px] bg-brand-paper min-h-screen relative overflow-hidden shadow-[0_0_60px_rgba(18,18,18,0.18)] animate-in fade-in zoom-in-[0.98] duration-1000">

        {/* HERO */}
        <div className="bg-brand-ink bg-blueprint text-brand-paper min-h-[100svh] flex flex-col p-[22px_22px_18px] relative">
          <div className="animate-in fade-in slide-in-from-top-8 duration-1000" style={{ animationFillMode: 'both', animationDelay: '200ms' }}>
            <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-brand-red flex justify-between items-center">
              <span>Desood // Digital Card</span>
              <span>UK-wide</span>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-4 items-center mt-5 animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationFillMode: 'both', animationDelay: '400ms' }}>
            <div className="bg-white rounded-xl p-3 flex items-center justify-center">
              <img src="/desood-logo.png" alt="Desood Design logo" width={800} height={484} className="w-full h-auto" />
            </div>

            <div className="flex flex-col items-center gap-[6px]">
              <div className="bg-white p-2 rounded-xl border border-brand-red">
                <QRCodeSVG
                  value={cardUrl}
                  size={96}
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

          <div className="mt-5 animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationFillMode: 'both', animationDelay: '500ms' }}>
            <h1 className="font-display text-[23px] font-bold leading-[1.2]">
              Architectural design &amp; planning<span className="text-brand-red">.</span>
            </h1>
            <p className="text-[12.5px] text-brand-steel mt-[5px] font-mono tracking-[0.02em]">
              For homeowners, landlords &amp; property investors
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationFillMode: 'both', animationDelay: '600ms' }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={downloadVCard}
                  className="w-full mt-4 bg-transparent border border-brand-steel/40 text-brand-steel p-[9px_12px] rounded-[7px] text-[12px] font-mono tracking-[0.02em] flex items-center justify-center gap-2 hover:border-brand-red hover:text-brand-paper transition-colors focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-3"
                >
                  <ArrowDown className="w-4 h-4" />
                  Save our contact to your phone
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download VCard (.vcf)</p>
              </TooltipContent>
            </Tooltip>

            <button
              onClick={handleShare}
              className="w-full mt-2 bg-transparent border border-brand-steel/40 text-brand-steel p-[9px_12px] rounded-[7px] text-[12px] font-mono tracking-[0.02em] flex items-center justify-center gap-2 hover:border-brand-red hover:text-brand-paper transition-colors focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-3"
            >
              <Share2 className="w-4 h-4" />
              Share this card
            </button>
          </div>

          <p className="font-display text-[15.5px] font-medium leading-[1.5] text-brand-paper mt-[22px] pl-3 border-l-2 border-brand-red animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationFillMode: 'both', animationDelay: '800ms' }}>
            We design extensions, conversions and renovations across the UK, and get them through planning, so you can build with confidence.
          </p>

          <div className="mt-5 bg-brand-paper/5 border border-brand-steel/25 rounded-[14px] p-4 animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationFillMode: 'both', animationDelay: '1000ms' }}>
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-brand-steel mb-[10px] block">
              Quick enquiry
            </span>
            <form onSubmit={handleEnquiry}>
              <input
                type="text"
                placeholder="Your name"
                aria-label="Your name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border-none rounded-lg p-[12px_14px] text-[14.5px] font-body text-brand-ink mb-[9px] placeholder:text-[#767676] focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-3"
              />
              <input
                type="tel"
                placeholder="Mobile number"
                aria-label="Mobile number"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                className="w-full bg-white border-none rounded-lg p-[12px_14px] text-[14.5px] font-body text-brand-ink mb-[9px] placeholder:text-[#767676] focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-3"
              />

              <div className="mt-1 mb-[12px]" role="group" aria-label="Project type">
                <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-brand-steel block mb-[7px]">What's the project?</span>
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
                          : 'bg-transparent border-brand-steel/40 text-brand-steel hover:border-brand-red hover:text-brand-paper'
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
                  className="w-full text-left text-[11.5px] font-mono text-brand-steel hover:text-brand-red mb-[12px] transition-colors"
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
                    className="w-full bg-white border-none rounded-lg p-[12px_14px] text-[14.5px] font-body text-brand-ink mb-[9px] uppercase placeholder:normal-case placeholder:text-[#767676] focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-3"
                  />
                  <textarea
                    placeholder="Tell us briefly what you're planning"
                    aria-label="Project details"
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full bg-white border-none rounded-lg p-[12px_14px] text-[14.5px] font-body text-brand-ink mb-[9px] resize-none placeholder:text-[#767676] focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-3"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowExtra(false);
                      setPostcode('');
                      setDetails('');
                    }}
                    className="w-full text-left text-[11.5px] font-mono text-brand-steel hover:text-brand-red mb-[12px] transition-colors"
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
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationFillMode: 'both', animationDelay: '1200ms' }}>
            <a
              href={mailtoLink('Project enquiry')}
              className="mt-[14px] w-full bg-transparent border-[1.5px] border-brand-red text-brand-paper p-[13px] rounded-lg text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-brand-red/10 transition-colors focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-3"
            >
              <Mail className="w-4 h-4" /> {CONTACT_EMAIL}
            </a>
          </div>

          <div className="mt-auto pt-4 flex flex-col items-center gap-1 text-brand-steel font-mono text-[9.5px] tracking-[0.12em] uppercase animate-in fade-in duration-1000" style={{ animationFillMode: 'both', animationDelay: '1400ms' }}>
            More below
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </div>
        </div>

        <RoofLine bg="bg-brand-ink" roof="fill-brand-paper" />

        {/* ABOUT */}
        <section className="p-[38px_24px] bg-brand-paper">
          <div className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-brand-red-deep mb-[10px]">About Desood</div>
          <h2 className="font-display text-[24px] font-bold mb-[14px] leading-[1.25]">
            Good design, planned properly from day one
          </h2>
          <div className="text-[14.5px] leading-[1.7] text-brand-graphite space-y-3">
            <p>
              Desood is a UK architectural design practice helping people improve, extend and add value to their property. We take you from first idea to approved, buildable drawings, with planning rules designed in from the start rather than fixed at the end.
            </p>
            <p>
              Whether you're extending a family home, converting a rental or testing what a site could become, we explain your options in plain English and look after the application with your local council.
            </p>
          </div>

          <div className="relative mt-8">
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

          <div className="mt-10 pt-8 border-t border-brand-concrete">
            <div className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-brand-red-deep mb-[16px]">Our approach</div>
            <div className="space-y-6">
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

          {/* WHO WE HELP */}
          <div className="mt-10 pt-8 border-t border-brand-concrete">
            <div className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-brand-red-deep mb-[16px]">Who we help</div>
            <div className="space-y-3">
              <div className="bg-white border border-brand-concrete border-t-[3px] border-t-brand-red rounded-xl p-4">
                <h3 className="font-display font-semibold text-[16px] flex items-center gap-2">
                  <Home className="w-[18px] h-[18px] text-brand-red-deep" /> Homeowners
                </h3>
                <p className="text-[13.5px] leading-[1.6] text-brand-graphite mt-[6px]">
                  Extensions, loft conversions and renovations that give you the space you need, designed with planning approval in mind.
                </p>
              </div>
              <div className="bg-white border border-brand-concrete border-t-[3px] border-t-brand-red rounded-xl p-4">
                <h3 className="font-display font-semibold text-[16px] flex items-center gap-2">
                  <KeyRound className="w-[18px] h-[18px] text-brand-red-deep" /> Landlords
                </h3>
                <p className="text-[13.5px] leading-[1.6] text-brand-graphite mt-[6px]">
                  HMO and flat conversions and layout upgrades, designed around room-size standards and Building Regulations.
                </p>
              </div>
              <div className="bg-white border border-brand-concrete border-t-[3px] border-t-brand-red rounded-xl p-4">
                <h3 className="font-display font-semibold text-[16px] flex items-center gap-2">
                  <TrendingUp className="w-[18px] h-[18px] text-brand-red-deep" /> Property investors
                </h3>
                <p className="text-[13.5px] leading-[1.6] text-brand-graphite mt-[6px]">
                  Feasibility studies, permitted development and change-of-use routes to understand and unlock a site's potential.
                </p>
              </div>
            </div>
          </div>
        </section>

        <RoofLine bg="bg-brand-paper" roof="fill-brand-ink" />

        {/* SERVICES */}
        <section className="p-[38px_24px] bg-brand-ink bg-blueprint text-brand-paper">
          <div className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-brand-red mb-[10px]">What we do</div>
          <h2 className="font-display text-[24px] font-bold mb-[20px]">
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
            <div key={group.title} className={`py-4 border-t border-brand-steel/20 ${i === SERVICES.length - 1 ? 'pb-0' : ''}`}>
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
        </section>

        <RoofLine bg="bg-brand-ink" roof="fill-brand-paper" />

        {/* CONTACT */}
        <section className="p-[38px_24px] bg-brand-paper text-center">
          <div className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-brand-red-deep mb-[10px]">Start your project</div>
          <h2 className="font-display text-[22px] font-bold mb-[10px] leading-[1.25]">
            Tell us what you're planning
          </h2>
          <p className="text-[14px] leading-[1.6] text-brand-graphite mb-[22px] max-w-[320px] mx-auto">
            Send a few details and photos of your property and we'll come back to you with the next steps.
          </p>

          <ul className="flex justify-center gap-6 mb-[24px]" aria-label="What to send">
            {ENQUIRY_PROMPTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-[6px]">
                <span className="w-10 h-10 rounded-full bg-brand-red-tint border border-brand-red/40 flex items-center justify-center text-brand-red-deep">
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-brand-graphite">{label}</span>
              </li>
            ))}
          </ul>

          <a href={mailtoLink('Project enquiry')} className="inline-flex items-center gap-2 bg-brand-red-deep text-white p-[13px_22px] rounded-lg text-[14px] font-semibold hover:brightness-110 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-3">
            <Mail className="w-4 h-4" /> Email {CONTACT_EMAIL}
          </a>

          <button
            onClick={downloadVCard}
            className="mt-3 mx-auto flex items-center justify-center gap-2 text-[12px] font-mono tracking-[0.02em] text-brand-graphite hover:text-brand-red-deep transition-colors focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-3"
          >
            <ArrowDown className="w-4 h-4" /> Save our contact
          </button>
        </section>

        {/* FOOTER */}
        <footer className="p-[26px_24px_34px] text-center bg-brand-ink text-brand-steel">
          <div className="font-display font-semibold text-[14px] text-brand-paper mb-[6px]">
            Designed with purpose. Planned for approval<span className="text-brand-red">.</span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.06em] flex items-center justify-center gap-1.5 flex-wrap">
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-brand-paper transition-colors">{CONTACT_EMAIL}</a>
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
