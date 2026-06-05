import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import bookTrailer from "@assets/DigitalDhokha_BookTrailer_web_24s.mp4";
import {
  ShieldCheck,
  Brain,
  Eye,
  Users,
  Sparkles,
  Award,
  BookOpen,
  Globe2,
  Quote,
  ArrowRight,
  ArrowDown,
  Smartphone,
  CreditCard,
  AlertTriangle,
  Mic,
  Newspaper,
  Map,
  Flag,
  Briefcase,
  Building2,
  FileSearch,
  Landmark,
  UserX,
  ScanFace,
  Star,
  ExternalLink,
  GraduationCap,
  School,
  Megaphone,
  Presentation,
  Languages,
  Lightbulb,
  Heart,
  Handshake,
  Phone,
  Mail,
  MessageCircle,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const BOOK_AMAZON_URL =
  "https://www.amazon.in/DIGITAL-DHOKHA-Unmasking-Frauds-Stealing/dp/B0GHYST8VT";
const BOOK_FLIPKART_URL =
  "https://www.flipkart.com/digital-dhokha-unmasking-scams-frauds-lies-stealing-india-s-future/p/itm07d55e0161ddf";
const BOOKING_EMAIL = "partners@netraksh.com";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const stats = [
  { value: 10, suffix: "+", label: "Countries Reached" },
  { value: 20, suffix: "+", label: "Workshops & Sessions" },
  { value: 1, suffix: "", label: "National Award" },
  { value: 1, suffix: "", label: "Published Book" },
];

const insideTheBook = [
  { icon: FileSearch, title: "Real-World Case Studies", desc: "Actual cyber fraud incidents, decoded step by step." },
  { icon: Landmark, title: "Banking Fraud Prevention", desc: "Protect your accounts, cards, and life savings." },
  { icon: Smartphone, title: "UPI Scam Awareness", desc: "Spot and stop fraudulent payment requests." },
  { icon: UserX, title: "Social Engineering", desc: "How scammers manipulate trust, and how to resist." },
  { icon: ScanFace, title: "Deepfake & AI Scams", desc: "The new frontier of digital fraud, explained simply." },
  { icon: Users, title: "Cyber Safety for Families", desc: "Keep parents, children, and seniors protected." },
];

const storyFlow = [
  { icon: Smartphone, title: "India Goes Digital", desc: "UPI, online services, and connected devices reach every household." },
  { icon: CreditCard, title: "Cyber Frauds Increase", desc: "Criminals exploit the digital shift at an unprecedented scale." },
  { icon: AlertTriangle, title: "Families Become Targets", desc: "Scam calls, fake messages, and digital arrests reach the vulnerable." },
  { icon: ShieldCheck, title: "Netraksh Protects Citizens", desc: "A digital bodyguard that spots threats before they become victims." },
];

const timeline = [
  { icon: ShieldCheck, title: "Cybersecurity Experience", desc: "A proven track record defending citizens and organisations across more than 10 countries." },
  { icon: Brain, title: "Threat Intelligence Leadership", desc: "Tracking emerging fraud patterns and translating them into protection for everyday Indians." },
  { icon: Briefcase, title: "Security Operations Expertise", desc: "Hands-on experience building and running defensive security at scale." },
  { icon: Flag, title: "National Cyber Safety Vision", desc: "Advising governments and speaking at global forums to raise the bar for digital safety." },
  { icon: Sparkles, title: "Founder of Netraksh", desc: "Turning years of frontline expertise into a digital bodyguard for every Indian family." },
];

const achievements = [
  { no: "01", tag: "National Award", title: "Bharat Pratibha Samman", desc: "Awarded at Pradhanmantri Sangrahalaya for outstanding contributions to Cyber Crime Awareness across India.", icon: Award },
  { no: "02", tag: "Author", title: "Digital Dhokha", desc: "India's first Cyber Crime Awareness book, on a mission to save 100 million Indians from digital fraud.", icon: BookOpen },
  { no: "03", tag: "Government Advisory", title: "FIFA World Cup, Qatar", desc: "Provided Cyber Hygiene Advisory support to the Government of Qatar during the world's most-watched sporting event.", icon: Globe2 },
];

const services = [
  { icon: Presentation, title: "Cyber Awareness Workshops", desc: "Interactive sessions that turn complex threats into simple, everyday safety habits." },
  { icon: School, title: "School Cyber Safety Programs", desc: "Age-appropriate awareness for students on safe screen time and online behaviour." },
  { icon: Building2, title: "Corporate Training", desc: "Equip teams to recognise phishing, social engineering, and financial fraud." },
  { icon: Flag, title: "Government Awareness Campaigns", desc: "Large-scale citizen awareness drives for departments and public bodies." },
  { icon: Mic, title: "Public Speaking Engagements", desc: "Keynotes and talks that inspire action on digital safety." },
  { icon: ShieldCheck, title: "Cyber Fraud Prevention Consulting", desc: "Practical guidance to reduce fraud risk for organisations and communities." },
  { icon: Handshake, title: "Community Outreach Programs", desc: "Grassroots sessions for women, seniors, and vulnerable groups." },
];

const whyInvite = [
  { icon: Lightbulb, title: "Practical Real-Life Examples", desc: "Real case studies that make risks impossible to ignore." },
  { icon: Users, title: "Citizen-Focused Awareness", desc: "Built for ordinary people, not just security experts." },
  { icon: Languages, title: "Hindi + English Delivery", desc: "Sessions delivered in the language your audience understands." },
  { icon: MessageCircle, title: "Interactive Sessions", desc: "Live Q&A, demos, and audience participation throughout." },
  { icon: ShieldCheck, title: "Actionable Prevention", desc: "Clear, repeatable steps people can use the very same day." },
  { icon: Heart, title: "Youth & Family Engagement", desc: "Content that resonates with students, parents, and seniors." },
];

const workshopPrograms = [
  { icon: ShieldCheck, title: "Cyber Safety Workshops", desc: "Foundational awareness for any audience." },
  { icon: School, title: "School Awareness Sessions", desc: "Safe online habits for young students." },
  { icon: GraduationCap, title: "College Awareness Programs", desc: "Fraud, privacy, and digital reputation for youth." },
  { icon: Building2, title: "Corporate Cybersecurity Training", desc: "Phishing and fraud defence for teams." },
  { icon: Users, title: "Women Safety Awareness", desc: "Online safety, harassment, and privacy." },
  { icon: Heart, title: "Senior Citizen Protection", desc: "Defending elders from scam calls & UPI fraud." },
  { icon: Megaphone, title: "Government Awareness Campaigns", desc: "Public, large-scale citizen outreach." },
  { icon: Flag, title: "Police & Law Enforcement", desc: "Collaboration on cyber crime prevention." },
];

const galleryCategories = [
  "All",
  "Workshops",
  "School Programs",
  "College Events",
  "Public Speaking",
  "Media Coverage",
  "Book Launch",
  "Community Outreach",
  "Videos",
];

type GalleryItem = {
  category: string;
  h: string;
  src: string;
  alt: string;
  type?: "video";
  poster?: string;
};

const galleryItems: GalleryItem[] = [
  { category: "School Programs", h: "h-64", src: "/images/event-school-1.jpg", alt: "Shivam Malaviya addressing a packed school auditorium during a cyber awareness program" },
  { category: "Public Speaking", h: "h-80", src: "/images/event-speaking-1.jpg", alt: "Shivam Malaviya honoured at a Faculty Development Program on blockchain technology" },
  { category: "Book Launch", h: "h-72", src: "/images/event-launch-1.jpg", alt: "Launch of Digital Dhokha by Shivam Malaviya" },
  { category: "Media Coverage", h: "h-56", src: "/images/event-press-1.jpg", alt: "Newspaper feature on cyber safety awareness by Shivam Malaviya" },
  { category: "School Programs", h: "h-72", src: "/images/event-school-2.jpg", alt: "Students attending a Netraksh cyber crime awareness session" },
  { category: "College Events", h: "h-64", src: "/images/event-college-1.jpg", alt: "College students at a Netraksh digital safety seminar" },
  { category: "Workshops", h: "h-56", src: "/images/event-workshop-1.jpg", alt: "Cyber awareness workshop audience with Netraksh banner" },
  { category: "Public Speaking", h: "h-64", src: "/images/event-speaking-2.jpg", alt: "Shivam Malaviya felicitated at a college program" },
  { category: "School Programs", h: "h-56", src: "/images/event-school-3.jpg", alt: "School students seated for a cyber crime prevention talk" },
  { category: "Book Launch", h: "h-72", src: "/images/event-launch-2.jpg", alt: "Digital Dhokha book launch coverage and showcase" },
  { category: "Public Speaking", h: "h-64", src: "/images/event-speaking-3.jpg", alt: "Shivam Malaviya speaking on stage at a national event" },
  { category: "Community Outreach", h: "h-72", src: "/images/event-felicitation-1.jpg", alt: "Felicitation ceremony recognising cyber awareness work" },
  { category: "Media Coverage", h: "h-56", src: "/images/event-press-2.jpg", alt: "Press coverage of Shivam Malaviya's national recognition" },
  { category: "School Programs", h: "h-72", src: "/images/event-school-4.jpg", alt: "Large gathering of students at a cyber safety awareness drive" },
  { category: "Book Launch", h: "h-64", src: "/images/event-launch-3.jpg", alt: "Group photo at the Digital Dhokha book launch" },
  { category: "College Events", h: "h-64", src: "/images/event-college-2.jpg", alt: "College event attendees with Shivam Malaviya" },
  { category: "Workshops", h: "h-56", src: "/images/event-workshop-2.jpg", alt: "Workshop venue prepared for a Netraksh cyber awareness session" },
  { category: "Media Coverage", h: "h-72", src: "/images/event-press-3.jpg", alt: "Newspaper feature on community skill and awareness initiatives" },
  { category: "Book Launch", h: "h-56", src: "/images/event-launch-5.jpg", alt: "Readers and guests with Digital Dhokha at the World Book Fair" },
  { category: "Public Speaking", h: "h-72", src: "/images/event-award-1.jpg", alt: "Shivam Malaviya speaking and honoured at the Pratibha Samman Samaroh" },
  { category: "Community Outreach", h: "h-80", src: "/images/event-felicitation-2.jpg", alt: "Shivam Malaviya presenting a Cyber Empowered certificate at a digital safety recognition event" },
  { category: "Book Launch", h: "h-64", src: "/images/event-launch-7.jpg", alt: "Shivam Malaviya presenting his book Digital Dhokha to dignitaries" },
  { category: "Workshops", h: "h-72", src: "/images/event-workshop-3.jpg", alt: "Shivam Malaviya leading a session on social media and online shopping scams in a corporate boardroom" },
  { category: "School Programs", h: "h-64", src: "/images/event-school-5.jpg", alt: "Shivam Malaviya addressing a full classroom of school students during a cyber awareness program" },
  { category: "Community Outreach", h: "h-72", src: "/images/event-felicitation-3.jpg", alt: "Shivam Malaviya felicitated by police officials at a Traffic Rules and cyber awareness camp" },
  { category: "Public Speaking", h: "h-56", src: "/images/event-speaking-4.jpg", alt: "Shivam Malaviya speaking at the Dainik Jagran Pratibha Karyashala" },
  { category: "Community Outreach", h: "h-80", src: "/images/event-felicitation-4.jpg", alt: "Shivam Malaviya conducting a cyber safety awareness session for a community of women" },
  { category: "Videos", h: "h-80", type: "video", src: "/videos/event-video-1.mp4", poster: "/images/event-video-1.jpg", alt: "Event highlight video from a Netraksh cyber awareness program" },
  { category: "Videos", h: "h-56", type: "video", src: "/videos/event-video-2.mp4", poster: "/images/event-video-2.jpg", alt: "Shivam Malaviya speaking at a cyber awareness event" },
  { category: "Videos", h: "h-56", type: "video", src: "/videos/event-video-3.mp4", poster: "/images/event-video-3.jpg", alt: "Highlights from a Netraksh awareness session" },
];

const mediaItems = [
  { category: "Book Launch Coverage", title: "Digital Dhokha launch draws national attention", blurb: "Coverage of the launch of India's first cyber crime awareness book." },
  { category: "Cyber Awareness Campaigns", title: "Awareness drives reach citizens across India", blurb: "Featuring nationwide workshops and citizen safety initiatives." },
  { category: "Expert Interviews", title: "Decoding India's rising cyber fraud", blurb: "Expert commentary on scams, prevention, and digital safety." },
  { category: "Media Features", title: "Voices on building a cyber-safe India", blurb: "Features on the mission to make every Indian cyber aware." },
];

const testimonials = [
  { quote: "The session was eye-opening. Our students now think twice before clicking unknown links.", role: "School Principal" },
  { quote: "Practical, relatable, and delivered in both Hindi and English. Our staff loved it.", role: "Corporate HR Lead" },
  { quote: "Senior citizens in our community finally understand how digital arrest scams work.", role: "Community Welfare Organiser" },
  { quote: "A must-attend session for every college student in India.", role: "College Dean" },
  { quote: "Real case studies made the risks impossible to ignore.", role: "Bank Branch Manager" },
  { quote: "Engaging and actionable, exactly what awareness programs should be.", role: "Govt. Training Coordinator" },
];

const eventTypes = [
  "School Program",
  "College Event",
  "Corporate Workshop",
  "Government Training",
  "Public Awareness Campaign",
  "Podcast Appearance",
  "Media Interview",
];

const trustCards = [
  { icon: Brain, title: "Threat Intelligence", desc: "Reading the criminal playbook before it reaches you." },
  { icon: ShieldCheck, title: "Cyber Defense", desc: "Defensive expertise built on real-world operations." },
  { icon: Eye, title: "Digital Safety", desc: "Making safety simple, clear, and human." },
  { icon: Users, title: "Family Protection", desc: "Designed for seniors, parents, and children alike." },
  { icon: Sparkles, title: "AI-Powered Scam Detection", desc: "Spotting fraud in calls, messages, links, and QR codes." },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setN(Math.round(p * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

export default function Founder() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    eventType: "",
    message: "",
  });

  const filteredGallery = useMemo(
    () =>
      activeCategory === "All"
        ? galleryItems
        : galleryItems.filter((g) => g.category === activeCategory),
    [activeCategory]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Booking enquiry: ${form.eventType || "Event"} - ${form.organization || form.name}`;
    const body = `Name: ${form.name}\nOrganization: ${form.organization}\nEmail: ${form.email}\nPhone: ${form.phone}\nEvent Type: ${form.eventType}\n\nMessage:\n${form.message}`;
    window.location.href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const scrollTestimonials = (dir: number) => {
    testimonialRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <Layout>
      <SEOHead
        title="Shivam Malaviya: Cyber Crime Specialist, Author & Speaker | Netraksh"
        description="Shivam Malaviya is a Cyber Crime Specialist, author of Digital Dhokha, public speaker and founder of Netraksh. Book a cyber awareness workshop or invite him to speak."
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#08183f] text-white">
        <div className="absolute inset-0 opacity-[0.35] bg-[radial-gradient(circle_at_20%_20%,rgba(255,103,19,0.25),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.25),transparent_40%)]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="container relative mx-auto px-4 md:px-6 pt-32 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase text-accent">
                <span className="h-px w-8 bg-accent" />
                International Cyber Security Expert
              </span>
              <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
                Shivam <span className="text-accent">Malaviya</span>
              </h1>
              <p className="mt-5 text-lg md:text-xl text-blue-100/80 font-medium">
                Cyber Crime Specialist · Author · Public Speaker · Cyber Awareness Evangelist
              </p>
              <p className="mt-4 max-w-xl text-blue-100/70 leading-relaxed">
                Protecting India's digital future through awareness, education, and action,
                helping citizens, students, businesses, and governments stay safe from cyber fraud.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Button asChild className="rounded-full bg-accent hover:bg-accent/90 text-white font-semibold px-7 h-12">
                  <a href={BOOK_AMAZON_URL} target="_blank" rel="noopener noreferrer">
                    Buy the Book <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  onClick={() => scrollToId("book-event")}
                  variant="outline"
                  className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold px-7 h-12"
                >
                  Book a Workshop
                </Button>
                <Button
                  onClick={() => scrollToId("book-event")}
                  variant="outline"
                  className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold px-7 h-12"
                >
                  Invite as Speaker
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative mx-auto"
            >
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-accent/40 via-transparent to-blue-400/30 blur-2xl" />
              <div className="relative rounded-[2rem] p-2 bg-gradient-to-tr from-accent/70 to-amber-200/40">
                <img
                  src="/images/founder-shivam.png"
                  alt="Shivam Malaviya, Cyber Crime Specialist and Founder of Netraksh"
                  className="rounded-[1.6rem] w-[300px] md:w-[360px] object-cover shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 rounded-2xl border border-white/15 bg-[#08183f]/80 backdrop-blur-md px-5 py-3 shadow-xl">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  Securing India's Digital Future
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Personal Mission */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-14">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">Personal Mission</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">Protecting India's Digital Future</h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="grid md:grid-cols-2 gap-10 text-lg text-gray-600 leading-relaxed">
            <div className="space-y-5">
              <p>
                Netraksh was founded with a simple belief:{" "}
                <span className="font-semibold text-gray-900">every Indian deserves protection from online fraud, cyber scams, and digital crime.</span>
              </p>
              <p>As India rapidly embraces digital payments, online services, and connected technologies, cybercriminals are targeting ordinary citizens at an unprecedented scale.</p>
            </div>
            <div className="space-y-5">
              <p>Netraksh was created to make cyber safety simple, accessible, and understandable for every Indian family.</p>
              <p>
                Whether it's a scam call, fake WhatsApp message, fraudulent QR code, phishing link, or digital arrest scam, our mission is to help people identify threats{" "}
                <span className="font-semibold text-gray-900">before they become victims.</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Book Showcase - Digital Dhokha */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-12">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">India's First Cyber Crime Awareness Book</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">Digital Dhokha</h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">Unmasking the Scams, Frauds and Lies Stealing India's Future.</p>
          </motion.div>

          <div className="rounded-[2rem] bg-[#08183f] text-white overflow-hidden shadow-2xl">
            <div className="grid lg:grid-cols-2">
              <div className="relative flex items-center justify-center p-10 lg:p-14 bg-[radial-gradient(circle_at_50%_30%,rgba(255,103,19,0.18),transparent_60%)]">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative w-full max-w-md">
                  <div className="absolute -inset-4 rounded-2xl bg-accent/25 blur-2xl" />
                  <video
                    src={bookTrailer}
                    className="relative rounded-xl w-full shadow-2xl border border-white/10"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    preload="metadata"
                    aria-label="Digital Dhokha book trailer by Shivam Malaviya"
                  />
                </motion.div>
              </div>
              <div className="p-8 md:p-12 lg:py-14">
                <p className="text-blue-100/80 leading-relaxed mb-6">
                  India's first comprehensive cyber crime awareness book, packed with real-world case studies that show how everyday scams unfold, and exactly how to stop them.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {insideTheBook.map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent shrink-0">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{item.title}</div>
                        <div className="text-xs text-blue-100/60 leading-snug">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-8">
                  <p className="text-sm italic text-blue-100/80">
                    "I wrote Digital Dhokha so no Indian family has to learn about cyber fraud the hard way. Awareness is the strongest firewall."
                  </p>
                  <p className="mt-2 text-xs font-semibold text-accent">Shivam Malaviya</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button asChild className="rounded-full bg-accent hover:bg-accent/90 text-white font-semibold px-7 h-12">
                    <a href={BOOK_AMAZON_URL} target="_blank" rel="noopener noreferrer">
                      Buy on Amazon <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold px-7 h-12">
                    <a href={BOOK_FLIPKART_URL} target="_blank" rel="noopener noreferrer">
                      Buy on Flipkart <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Quote */}
      <section className="bg-[#08183f] py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.3] bg-[radial-gradient(circle_at_50%_0%,rgba(255,103,19,0.25),transparent_45%)]" />
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.7 }} className="container relative mx-auto px-4 md:px-6 max-w-4xl text-center">
          <Quote className="h-12 w-12 text-accent mx-auto mb-8" />
          <p className="text-3xl md:text-4xl font-medium leading-snug tracking-tight">
            "Cyber safety should not be limited to experts. Every Indian deserves a<span className="text-accent"> digital bodyguard.</span>"
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <img src="/images/founder-shivam.png" alt="Shivam Malaviya" className="h-14 w-14 rounded-full object-cover border-2 border-accent/60" />
            <div className="text-left">
              <div className="font-semibold">Shivam Malaviya</div>
              <div className="text-sm text-blue-100/70">Founder &amp; CEO, Netraksh</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Impact counters */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-12">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">Impact Across India &amp; Beyond</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">Awareness in action</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }} className="rounded-3xl border border-gray-100 bg-gray-50 p-8 text-center">
                <div className="text-5xl font-bold text-accent">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-2 text-sm font-medium text-gray-600">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Netraksh Exists */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">Why Netraksh Exists</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">The story behind the shield</h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6 relative">
            {storyFlow.map((step, i) => (
              <motion.div key={step.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.12 }} className="relative">
                <div className={`h-full rounded-3xl p-7 border shadow-sm ${i === storyFlow.length - 1 ? "bg-[#08183f] border-[#08183f] text-white" : "bg-white border-gray-100"}`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-5 bg-accent/10 text-accent">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${i === storyFlow.length - 1 ? "text-white" : "text-gray-900"}`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed ${i === storyFlow.length - 1 ? "text-blue-100/70" : "text-gray-600"}`}>{step.desc}</p>
                </div>
                {i < storyFlow.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
                {i < storyFlow.length - 1 && (
                  <div className="md:hidden flex justify-center my-2 text-accent">
                    <ArrowDown className="h-5 w-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey timeline */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">The Journey</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">From frontline defender to founder</h2>
          </motion.div>
          <div className="relative pl-8 md:pl-0">
            <div className="absolute left-2 md:left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-accent/60 via-gray-200 to-transparent md:-translate-x-1/2" />
            <div className="space-y-10">
              {timeline.map((item, i) => (
                <motion.div key={item.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }} className={`relative md:grid md:grid-cols-2 md:gap-12 md:items-center ${i % 2 === 0 ? "" : "md:[direction:rtl]"}`}>
                  <div className={`md:[direction:ltr] ${i % 2 === 0 ? "md:text-right md:pr-4" : "md:pl-4"}`}>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
                      <div className={`flex items-center gap-3 mb-2 ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <div className="absolute left-2 md:left-1/2 top-6 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 h-4 w-4 rounded-full bg-accent ring-4 ring-white" />
                  <div className="hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recognition & Impact */}
      <section className="bg-[#08183f] py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.25] bg-[radial-gradient(circle_at_85%_15%,rgba(255,103,19,0.3),transparent_45%)]" />
        <div className="container relative mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-14">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">Recognition &amp; Impact</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold">Key achievements</h2>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-5">
            {achievements.map((a, i) => (
              <motion.div key={a.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 hover:border-accent/40 transition-colors">
                <div className="text-3xl font-bold text-accent/80 mb-3">{a.no}</div>
                <a.icon className="h-6 w-6 text-accent mb-3" />
                <div className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-100/60 mb-1">{a.tag}</div>
                <h3 className="text-lg font-bold mb-2">{a.title}</h3>
                <p className="text-sm text-blue-100/70 leading-relaxed">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">Services</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">How Shivam can help your organisation</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div key={s.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.06 }} className="group rounded-3xl border border-gray-100 bg-gray-50 p-7 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-5 group-hover:bg-accent group-hover:text-white transition-colors">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-5 flex-1">{s.desc}</p>
                <button onClick={() => scrollToId("book-event")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:gap-2.5 transition-all">
                  Enquire now <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why organizations invite */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">Why Organizations Invite Shivam</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">Awareness that actually sticks</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyInvite.map((c, i) => (
              <motion.div key={c.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.06 }} className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-5">
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{c.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshops & Awareness Programs */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">Workshops &amp; Awareness Programs</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">Reaching every kind of audience</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {workshopPrograms.map((p, i) => (
              <motion.div key={p.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.05 }} className="rounded-3xl border border-gray-100 bg-gray-50 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-32 bg-gradient-to-br from-[#0e2350] to-[#08183f] flex items-center justify-center">
                  <p.icon className="h-9 w-9 text-accent/90" />
                  <span className="absolute bottom-2 right-2 text-[10px] uppercase tracking-wider text-white/40">Photo</span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{p.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-10">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">Photo Gallery</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">Moments from the field</h2>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setLightbox(null);
                }}
                aria-pressed={activeCategory === cat}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat ? "bg-accent text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-accent/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="columns-2 md:columns-3 gap-4 [column-fill:_balance]">
            {filteredGallery.map((g, i) => (
              <button
                key={g.src}
                onClick={() => setLightbox(i)}
                className={`group relative ${g.h} w-full mb-4 break-inside-avoid rounded-2xl overflow-hidden bg-gradient-to-br from-[#0e2350] to-[#08183f]`}
              >
                <img
                  src={g.type === "video" ? g.poster : g.src}
                  alt={g.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
                {g.type === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[#08183f] shadow-lg transition-transform group-hover:scale-110">
                      <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                    </span>
                  </span>
                )}
                <span className="absolute bottom-3 left-3 text-xs font-semibold text-white drop-shadow">{g.category}</span>
                <span className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Media & Press */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">Media &amp; Press Coverage</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">In the spotlight</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {mediaItems.map((m, i) => (
              <motion.div key={m.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }} className="rounded-3xl border border-gray-100 bg-gray-50 p-6 flex flex-col">
                <Newspaper className="h-6 w-6 text-accent mb-4" />
                <span className="text-[11px] font-semibold tracking-wider uppercase text-accent mb-2">{m.category}</span>
                <h3 className="font-bold text-gray-900 mb-2 leading-snug">{m.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{m.blurb}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Built by Cybersecurity Professionals.<br className="hidden md:block" /> <span className="text-accent">Designed for Every Indian.</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {trustCards.map((card, i) => (
              <motion.div key={card.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }} className="group rounded-3xl border border-gray-100 bg-white p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-5 group-hover:bg-accent group-hover:text-white transition-colors">
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6 }} className="flex items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">Testimonials</span>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">What audiences say</h2>
            </div>
            <div className="hidden md:flex gap-2 shrink-0">
              <button onClick={() => scrollTestimonials(-1)} className="h-11 w-11 rounded-full border border-gray-200 flex items-center justify-center hover:border-accent hover:text-accent transition-colors" aria-label="Previous">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => scrollTestimonials(1)} className="h-11 w-11 rounded-full border border-gray-200 flex items-center justify-center hover:border-accent hover:text-accent transition-colors" aria-label="Next">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
          <div ref={testimonialRef} className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none]">
            {testimonials.map((t) => (
              <div key={t.quote} className="snap-start shrink-0 w-[300px] md:w-[340px] rounded-3xl border border-gray-100 bg-gray-50 p-7">
                <div className="flex gap-1 mb-4 text-accent">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">"{t.quote}"</p>
                <p className="text-sm font-semibold text-gray-900">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Roadmap */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} transition={{ duration: 0.6 }} className="rounded-3xl border border-gray-100 bg-white p-9 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-5">
                <Globe2 className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Vision for India</h3>
              <p className="text-gray-600 leading-relaxed">
                A world where cyber awareness is not a privilege but a fundamental right, taught in every school, every institution, across every nation. A digitally literate society where every citizen, from the schoolroom to the boardroom, is equipped to defend themselves in cyberspace.
              </p>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="rounded-3xl border border-gray-100 bg-white p-9 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-5">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Cyber Safety Movement</h3>
              <p className="text-gray-600 leading-relaxed">
                Beyond an app, Netraksh is a national movement, securing nations, educating communities, and advising governments. Through workshops and awareness drives, the mission is to put practical cyber safety into the hands of every Indian family.
              </p>
            </motion.div>
          </div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} transition={{ duration: 0.6 }} className="rounded-3xl border border-gray-100 bg-white p-9 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-5">
              <Map className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-5">Future Roadmap</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-start gap-3"><ArrowRight className="h-4 w-4 text-accent shrink-0 mt-0.5" />Smarter AI-powered scam detection across calls, messages &amp; QR codes.</div>
              <div className="flex items-start gap-3"><ArrowRight className="h-4 w-4 text-accent shrink-0 mt-0.5" />Deeper family protection for seniors, parents, and children.</div>
              <div className="flex items-start gap-3"><ArrowRight className="h-4 w-4 text-accent shrink-0 mt-0.5" />Nationwide cyber literacy programmes in schools and institutions.</div>
              <div className="flex items-start gap-3"><ArrowRight className="h-4 w-4 text-accent shrink-0 mt-0.5" />Making India the safest digital society in the world.</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Book Shivam for an Event */}
      <section id="book-event" className="bg-[#08183f] py-24 text-white relative overflow-hidden scroll-mt-24">
        <div className="absolute inset-0 opacity-[0.3] bg-[radial-gradient(circle_at_15%_20%,rgba(255,103,19,0.25),transparent_45%)]" />
        <div className="container relative mx-auto px-4 md:px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6 }}>
              <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">Book Shivam for an Event</span>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">Invite Shivam to speak or train your audience</h2>
              <p className="mt-5 text-blue-100/75 leading-relaxed">
                From school programs to government training and podcast appearances. Share a few details and the team will get back to you.
              </p>
              <div className="mt-8 space-y-4">
                <a href={`mailto:${BOOKING_EMAIL}`} className="flex items-center gap-3 text-blue-100/90 hover:text-accent transition-colors">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><Mail className="h-5 w-5" /></span>
                  {BOOKING_EMAIL}
                </a>
                <button onClick={() => scrollToId("book-event")} className="flex items-center gap-3 text-blue-100/90 hover:text-accent transition-colors">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><MessageCircle className="h-5 w-5" /></span>
                  Send a booking enquiry
                </button>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {eventTypes.map((et) => (
                  <span key={et} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-blue-100/80">{et}</span>
                ))}
              </div>
            </motion.div>

            <motion.form initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }} onSubmit={handleBooking} className="rounded-3xl bg-white p-7 md:p-9 text-gray-900 shadow-2xl">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="b-name">Name</Label>
                  <Input id="b-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-org">Organization</Label>
                  <Input id="b-org" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="School / company" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-email">Email</Label>
                  <Input id="b-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-phone">Phone</Label>
                  <Input id="b-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 ..." className="h-11" />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="b-type">Event Type</Label>
                <select id="b-type" required value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} className="w-full h-11 px-3 border border-input rounded-md bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select event type...</option>
                  {eventTypes.map((et) => (
                    <option key={et} value={et}>{et}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="b-msg">Message</Label>
                <Textarea id="b-msg" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your event, audience size, and preferred dates." className="resize-none" />
              </div>
              <Button type="submit" className="w-full mt-6 h-12 rounded-xl bg-accent hover:bg-accent/90 text-white text-lg font-semibold">
                Send Booking Enquiry
              </Button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-28 relative overflow-hidden">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.7 }} className="container relative mx-auto px-4 md:px-6 max-w-3xl text-center">
          <span className="text-sm font-semibold tracking-[0.25em] uppercase text-accent">One Mission. One Vision.</span>
          <h2 className="mt-5 text-4xl md:text-5xl font-bold leading-tight text-gray-900">Making India the safest digital society in the world.</h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Ensuring that every citizen has access to simple, powerful protection against cyber fraud.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button asChild className="rounded-full bg-accent hover:bg-accent/90 text-white font-semibold px-7 h-12">
              <Link href="/download">
                Download Netraksh <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold px-7 h-12">
              <Link href="/family-protection">
                Protect Your Family
              </Link>
            </Button>
            <Button onClick={() => scrollToId("book-event")} variant="outline" className="rounded-full border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold px-7 h-12">
              Join the Mission
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Floating booking button */}
      <button
        onClick={() => scrollToId("book-event")}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-accent text-white px-5 h-12 shadow-2xl shadow-accent/30 hover:bg-accent/90 transition-colors"
        aria-label="Book Shivam for an event"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="font-semibold text-sm hidden sm:inline">Book Shivam</span>
      </button>

      {/* Lightbox */}
      {lightbox !== null && filteredGallery[lightbox] && (
        <div role="dialog" aria-modal="true" aria-label={filteredGallery[lightbox].type === "video" ? "Gallery video" : "Gallery image"} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white/80 hover:text-white" aria-label="Close">
            <X className="h-7 w-7" />
          </button>
          <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden bg-gradient-to-br from-[#0e2350] to-[#08183f]" onClick={(e) => e.stopPropagation()}>
            {filteredGallery[lightbox].type === "video" ? (
              <>
                <video
                  src={filteredGallery[lightbox].src}
                  poster={filteredGallery[lightbox].poster}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[80vh] bg-black"
                />
                <span className="sr-only">{filteredGallery[lightbox].alt}</span>
              </>
            ) : (
              <>
                <img
                  src={filteredGallery[lightbox].src}
                  alt={filteredGallery[lightbox].alt}
                  className="w-full max-h-[80vh] object-contain"
                />
                <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-5 py-4 text-white font-medium">
                  {filteredGallery[lightbox].category}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
