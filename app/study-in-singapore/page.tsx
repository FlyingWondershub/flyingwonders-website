'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { client } from '../../sanity/lib/client'
import {
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Calendar,
  Clock,
  Globe,
  ShieldCheck,
  Star,
  ArrowRight,
  Users,
  PhoneCall,
  UserCheck,
  Check,
  X,
  Loader2,
  FileText,
  GraduationCap,
  DollarSign,
  Award,
  BookOpen,
  ChevronDown,
  ChevronRight,
  MapPin,
  Briefcase,
  Heart,
  TrendingUp,
  Building2,
  Lightbulb,
  Plane,
  Home,
  Coffee,
  Train,
  Wifi,
  Shield,
  BarChart3,
  MessageCircle,
  ChevronLeft
} from 'lucide-react'


/* ─── Colour helpers ─── */
const EMERALD = '#093E30'
const AMBER   = '#F59E0B'
const SLATE   = '#475569'
const LIGHT   = '#F1F5F9'

/* ─── Course icon/colour map ─── */
const COURSE_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  'Business & Management': { icon: <Briefcase size={20} />, color: '#F59E0B', bg: '#FEF3C7' },
  'Engineering':           { icon: <Building2 size={20} />, color: '#3B82F6', bg: '#DBEAFE' },
  'IT & Computer Science': { icon: <Wifi size={20} />,     color: '#8B5CF6', bg: '#EDE9FE' },
  'Hospitality & Tourism': { icon: <Coffee size={20} />,   color: '#EC4899', bg: '#FCE7F3' },
  'Architecture':          { icon: <Home size={20} />,     color: '#10B981', bg: '#D1FAE5' },
  'Environmental Science': { icon: <Globe size={20} />,    color: '#14B8A6', bg: '#CCFBF1' },
  'Finance & Banking':     { icon: <TrendingUp size={20} />, color: '#F97316', bg: '#FFEDD5' },
  'Medicine & Healthcare': { icon: <Heart size={20} />,    color: '#EF4444', bg: '#FEE2E2' },
  'Media & Communications':{ icon: <MessageSquare size={20} />, color: '#6366F1', bg: '#E0E7FF' },
  'Psychology':            { icon: <Lightbulb size={20} />, color: '#A855F7', bg: '#F3E8FF' },
}

/* ─── University tiers ─── */
function getUniTier(rank: number | undefined) {
  if (!rank) return { label: 'Ranked', color: '#64748B', bg: '#F1F5F9' }
  if (rank <= 50)  return { label: 'Gold Tier',   color: '#B45309', bg: '#FEF3C7' }
  if (rank <= 200) return { label: 'Silver Tier', color: '#475569', bg: '#E2E8F0' }
  return                  { label: 'Bronze Tier', color: '#92400E', bg: '#FEF9C3' }
}

export default function StudyInSingaporePage() {
  /* ── Sanity ── */
  const [sanitySettings, setSanitySettings]       = useState<any>(null)
  const [sanityUniversities, setSanityUniversities] = useState<any[]>([])
  const [sanityCourses, setSanityCourses]         = useState<any[]>([])

  /* ── UI ── */
  const [showModal, setShowModal]       = useState(false)
  const [activeTab, setActiveTab]       = useState<'docs' | 'visa'>('docs')
  const [openFaq, setOpenFaq]           = useState<number | null>(null)
  const [compareCountry, setCompareCountry] = useState<'UK' | 'AU' | 'CA'>('UK')
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  /* ── Form ── */
  const [clientName, setClientName]     = useState('')
  const [clientEmail, setClientEmail]   = useState('')
  const [clientPhone, setClientPhone]   = useState('')
  const [preferredCourse, setPreferredCourse] = useState('Business & Management')
  const [preferredTime, setPreferredTime] = useState('Morning (9:00 AM – 12:00 PM SGT)')
  const [notes, setNotes]               = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg]     = useState<string | null>(null)

  useEffect(() => {
    client.fetch(`*[_type == "studyInSingaporeSettings"][0]`)
      .then(res => { if (res) setSanitySettings(res) }).catch(() => {})
    client.fetch(`*[_type == "studyUniversity"] | order(qsRanking asc)`)
      .then(res => { if (res) setSanityUniversities(res) }).catch(() => {})
    client.fetch(`*[_type == "studyCourseCategory"]`)
      .then(res => { if (res) setSanityCourses(res) }).catch(() => {})
  }, [])

  /* Stats counter scroll trigger */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  /* ── Defaults ── */
  const defaultStats = [
    { value: '25+',       label: 'Top Institutions',        icon: <GraduationCap size={22} /> },
    { value: 'S$10–20k',  label: 'Annual Tuition',          icon: <DollarSign size={22} /> },
    { value: '65K+',      label: 'International Students',  icon: <Users size={22} /> },
    { value: 'EPEC/LTVP', label: 'Post-Study Visa Options', icon: <ShieldCheck size={22} /> },
  ]

  const defaultBenefits = [
    { title: 'World-Class Universities',     icon: <GraduationCap size={22} />, color: AMBER,     description: "NUS (#8) and NTU (#26) consistently rank among the world's top 30 universities, delivering research-driven, industry-linked education." },
    { title: 'Safe & Liveable City',         icon: <Shield size={22} />,        color: '#10B981', description: 'Ranked #1 in Asia and among the top 3 globally for personal safety, Singapore offers students unmatched peace of mind.' },
    { title: 'Global Business Hub',          icon: <Briefcase size={22} />,     color: '#3B82F6', description: 'Headquarters of over 7,000 multinationals. Students gain unparalleled access to networking, internships, and real-world case studies.' },
    { title: 'Research & Innovation',        icon: <Lightbulb size={22} />,     color: '#8B5CF6', description: 'Partner with tech giants like Google, Meta and biotech leaders directly on campus. State-of-the-art labs and R&D facilities are the norm.' },
    { title: 'Multicultural Society',        icon: <Globe size={22} />,         color: '#EC4899', description: 'A diverse, welcoming community of 65,000+ international students. English is the primary medium of instruction across all institutions.' },
    { title: 'Career & Internship Access',   icon: <TrendingUp size={22} />,    color: '#F97316', description: "Singapore's 97% graduate employment rate and active campus career centres ensure students are job-ready from Day 1." },
    { title: 'No IELTS Mandatory',           icon: <CheckCircle2 size={22} />,  color: '#14B8A6', description: 'Many premium colleges offer internal English assessments, removing the IELTS barrier for Indian and Southeast Asian applicants.' },
    { title: 'Post-Study Work Rights',       icon: <UserCheck size={22} />,     color: '#A855F7', description: 'Graduates can transition to Employment Pass (EP) or LTVP+ seamlessly, with Singapore\'s transparent immigration pathways.' },
  ]

  const defaultUniversities = [
    { name: 'National University of Singapore',   popularFor: 'Engineering, Medicine, Law',  qsRanking: 8,   websiteUrl: 'https://nus.edu.sg' },
    { name: 'Nanyang Technological University',   popularFor: 'Computer Science, Business',  qsRanking: 26,  websiteUrl: 'https://ntu.edu.sg' },
    { name: 'Singapore Management University',    popularFor: 'Business, Accountancy, Law',  qsRanking: 545, websiteUrl: 'https://smu.edu.sg' },
    { name: 'Curtin Singapore',                   popularFor: 'Supply Chain, Engineering',   qsRanking: 183, websiteUrl: 'https://curtin.edu.sg' },
    { name: 'SIM Global Education',               popularFor: 'Business, Mass Communication',qsRanking: undefined, websiteUrl: 'https://sim.edu.sg' },
    { name: 'James Cook University Singapore',    popularFor: 'Psychology, IT, Business',    qsRanking: 401, websiteUrl: 'https://jcu.edu.sg' },
    { name: 'MDIS – Management Development Institute', popularFor: 'Hospitality, Fashion, Business', qsRanking: undefined, websiteUrl: 'https://mdis.edu.sg' },
  ]

  const defaultCourses = [
    { name: 'Business & Management',  desc: 'World-class MBA and corporate administration courses with Fortune 500 case studies.' },
    { name: 'Engineering',            desc: 'Aerospace, civil, electronic and chemical engineering with industry-linked internships.' },
    { name: 'IT & Computer Science',  desc: 'Specialised programs in AI, Cybersecurity, Data Science and Software Engineering.' },
    { name: 'Hospitality & Tourism',  desc: 'Direct placement programs with Singapore\'s leading luxury resorts and hotel chains.' },
    { name: 'Architecture',           desc: 'Sustainable design and urban architecture degrees taught by award-winning practitioners.' },
    { name: 'Environmental Science',  desc: 'Eco-engineering and green resource management aligned with Singapore\'s Green Plan 2030.' },
    { name: 'Finance & Banking',      desc: 'Fintech, investment banking, and quantitative finance in Asia\'s financial capital.' },
    { name: 'Medicine & Healthcare',  desc: 'Nursing, pharmacy, and allied health programs with clinical placements in top hospitals.' },
    { name: 'Media & Communications', desc: 'Journalism, digital marketing, and film production with industry mentorship.' },
    { name: 'Psychology',             desc: 'Applied and clinical psychology degrees preparing graduates for global health sectors.' },
  ]

  const defaultTuition = [
    { level: 'Bachelor\'s Degree', range: 'SGD 7,000 – 30,000 per annum' },
    { level: 'Master\'s Degree',   range: 'SGD 25,000 – 55,000 per annum' },
    { level: 'Diploma',            range: 'SGD 5,000 – 12,000 per annum' },
  ]

  const defaultAccommodation = [
    { type: 'On-Campus Hostels',      range: 'SGD 750 – 2,000 / month' },
    { type: 'Off-Campus Apartments',  range: 'SGD 1,500 – 2,500 / month' },
    { type: 'Homestays',              range: 'SGD 1,000 – 2,500 / month' },
  ]

  const defaultDocs = [
    'A valid passport (min. 6 months validity)',
    'Proof of funds / Bank statements (min. SGD 30,000)',
    'Completed University Application Form',
    'Proof of Identity / Aadhaar / National ID',
    'Official Academic Transcripts (10th, 12th, Bachelor\'s)',
    'English Language Proficiency (IELTS optional — waiver available)',
    'Letter(s) of Recommendation (LORs) — 2 minimum',
    'Statement of Purpose (SOP) or Personal Essay',
    'Comprehensive CV / Resume',
    'Portfolio (applicable to Design / Art / Architecture programs)',
    'Health and Medical Insurance proof',
  ]

  const defaultVisaSteps = [
    'Submit academic credentials and passport copies directly to your chosen institution.',
    'Receive an unconditional Offer Letter from the registered institution.',
    'The university applies for a Student Pass on your behalf through the ICA SOLAR portal.',
    'Submit financial documents demonstrating tuition and living capacity (min. SGD 30,000).',
    'Prepare a written explanation for any academic gaps (if applicable).',
    'Receive the In-Principle Approval (IPA) letter — processing takes approximately 2–3 weeks.',
    'Collect your Student\'s Pass in person at the ICA Building on arrival in Singapore.',
  ]

  const faqItems = [
    { q: 'Is IELTS required for admission in Singapore?', a: 'No — many colleges and universities in Singapore offer internal English assessments (like an online test or interview) instead of requiring IELTS. This is one of Singapore\'s biggest advantages over the UK or Australia, where IELTS is mandatory.' },
    { q: 'Can I work part-time while studying in Singapore?', a: 'Yes! Students enrolled in full-time courses at approved institutions can work up to 16 hours per week during semesters, and full-time during scheduled vacation periods. This helps offset living costs significantly.' },
    { q: 'What is the MOE Tuition Grant?', a: 'The Ministry of Education (MOE) Tuition Grant is a government subsidy that reduces tuition fees by up to 75% for international students, in exchange for a 3-year bond to work for a Singapore-registered company after graduation.' },
    { q: 'How long is the Student\'s Pass valid?', a: 'The Student\'s Pass is typically valid for the duration of your course plus a short grace period. It is renewed annually or per semester, depending on the institution.' },
    { q: 'Can I bring my family to Singapore as a student?', a: 'Full-time students may apply for a Dependant\'s Pass for their spouse and children, subject to ICA approval. Your institution\'s student services team can guide you through the application process.' },
    { q: 'What is the minimum budget required to study in Singapore?', a: 'A conservative annual budget including tuition (Bachelor\'s level), accommodation, food, transport and miscellaneous expenses would be approximately SGD 25,000 – 40,000 per year.' },
    { q: 'How soon should I apply before the intake date?', a: 'We recommend starting the application process at least 4–6 months before your target intake. Singapore universities have rolling admissions, so earlier applications have a better chance of securing seats and scholarships.' },
    { q: 'Does Flying Wonders charge any fee for guidance?', a: 'No — our education consultation service is completely free for students. Flying Wonders is an authorised partner of several Singapore institutions, so we earn a referral fee from the university, not from you.' },
  ]

  const countryCompare: Record<'UK' | 'AU' | 'CA', {
    tuition: string; living: string; safety: string; jobs: string; weather: string; visa: string
  }> = {
    UK: { tuition: '£15k–35k/yr', living: '£15k–20k/yr', safety: 'Moderate', jobs: 'Competitive', weather: 'Cold & Rainy', visa: 'Strict post-Brexit' },
    AU: { tuition: 'A$25k–45k/yr', living: 'A$20k–30k/yr', safety: 'Good',     jobs: 'Good',         weather: 'Variable',    visa: 'Medium difficulty' },
    CA: { tuition: 'C$20k–35k/yr', living: 'C$18k–25k/yr', safety: 'Good',     jobs: 'Moderate',     weather: 'Very Cold',   visa: 'Medium difficulty' },
  }

  const intakeMonths = [
    { month: 'Jan 2025', status: 'closed',  label: 'Closed' },
    { month: 'May 2025', status: 'closing', label: 'Closing Soon' },
    { month: 'Aug 2025', status: 'open',    label: 'Open Now' },
    { month: 'Jan 2026', status: 'upcoming',label: 'Upcoming' },
  ]

  const testimonials = [
    { name: 'Priya R.',     country: '🇮🇳 India',    course: 'MBA — National University of Singapore', rating: 5, text: 'Flying Wonders made the entire process effortless. From university selection to my Student\'s Pass, they guided me every step of the way. I\'m now working at a Singapore MNC!' },
    { name: 'Arjun K.',     country: '🇮🇳 India',    course: 'Computer Science — NTU',                 rating: 5, text: 'I was worried about IELTS but their team found me a university that accepted their internal test. The consultation call was incredibly detailed and personalised.' },
    { name: 'Sarah L.',     country: '🇲🇾 Malaysia', course: 'Business — SMU',                         rating: 5, text: 'As a Malaysian student, the team explained the Student\'s Pass process clearly. I got my MOE Tuition Grant with their help, saving thousands in tuition!' },
  ]

  const timelineSteps = [
    { icon: <BookOpen size={20} />,        title: 'Research',         desc: 'Identify course & universities' },
    { icon: <MessageSquare size={20} />,   title: 'Consultation',     desc: 'Free session with our advisor' },
    { icon: <FileText size={20} />,        title: 'Application',      desc: 'Submit documents to university' },
    { icon: <Award size={20} />,           title: 'Offer Letter',     desc: 'Receive unconditional offer' },
    { icon: <ShieldCheck size={20} />,     title: 'Student\'s Pass',  desc: 'ICA SOLAR application via university' },
    { icon: <Plane size={20} />,           title: 'Fly & Enroll',     desc: 'Arrive in Singapore & begin studies' },
  ]

  const neighbourhoods = [
    { name: 'Clementi',     tag: 'Budget-Friendly', rent: 'SGD 1,200–1,800/mo', commute: '10 min to NUS', vibe: 'Quiet residential, great hawker food' },
    { name: 'Jurong East',  tag: 'Student Hub',     rent: 'SGD 1,000–1,600/mo', commute: '5 min to NTU',  vibe: 'Shopping malls, cafes & co-working spaces' },
    { name: 'Bugis / City', tag: 'Vibrant',          rent: 'SGD 1,800–2,500/mo', commute: '10 min to SMU', vibe: 'Urban lifestyle, nightlife & arts scene' },
  ]

  const stats = sanitySettings?.statsList || defaultStats
  const benefits = sanitySettings?.whyStudyPoints || defaultBenefits
  const universities = sanityUniversities.length > 0 ? sanityUniversities : defaultUniversities
  const courses = sanityCourses.length > 0 ? sanityCourses : defaultCourses
  const tuitionList = sanitySettings?.costTuitionList || defaultTuition
  const livingCost = sanitySettings?.costLivingValue || 'Approx. SGD 18,000 per annum'
  const accommodationList = sanitySettings?.costAccommodationList || defaultAccommodation
  const docsList = sanitySettings?.documentsList || defaultDocs
  const visaList = sanitySettings?.visaStepsList || defaultVisaSteps

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName || !clientEmail || !clientPhone) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/travel-consulting/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName, clientEmail, clientPhone,
          userRole: 'Student',
          packageTitle: 'Study in Singapore Consultation',
          packagePrice: 'Free (Academic Inquiry)',
          preferredDate: new Date().toISOString().split('T')[0],
          preferredTimeWindow: preferredTime,
          preferredLanguage: 'English',
          tripDetails: `Preferred Course: ${preferredCourse}. Notes: ${notes}`
        })
      })
      const json = await res.json()
      if (json.success) {
        setSuccessMsg('Your consultation request has been submitted! Our education advisor will contact you shortly.')
      } else {
        alert(json.error || 'Failed to submit.')
      }
    } catch {
      alert('Error submitting. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ─────────── Shared style helpers ─────────── */
  const sectionTitle = (text: string) => (
    <h2 style={{
      fontFamily: 'var(--font-playfair), serif',
      fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
      fontWeight: 800,
      textAlign: 'center',
      color: EMERALD,
      marginBottom: '0.75rem',
      lineHeight: 1.2
    }}>{text}</h2>
  )

  const sectionSubtitle = (text: string) => (
    <p style={{
      textAlign: 'center',
      color: SLATE,
      maxWidth: '600px',
      margin: '0 auto 3rem',
      fontSize: '1rem',
      lineHeight: 1.6
    }}>{text}</p>
  )

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#1E293B', fontFamily: 'var(--font-inter), sans-serif' }}>

      {/* ── Breadcrumb ── */}
      <div style={{ background: '#FFF', borderBottom: '1px solid #E2E8F0', padding: '0.6rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: SLATE }}>
          <Link href="/" style={{ color: SLATE, textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={13} />
          <Link href="/services-catalog" style={{ color: SLATE, textDecoration: 'none' }}>Services</Link>
          <ChevronRight size={13} />
          <span style={{ color: EMERALD, fontWeight: 600 }}>Study in Singapore</span>
        </div>
      </div>

      {/* ─────────── HERO ─────────── */}
      <section style={{
        background: 'linear-gradient(140deg, #062B21 0%, #093E30 40%, #0F2A4A 100%)',
        color: '#FFF',
        padding: 'clamp(4rem, 8vw, 7rem) 1.5rem clamp(5rem, 10vw, 8rem)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Skyline SVG silhouette */}
        <svg viewBox="0 0 1200 180" xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', opacity: 0.07, pointerEvents: 'none' }}>
          <path d="M0 180 L0 120 L40 120 L40 80 L50 80 L50 60 L60 60 L60 40 L70 40 L70 60 L80 60 L80 80 L90 80 L90 120
            L120 120 L120 70 L130 70 L130 50 L140 50 L140 30 L150 30 L150 10 L155 10 L155 30 L160 30 L160 50 L170 50 L170 70 L180 70 L180 120
            L220 120 L220 90 L230 90 L230 110 L250 110 L250 90 L260 90 L260 120
            L290 120 L290 75 L295 55 L300 40 L305 55 L310 75 L310 120
            L350 120 L350 85 L360 85 L360 65 L370 65 L370 45 L380 45 L380 65 L390 65 L390 85 L400 85 L400 120
            L440 120 L440 100 L460 100 L460 120
            L500 120 L500 60 L510 60 L510 40 L520 40 L520 25 L530 25 L530 40 L540 40 L540 60 L550 60 L550 120
            L580 120 L580 80 L600 80 L600 120
            L640 120 L640 90 L655 90 L655 70 L665 70 L665 90 L680 90 L680 120
            L720 120 L720 100 L740 100 L740 120
            L780 120 L780 50 L785 35 L790 20 L795 10 L800 20 L805 35 L810 50 L810 120
            L850 120 L850 80 L860 80 L860 60 L870 60 L870 80 L880 80 L880 120
            L920 120 L920 100 L940 100 L940 120
            L980 120 L980 70 L990 70 L990 50 L1000 50 L1000 70 L1010 70 L1010 120
            L1050 120 L1050 90 L1070 90 L1070 120
            L1100 120 L1100 80 L1110 80 L1110 60 L1120 55 L1130 60 L1130 80 L1140 80 L1140 120
            L1200 120 L1200 180 Z" fill="white"/>
        </svg>

        {/* Stars / particles background */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '820px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Floating pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {['🏆 NUS Ranked #8 Global', '🔬 NTU Ranked #26 Global', '🛡️ World\'s Safest City', '🌏 65,000+ Int\'l Students', '✈️ Free Guidance'].map((pill, i) => (
              <span key={i} style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '0.3rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
                animation: `floatPill ${1.5 + i * 0.3}s ease-in-out infinite alternate`,
              }}>{pill}</span>
            ))}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: 'clamp(2rem, 5.5vw, 3.4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            letterSpacing: '-0.01em'
          }}>
            {sanitySettings?.heroTitle || <>Study in Singapore<br /><span style={{ color: AMBER }}>Unlock Your Global Career</span></>}
          </h1>

          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'rgba(255,255,255,0.8)', marginBottom: '1rem', lineHeight: 1.65, maxWidth: '640px', margin: '0 auto 1rem' }}>
            Top-ranking universities, world-class career prospects, and a safe multicultural city. Free expert guidance for Indian and international students — from application to landing in Singapore.
          </p>

          {/* Social proof strip */}
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span>⭐⭐⭐⭐⭐</span>
            <span>Trusted by <strong style={{ color: 'rgba(255,255,255,0.8)' }}>500+ students</strong> from India, Malaysia & Indonesia</span>
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: AMBER,
                color: '#FFF',
                border: 'none',
                padding: '0.85rem 2rem',
                borderRadius: '30px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(245,158,11,0.45)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 28px rgba(245,158,11,0.55)' }}
              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(245,158,11,0.45)' }}
            >
              <GraduationCap size={18} /> Free Expert Consultation
            </button>
            {sanitySettings?.brochureUrl && (
              <a href={sanitySettings.brochureUrl} target="_blank" rel="noreferrer" style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '0.85rem 2rem',
                borderRadius: '30px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                backdropFilter: 'blur(8px)'
              }}>
                <FileText size={18} /> Download Guide
              </a>
            )}
          </div>
        </div>

        <style>{`
          @keyframes floatPill {
            from { transform: translateY(0px); }
            to   { transform: translateY(-5px); }
          }
        `}</style>
      </section>

      {/* ─────────── STATS ─────────── */}
      <section style={{ maxWidth: '1100px', margin: '-3.5rem auto 5rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        <div ref={statsRef} style={{
          background: '#FFF',
          borderRadius: '20px',
          padding: '2rem 1.5rem',
          boxShadow: '0 15px 40px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.6)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem',
          textAlign: 'center'
        }}>
          {stats.map((stat: any, i: number) => (
            <div key={i} style={{
              borderRight: i < stats.length - 1 ? '1px solid #F1F5F9' : 'none',
              padding: '0.5rem 1rem',
              transition: 'transform 0.3s'
            }}>
              <div style={{
                width: '44px', height: '44px',
                borderRadius: '12px',
                background: '#F1F5F9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.75rem',
                color: EMERALD
              }}>
                {stat.icon || <GraduationCap size={22} />}
              </div>
              <div style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 900,
                color: EMERALD,
                marginBottom: '0.2rem',
                fontVariantNumeric: 'tabular-nums',
                opacity: statsVisible ? 1 : 0,
                transform: statsVisible ? 'translateY(0)' : 'translateY(8px)',
                transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.82rem', color: SLATE, fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── WHY STUDY ─────────── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        {sectionTitle('Why Study in Singapore?')}
        {sectionSubtitle('Discover why Singapore is the top destination for ambitious students from across Asia and beyond.')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {benefits.map((point: any, i: number) => (
            <div key={i} style={{
              background: '#FFF',
              padding: '1.5rem',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              transition: 'transform 0.25s, box-shadow 0.25s',
              cursor: 'default'
            }}
              onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 28px rgba(0,0,0,0.07)' }}
              onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)' }}
            >
              <div style={{
                width: '42px', height: '42px',
                borderRadius: '10px',
                background: point.color ? `${point.color}18` : '#F1F5F9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.85rem',
                color: point.color || EMERALD
              }}>
                {point.icon || <CheckCircle2 size={20} />}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.4rem' }}>{point.title}</h3>
              <p style={{ fontSize: '0.87rem', color: SLATE, lineHeight: 1.6, margin: 0 }}>{point.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── PRESS BADGES ─────────── */}
      <section style={{ background: '#FFF', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', padding: '1.75rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
            Singapore's Rankings — Recognised by
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
            {[
              { name: 'QS World Rankings', tag: 'NUS #8 · NTU #26' },
              { name: 'Times Higher Education', tag: 'Top 30 in Asia' },
              { name: 'US News Global', tag: 'Top 15 in Asia-Pacific' },
              { name: 'Straits Times', tag: 'Best Study City 2024' },
              { name: 'EIU Safe Cities Index', tag: '#1 Safest City' },
            ].map((badge, i) => (
              <div key={i} style={{
                textAlign: 'center',
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                background: '#FAFAFA'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: EMERALD }}>{badge.name}</div>
                <div style={{ fontSize: '0.72rem', color: SLATE, marginTop: '2px' }}>{badge.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── UNIVERSITIES ─────────── */}
      <section style={{ background: LIGHT, padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {sectionTitle('Top Universities in Singapore')}
          {sectionSubtitle('Choose from globally ranked institutions with high graduate employment rates and world-class research facilities.')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {universities.map((uni: any, idx: number) => {
              const tier = getUniTier(uni.qsRanking)
              return (
                <div key={idx} style={{
                  background: '#FFF',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.25s, box-shadow 0.25s'
                }}
                  onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)' }}
                  onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.04)' }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 800,
                        color: tier.color,
                        background: tier.bg,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px'
                      }}>{tier.label}</span>
                      {uni.qsRanking && (
                        <span style={{ fontSize: '0.72rem', color: SLATE, fontWeight: 600 }}>QS #{uni.qsRanking}</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: EMERALD, marginBottom: '0.75rem', lineHeight: 1.3 }}>{uni.name}</h3>
                    <div style={{ fontSize: '0.84rem', color: SLATE, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GraduationCap size={14} color={AMBER} />
                      <span>Known for <strong>{uni.popularFor}</strong></span>
                    </div>
                  </div>
                  {uni.websiteUrl && (
                    <a href={uni.websiteUrl} target="_blank" rel="noreferrer" style={{
                      fontSize: '0.84rem', fontWeight: 700, color: AMBER,
                      textDecoration: 'none',
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      transition: 'gap 0.2s'
                    }}
                      onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.gap = '10px'}
                      onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.gap = '5px'}
                    >
                      Visit Website <ArrowRight size={14} />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─────────── INTAKE CALENDAR ─────────── */}
      <section style={{ maxWidth: '1100px', margin: '5rem auto', padding: '0 1.5rem' }}>
        {sectionTitle('Upcoming Intake Dates')}
        {sectionSubtitle('Plan your application early — Singapore universities have limited seats per intake period.')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {intakeMonths.map((intake, i) => {
            const colours = {
              closed:   { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', label: '#DC2626' },
              closing:  { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', label: '#D97706' },
              open:     { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', label: '#16A34A' },
              upcoming: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', label: '#2563EB' },
            }
            const c = colours[intake.status as keyof typeof colours]
            return (
              <div key={i} style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: '14px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <Calendar size={28} color={c.label} style={{ marginBottom: '0.6rem' }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: c.text, marginBottom: '0.3rem' }}>{intake.month}</div>
                <div style={{
                  display: 'inline-block',
                  background: c.label,
                  color: '#FFF',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.65rem',
                  borderRadius: '20px'
                }}>{intake.label}</div>
              </div>
            )
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => setShowModal(true)} style={{
            background: EMERALD, color: '#FFF', border: 'none',
            padding: '0.7rem 1.75rem', borderRadius: '25px',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
            display: 'inline-flex', alignItems: 'center', gap: '7px'
          }}>
            <Calendar size={16} /> Get Deadline Alerts
          </button>
        </div>
      </section>

      {/* ─────────── COURSES ─────────── */}
      <section style={{ background: LIGHT, padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {sectionTitle('Popular Courses in Singapore')}
          {sectionSubtitle('From tech to hospitality — Singapore offers world-class programs across every discipline.')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            {courses.map((course: any, idx: number) => {
              const meta = COURSE_META[course.name] || { icon: <BookOpen size={20} />, color: EMERALD, bg: '#F1F5F9' }
              return (
                <div key={idx} style={{
                  background: '#FFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  transition: 'transform 0.25s, box-shadow 0.25s'
                }}
                  onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 24px rgba(0,0,0,0.07)' }}
                  onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)' }}
                >
                  <div style={{
                    width: '38px', height: '38px',
                    borderRadius: '9px',
                    background: meta.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '0.75rem',
                    color: meta.color
                  }}>
                    {meta.icon}
                  </div>
                  <h3 style={{ fontSize: '0.97rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.35rem' }}>{course.name}</h3>
                  <p style={{ fontSize: '0.84rem', color: SLATE, lineHeight: 1.55, margin: 0 }}>{course.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─────────── COUNTRY COMPARISON ─────────── */}
      <section style={{ maxWidth: '1100px', margin: '5rem auto', padding: '0 1.5rem' }}>
        {sectionTitle('Singapore vs. Other Study Destinations')}
        {sectionSubtitle('See how Singapore stacks up against other popular choices for international students.')}
        <div style={{
          background: '#FFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          {/* Country toggle */}
          <div style={{ display: 'flex', borderBottom: '1px solid #F1F5F9', padding: '1.25rem 1.5rem', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: SLATE, display: 'flex', alignItems: 'center', gap: '5px', marginRight: '0.5rem' }}>
              <BarChart3 size={16} color={EMERALD} /> Compare with:
            </span>
            {(['UK', 'AU', 'CA'] as const).map(c => (
              <button key={c} onClick={() => setCompareCountry(c)} style={{
                background: compareCountry === c ? EMERALD : '#F8FAFC',
                color: compareCountry === c ? '#FFF' : SLATE,
                border: '1px solid',
                borderColor: compareCountry === c ? EMERALD : '#E2E8F0',
                padding: '0.35rem 1rem',
                borderRadius: '20px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.82rem',
                transition: 'all 0.2s'
              }}>
                {c === 'UK' ? '🇬🇧 UK' : c === 'AU' ? '🇦🇺 Australia' : '🇨🇦 Canada'}
              </button>
            ))}
          </div>

          {/* Comparison table */}
          <div style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  {['Factor', '🇸🇬 Singapore', compareCountry === 'UK' ? '🇬🇧 UK' : compareCountry === 'AU' ? '🇦🇺 Australia' : '🇨🇦 Canada'].map((h, i) => (
                    <th key={i} style={{
                      padding: '0.75rem 1rem',
                      textAlign: i === 0 ? 'left' : 'center',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: i === 1 ? EMERALD : SLATE,
                      background: i === 1 ? '#F0FDF4' : '#FAFAFA',
                      borderBottom: '2px solid #F1F5F9',
                      borderRadius: i === 1 ? '8px 8px 0 0' : undefined
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Annual Tuition',     sg: 'SGD 7k–30k',     other: countryCompare[compareCountry].tuition },
                  { label: 'Living Cost/yr',      sg: 'SGD 15k–22k',    other: countryCompare[compareCountry].living },
                  { label: 'Safety',             sg: '#1 Globally',    other: countryCompare[compareCountry].safety },
                  { label: 'Job Opportunities',  sg: '97% Employment', other: countryCompare[compareCountry].jobs },
                  { label: 'Climate',            sg: 'Tropical (27°C)',other: countryCompare[compareCountry].weather },
                  { label: 'Visa Complexity',    sg: 'Straightforward',other: countryCompare[compareCountry].visa },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '0.7rem 1rem', fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{row.label}</td>
                    <td style={{ padding: '0.7rem 1rem', textAlign: 'center', fontWeight: 700, color: EMERALD, background: 'rgba(9,62,48,0.03)' }}>{row.sg}</td>
                    <td style={{ padding: '0.7rem 1rem', textAlign: 'center', color: SLATE }}>{row.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─────────── COST OF STUDYING ─────────── */}
      <section style={{ background: EMERALD, color: '#FFF', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem' }}>
            Cost of Studying in Singapore
          </h2>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.65)', maxWidth: '560px', margin: '0 auto 0.75rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Singapore is affordable relative to the UK, US, or Australia — especially with MOE subsidies and part-time work allowances.
          </p>
          {/* Work allowance callout */}
          <div style={{
            background: 'rgba(245,158,11,0.15)',
            border: '1px solid rgba(245,158,11,0.35)',
            borderRadius: '12px',
            padding: '0.75rem 1.5rem',
            maxWidth: '460px',
            margin: '0 auto 3rem',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <Briefcase size={18} color={AMBER} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
              Students may work <strong style={{ color: AMBER }}>up to 16 hrs/week</strong> during term — a valuable income supplement!
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Tuition */}
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: AMBER, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                📚 Tuition Fees (Annual)
              </h3>
              {tuitionList.map((t: any, i: number) => (
                <div key={i} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: i < tuitionList.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>{t.level}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{t.range}</div>
                </div>
              ))}
            </div>

            {/* Accommodation */}
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: AMBER, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                🏠 Accommodation (Monthly)
              </h3>
              {accommodationList.map((a: any, i: number) => (
                <div key={i} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: i < accommodationList.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>{a.type}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{a.range}</div>
                </div>
              ))}
            </div>

            {/* Living Cost */}
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: AMBER, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                🛒 Living Expenses
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>Average per year</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFF' }}>{livingCost}</div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
                Includes transport, hawker meals, study materials, recreation, and health insurance.
              </p>
              <div style={{ marginTop: '1rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)' }}>
                💡 Singapore's hawker centres serve full meals from <strong>SGD 3–6</strong>, keeping daily food costs very low.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── TESTIMONIALS ─────────── */}
      <section style={{ maxWidth: '1100px', margin: '5rem auto', padding: '0 1.5rem' }}>
        {sectionTitle('What Our Students Say')}
        {sectionSubtitle('Real experiences from students we helped successfully enroll in Singapore\'s top institutions.')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              background: '#FFF',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              position: 'relative',
              transition: 'transform 0.25s, box-shadow 0.25s'
            }}
              onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 14px 32px rgba(0,0,0,0.08)' }}
              onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)' }}
            >
              {/* Quote mark */}
              <div style={{ position: 'absolute', top: '1.25rem', right: '1.5rem', fontSize: '3.5rem', color: '#F1F5F9', fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</div>
              {/* Stars */}
              <div style={{ display: 'flex', gap: '3px', marginBottom: '1rem' }}>
                {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill={AMBER} color={AMBER} />)}
              </div>
              <p style={{ fontSize: '0.9rem', color: SLATE, lineHeight: 1.7, marginBottom: '1.5rem', fontStyle: 'italic' }}>"{t.text}"</p>
              <div>
                <div style={{ fontWeight: 800, color: EMERALD, fontSize: '0.95rem' }}>{t.name}</div>
                <div style={{ fontSize: '0.78rem', color: SLATE }}>{t.country}</div>
                <div style={{ fontSize: '0.78rem', color: AMBER, fontWeight: 600, marginTop: '2px' }}>{t.course}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── APPLICATION TIMELINE ─────────── */}
      <section style={{ background: LIGHT, padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {sectionTitle('Your Journey to Singapore')}
          {sectionSubtitle('From first research to your first day on campus — here\'s what the process looks like.')}
          {/* Desktop stepper */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {timelineSteps.map((step, i) => (
              <div key={i} style={{ flex: '1', minWidth: '120px', position: 'relative', textAlign: 'center' }}>
                {/* Connector line */}
                {i < timelineSteps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '22px',
                    left: '50%',
                    width: '100%',
                    height: '2px',
                    background: 'linear-gradient(90deg, #10B981, #E2E8F0)',
                    zIndex: 0
                  }} />
                )}
                {/* Step circle */}
                <div style={{
                  width: '46px', height: '46px',
                  borderRadius: '50%',
                  background: i === 0 ? EMERALD : '#FFF',
                  border: `2px solid ${i === 0 ? EMERALD : '#E2E8F0'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  position: 'relative', zIndex: 1,
                  color: i === 0 ? '#FFF' : SLATE,
                  boxShadow: i === 0 ? '0 4px 12px rgba(9,62,48,0.25)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: EMERALD, marginBottom: '0.2rem' }}>Step {i + 1}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.25rem' }}>{step.title}</div>
                <div style={{ fontSize: '0.76rem', color: SLATE, lineHeight: 1.4, padding: '0 0.25rem' }}>{step.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button onClick={() => setShowModal(true)} style={{
              background: AMBER, color: '#FFF', border: 'none',
              padding: '0.8rem 2rem', borderRadius: '30px',
              fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 6px 18px rgba(245,158,11,0.4)',
              transition: 'transform 0.2s'
            }}
              onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'}
              onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'}
            >
              <GraduationCap size={18} /> Start My Application Journey
            </button>
          </div>
        </div>
      </section>

      {/* ─────────── NEIGHBOURHOOD GUIDE ─────────── */}
      <section style={{ maxWidth: '1100px', margin: '5rem auto', padding: '0 1.5rem' }}>
        {sectionTitle('Where Will You Live?')}
        {sectionSubtitle('Singapore\'s neighbourhoods each have a distinct personality. Here are the top student-friendly areas.')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {neighbourhoods.map((n, i) => (
            <div key={i} style={{
              background: '#FFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              transition: 'transform 0.25s, box-shadow 0.25s'
            }}
              onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)' }}
              onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.04)' }}
            >
              <div style={{ background: EMERALD, padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#FFF' }}>{n.name}</h3>
                <span style={{ background: AMBER, color: '#FFF', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '20px' }}>{n.tag}</span>
              </div>
              <div style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.86rem', color: SLATE }}>
                    <DollarSign size={14} color={AMBER} /> <span><strong>Rent:</strong> {n.rent}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.86rem', color: SLATE }}>
                    <Train size={14} color={EMERALD} /> <span><strong>Commute:</strong> {n.commute}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.86rem', color: SLATE }}>
                    <MapPin size={14} color='#EC4899' style={{ marginTop: '2px', flexShrink: 0 }} /> <span>{n.vibe}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── SCHOLARSHIPS ─────────── */}
      <section style={{ background: LIGHT, padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            background: '#FFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.03)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: EMERALD, marginBottom: '1rem' }}>
                {sanitySettings?.scholarshipTitle || 'Scholarships & MOE Tuition Grant'}
              </h2>
              <p style={{ fontSize: '0.95rem', color: SLATE, lineHeight: 1.7, marginBottom: '1.25rem' }}>
                {sanitySettings?.scholarshipDescription ||
                  'The Ministry of Education (MOE) Tuition Grant is a Government of Singapore subsidy available to international students studying full-time at approved institutions. Students who agree to work for a Singapore-registered company for 3 years post-graduation may qualify for subsidies covering up to 75% of tuition fees.'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  'MOE Tuition Grant — up to 75% tuition subsidy',
                  'ASEAN Scholarships — available for top secondary & pre-university students',
                  'University Merit Awards — NUS, NTU, SMU internal scholarships',
                  'Private Foundation Grants — multiple discipline-specific awards',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.88rem', color: '#334155' }}>
                    <Check size={15} color='#10B981' style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: LIGHT, borderRadius: '14px', padding: '2rem', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Award size={40} color={AMBER} style={{ marginBottom: '1rem' }} />
              <h4 style={{ margin: '0 0 0.75rem', color: EMERALD, fontWeight: 800, fontSize: '1.1rem' }}>Need help applying for a scholarship?</h4>
              <p style={{ fontSize: '0.85rem', color: SLATE, marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Our education consultants will guide you through the MOE Tuition Grant and university scholarship portals — completely free of charge.
              </p>
              <button
                onClick={() => setShowModal(true)}
                style={{ background: EMERALD, color: '#FFF', border: 'none', padding: '0.7rem 1.75rem', borderRadius: '25px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Get Scholarship Guidance
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── DOCUMENTS & VISA TABS ─────────── */}
      <section style={{ maxWidth: '960px', margin: '5rem auto', padding: '0 1.5rem' }}>
        {sectionTitle('Documents & Visa Process')}
        {sectionSubtitle('Everything you need to prepare for a successful application and Student\'s Pass approval.')}
        {/* Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          {[{ key: 'docs', label: '📋 Documents Checklist' }, { key: 'visa', label: '🛂 Visa Application Steps' }].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'docs' | 'visa')}
              style={{
                background: activeTab === tab.key ? EMERALD : '#FFF',
                color: activeTab === tab.key ? '#FFF' : SLATE,
                border: activeTab === tab.key ? 'none' : '1px solid #CBD5E1',
                padding: '0.7rem 1.75rem',
                borderRadius: '30px',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '0.88rem',
                transition: 'all 0.2s'
              }}
            >{tab.label}</button>
          ))}
        </div>

        <div style={{ background: '#FFF', borderRadius: '16px', padding: '2.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          {activeTab === 'docs' ? (
            <>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: EMERALD, marginBottom: '1.5rem' }}>
                {sanitySettings?.documentsTitle || 'Application Documents Checklist'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                {docsList.map((doc: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.87rem', color: SLATE, alignItems: 'flex-start', background: '#FAFAFA', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                    <Check size={15} color='#10B981' style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: EMERALD, marginBottom: '1.5rem' }}>
                {sanitySettings?.visaTitle || "Student's Pass (SVP) — Step-by-Step Guide"}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {visaList.map((step: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '28px', height: '28px', flexShrink: 0,
                      borderRadius: '50%',
                      background: EMERALD,
                      color: '#FFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.78rem', fontWeight: 800
                    }}>{i + 1}</div>
                    <p style={{ fontSize: '0.88rem', color: SLATE, lineHeight: 1.65, margin: 0, paddingTop: '4px' }}>{step}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem', background: '#EFF6FF', borderRadius: '10px', padding: '1rem 1.25rem', border: '1px solid #BFDBFE', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <ShieldCheck size={18} color='#2563EB' style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.84rem', color: '#1E40AF', margin: 0, lineHeight: 1.6 }}>
                  <strong>ICA Tip:</strong> Always retain copies of your IPA letter and Student Pass. Processing delays can be tracked at <strong>mom.gov.sg</strong> or via the ICA SOLAR portal.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ─────────── FAQ ─────────── */}
      <section style={{ background: LIGHT, padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          {sectionTitle('Frequently Asked Questions')}
          {sectionSubtitle('Answers to the most common questions from students considering Singapore.')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {faqItems.map((faq, i) => (
              <div key={i} style={{
                background: '#FFF',
                borderRadius: '12px',
                border: `1px solid ${openFaq === i ? EMERALD : '#E2E8F0'}`,
                boxShadow: openFaq === i ? '0 4px 16px rgba(9,62,48,0.08)' : '0 1px 4px rgba(0,0,0,0.02)',
                overflow: 'hidden',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.1rem 1.5rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    gap: '1rem',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '0.93rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.4 }}>{faq.q}</span>
                  <span style={{
                    color: openFaq === i ? EMERALD : SLATE,
                    transition: 'transform 0.25s',
                    transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0
                  }}>
                    <ChevronDown size={18} />
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 1.5rem 1.25rem', fontSize: '0.88rem', color: SLATE, lineHeight: 1.7, borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ paddingTop: '1rem' }}>{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── WHY FLYING WONDERS ─────────── */}
      <section style={{ maxWidth: '1100px', margin: '5rem auto', padding: '0 1.5rem' }}>
        {sectionTitle('Why Choose Flying Wonders?')}
        {sectionSubtitle('We\'re not just a travel company — we\'re your end-to-end education partner in Singapore.')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: <GraduationCap size={26} />, color: AMBER,     bg: '#FEF3C7', title: 'Free Guidance',        desc: 'No consultation fees. Ever. We earn from institutions, not from you.' },
            { icon: <UserCheck size={26} />,     color: '#10B981',  bg: '#D1FAE5', title: 'End-to-End Support',  desc: 'From course selection, to visa, to airport pickup — we\'re with you throughout.' },
            { icon: <ShieldCheck size={26} />,   color: '#3B82F6',  bg: '#DBEAFE', title: 'Visa Expertise',     desc: 'Our consultants have successfully processed 500+ Student\'s Pass applications.' },
            { icon: <Star size={26} />,          color: '#A855F7',  bg: '#F3E8FF', title: '500+ Placements',    desc: 'A proven track record of placing students across NUS, NTU, SMU, Curtin & more.' },
          ].map((item, i) => (
            <div key={i} style={{
              background: '#FFF',
              borderRadius: '14px',
              padding: '1.5rem',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              transition: 'transform 0.25s, box-shadow 0.25s'
            }}
              onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 14px 30px rgba(0,0,0,0.07)' }}
              onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)' }}
            >
              <div style={{
                width: '54px', height: '54px',
                borderRadius: '14px',
                background: item.bg,
                color: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: EMERALD, marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.84rem', color: SLATE, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div style={{
          marginTop: '3.5rem',
          background: 'linear-gradient(135deg, #093E30 0%, #0F2A4A 100%)',
          borderRadius: '20px',
          padding: 'clamp(2rem, 5vw, 3rem)',
          textAlign: 'center',
          color: '#FFF',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <GraduationCap size={40} color={AMBER} style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
              Ready to Begin Your Singapore Journey?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto 2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Book a free 30-minute consultation with our certified education advisor and get a personalised university shortlist within 24 hours.
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: AMBER, color: '#FFF',
                border: 'none',
                padding: '0.9rem 2.5rem',
                borderRadius: '30px',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'inline-flex', alignItems: 'center', gap: '9px',
                boxShadow: '0 8px 24px rgba(245,158,11,0.45)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(245,158,11,0.55)' }}
              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(245,158,11,0.45)' }}
            >
              <GraduationCap size={20} /> Book Free Consultation
            </button>
          </div>
        </div>
      </section>

      {/* ─────────── CONSULTATION MODAL ─────────── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(9,62,48,0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#FFF',
            width: '100%', maxWidth: '540px',
            borderRadius: '20px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
            padding: '2.25rem',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              onClick={() => { setShowModal(false); setSuccessMsg(null) }}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: SLATE }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.4rem' }}>
              <GraduationCap size={26} color={AMBER} />
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.4rem', fontWeight: 800, color: EMERALD, margin: 0 }}>Free Education Consultation</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: SLATE, marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Tell us about yourself and we'll connect you with a certified Singapore education advisor within 24 hours.
            </p>

            {successMsg ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <CheckCircle2 size={54} color='#10B981' style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontSize: '0.97rem', fontWeight: 700, color: EMERALD, marginBottom: '1.25rem', lineHeight: 1.5 }}>{successMsg}</p>
                <button onClick={() => { setShowModal(false); setSuccessMsg(null) }} style={{ background: EMERALD, color: '#FFF', border: 'none', padding: '0.6rem 1.75rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 700 }}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: SLATE, display: 'block', marginBottom: '0.3rem' }}>Full Name *</label>
                  <input type="text" required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Your full name" style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: SLATE, display: 'block', marginBottom: '0.3rem' }}>Email Address *</label>
                    <input type="email" required value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="you@email.com" style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: SLATE, display: 'block', marginBottom: '0.3rem' }}>WhatsApp Number *</label>
                    <input type="tel" required value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: SLATE, display: 'block', marginBottom: '0.3rem' }}>Preferred Stream</label>
                    <select value={preferredCourse} onChange={e => setPreferredCourse(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', background: '#FFF', fontSize: '0.9rem', boxSizing: 'border-box' }}>
                      {Object.keys(COURSE_META).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: SLATE, display: 'block', marginBottom: '0.3rem' }}>Preferred Call Slot</label>
                    <select value={preferredTime} onChange={e => setPreferredTime(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', background: '#FFF', fontSize: '0.9rem', boxSizing: 'border-box' }}>
                      <option>Morning (9:00 AM – 12:00 PM SGT)</option>
                      <option>Afternoon (1:00 PM – 4:00 PM SGT)</option>
                      <option>Evening (5:00 PM – 8:00 PM SGT)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: SLATE, display: 'block', marginBottom: '0.3rem' }}>Questions / Academic Background</label>
                  <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="E.g. I have completed 12th grade in India and I'm interested in an MBA at NUS..." style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', resize: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" disabled={isSubmitting} style={{
                  background: EMERALD, color: '#FFF',
                  border: 'none', padding: '0.85rem',
                  borderRadius: '10px', fontWeight: 800,
                  cursor: 'pointer', fontSize: '0.95rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  marginTop: '0.25rem',
                  opacity: isSubmitting ? 0.75 : 1
                }}>
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit Free Consultation Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}


      {/* ─────────── Sticky Mobile CTA ─────────── */}
      {!showModal && (
        <div style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 850,
          background: EMERALD,
          padding: '0.85rem 1.5rem',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.12)'
        }}
          className="mobile-cta-bar"
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Free for students</div>
            <div style={{ fontSize: '1rem', color: '#FFF', fontWeight: 800 }}>Book Free Consultation</div>
          </div>
          <button onClick={() => setShowModal(true)} style={{
            background: AMBER, color: '#FFF', border: 'none',
            padding: '0.65rem 1.4rem', borderRadius: '25px',
            fontWeight: 800, cursor: 'pointer', fontSize: '0.88rem',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <GraduationCap size={16} /> Apply Now
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-cta-bar { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
