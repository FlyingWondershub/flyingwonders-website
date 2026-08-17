'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { client } from '../../sanity/lib/client'
import { 
  Sparkles, 
  CheckCircle2, 
  Video, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Globe, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Users, 
  BadgePercent,
  PhoneCall,
  UserCheck,
  Check,
  X,
  Loader2,
  FileText,
  GraduationCap,
  DollarSign,
  Award,
  BookOpen
} from 'lucide-react'

export default function StudyInSingaporePage() {
  // Sanity States
  const [sanitySettings, setSanitySettings] = useState<any>(null)
  const [sanityUniversities, setSanityUniversities] = useState<any[]>([])
  const [sanityCourses, setSanityCourses] = useState<any[]>([])

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'docs' | 'visa'>('docs')

  // Form State
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [preferredCourse, setPreferredCourse] = useState('Business & Management')
  const [preferredTime, setPreferredTime] = useState('Morning (9:00 AM – 12:00 PM SGT)')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    // Fetch Settings
    client.fetch(`*[_type == "studyInSingaporeSettings"][0]`)
      .then(res => { if (res) setSanitySettings(res) })
      .catch(() => {})

    // Fetch Universities
    client.fetch(`*[_type == "studyUniversity"] | order(qsRanking asc)`)
      .then(res => { if (res) setSanityUniversities(res) })
      .catch(() => {})

    // Fetch Course Categories
    client.fetch(`*[_type == "studyCourseCategory"]`)
      .then(res => { if (res) setSanityCourses(res) })
      .catch(() => {})
  }, [])

  const defaultStats = [
    { value: '25+', label: 'Institutions' },
    { value: 'S$10k-S$20k', label: 'Annual Tuition Fees' },
    { value: '65K+', label: 'International Students' },
    { value: 'EPEC / LTVP', label: 'Post-Study Visa Options' }
  ]

  const defaultBenefits = [
    { title: 'Academic Excellence', description: 'Singapore is home to top-ranking international universities such as the National University of Singapore (NUS) and Nanyang Technological University (NTU), globally recognized for research.' },
    { title: 'Diverse Environment', description: 'Multicultural society and welcoming community that fosters cross-cultural understanding.' },
    { title: 'Global Business Hub', description: 'A major financial center offering direct networking opportunities with Fortune 500 companies.' },
    { title: 'Research & Innovation', description: 'Universities coordinate directly with tech giants, giving students access to state-of-the-art facilities.' },
    { title: 'Career Opportunities', description: 'Ample internship placements and practical learning, preparing students for immediate employment.' },
    { title: 'IELTS is Not Mandatory', description: 'Many premium colleges do not require IELTS for admission, offering internal English assessments instead.' }
  ]

  const defaultUniversities = [
    { name: 'National University of Singapore', popularFor: 'Petroleum Engineering', qsRanking: 8, websiteUrl: 'https://nus.edu.sg' },
    { name: 'Nanyang Technological University', popularFor: 'Computer Science', qsRanking: 26, websiteUrl: 'https://ntu.edu.sg' },
    { name: 'Curtin Singapore', popularFor: 'Supply Chain Management', qsRanking: 183, websiteUrl: 'https://curtin.edu.sg' },
    { name: 'Singapore Management University', popularFor: 'Business Administration', qsRanking: 545, websiteUrl: 'https://smu.edu.sg' }
  ]

  const defaultCourses = [
    { name: 'Business & Management', desc: 'World-class MBA and corporate administration courses.' },
    { name: 'Engineering', desc: 'Cutting-edge aerospace, civil, and electronic engineering specialities.' },
    { name: 'IT & Computer Science', desc: 'Specialized programs in AI, Cybersecurity, and Software Engineering.' },
    { name: 'Hospitality & Tourism', desc: 'Direct placement programs with Singapore\'s leading luxury resorts.' },
    { name: 'Architecture', desc: 'Sustainable design and urban architecture degrees.' },
    { name: 'Environmental Science', desc: 'Eco-engineering and green resource management.' }
  ]

  const defaultTuition = [
    { level: 'Bachelor’s Degree', range: 'SGD 7,000 – 30,000 per annum' },
    { level: 'Master’s Degree', range: 'SGD 25,000 – 55,000 per annum' }
  ]

  const defaultAccommodation = [
    { type: 'On-Campus Hostels', range: 'SGD 750 – 2,000 per month' },
    { type: 'Off-Campus Apartments', range: 'SGD 1,500 – 2,500 per month' },
    { type: 'Homestays', range: 'SGD 1,000 – 2,500 per month' }
  ]

  const defaultDocs = [
    'A valid passport',
    'Proof of funds / Financial Statements',
    'Completed University Application Form',
    'Proof of Identity / Aadhaar / National ID',
    'Official Academic Transcripts (10th, 12th, Bachelors)',
    'English Language Proficiency (optional / waiver available)',
    'Letter(s) of Recommendation (LORs)',
    'Statement of Purpose (SOP) or Personal Essay',
    'Comprehensive CV/Resume',
    'Portfolio (applicable to Design/Art programs)',
    'Health and Medical insurance'
  ]

  const defaultVisaSteps = [
    'Submit academic credentials and passport copies directly to the university.',
    'Obtain an unconditional Offer Letter from the registered institution.',
    'The university will apply for a Student Pass on the student\'s behalf via SOLAR.',
    'Submit financial documents showing tuition and living capacity.',
    'Prepare proof of academic gaps (if applicable).',
    'Receive the In-Principle Approval (IPA) letter (processing takes 2-3 weeks).'
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
          clientName,
          clientEmail,
          clientPhone,
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
        setSuccessMsg('Your consultation request has been submitted! Our education advisor will email you shortly.')
      } else {
        alert(json.error || 'Failed to submit.')
      }
    } catch {
      alert('Error submitting inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '6rem', color: '#1E293B' }}>
      
      {/* 🚀 Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #093E30 0%, #152E52 100%)',
        color: '#FFF',
        padding: '5rem 1.5rem 6rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '0.35rem 1rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            🎓 Education Hub Singapore
          </span>
          <h1 style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '1.25rem'
          }}>
            {sanitySettings?.heroTitle || 'Study in Singapore: Unlock Success in the Global Education Hub'}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#D1D5DB', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Top-ranking global universities, world-class career prospects, and dynamic campus lives. Free guidance for Indian and international students.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: '#F59E0B',
                color: '#FFF',
                border: 'none',
                padding: '0.8rem 1.8rem',
                borderRadius: '30px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <GraduationCap size={18} /> Free Expert Consultation
            </button>
            {sanitySettings?.brochureUrl && (
              <a
                href={sanitySettings.brochureUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'transparent',
                  color: '#FFF',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  padding: '0.8rem 1.8rem',
                  borderRadius: '30px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FileText size={18} /> View Brochure
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 📊 Stats Counter */}
      <section style={{ maxWidth: '1100px', margin: '-3rem auto 4rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          textAlign: 'center'
        }}>
          {stats.map((stat: any, index: number) => (
            <div key={index} style={{ borderRight: index < stats.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#093E30', margin: '0 0 0.25rem' }}>{stat.value}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 💡 Why Study */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair), serif',
          fontSize: '2rem',
          fontWeight: 800,
          textAlign: 'center',
          color: '#093E30',
          marginBottom: '3rem'
        }}>
          {sanitySettings?.whyStudyTitle || 'Why Study in Singapore?'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {benefits.map((point: any, index: number) => (
            <div key={index} style={{
              background: '#FFF',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#093E30', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#10B981" /> {point.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>{point.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🏢 Top Universities */}
      <section style={{ background: '#F1F5F9', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: '2rem',
            fontWeight: 800,
            textAlign: 'center',
            color: '#093E30',
            marginBottom: '1rem'
          }}>
            Top Universities in Singapore
          </h2>
          <p style={{ textAlign: 'center', color: '#64748B', maxWidth: '600px', margin: '0 auto 3rem', fontSize: '0.95rem' }}>
            Choose from highly ranked global educational institutes with high career placement success.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {universities.map((uni: any, idx: number) => (
              <div key={idx} style={{
                background: '#FFF',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#093E30', marginBottom: '1rem' }}>{uni.name}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                      🌟 QS World Rank: <strong>{uni.qsRanking || 'N/A'}</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                      🎓 Popular For: <strong>{uni.popularFor}</strong>
                    </div>
                  </div>
                </div>
                {uni.websiteUrl && (
                  <a
                    href={uni.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#F59E0B',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Visit Website <ArrowRight size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📚 Popular Course Streams */}
      <section style={{ maxWidth: '1100px', margin: '5rem auto', padding: '0 1.5rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair), serif',
          fontSize: '2rem',
          fontWeight: 800,
          textAlign: 'center',
          color: '#093E30',
          marginBottom: '3rem'
        }}>
          Popular Courses in Singapore
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {courses.map((course: any, idx: number) => (
            <div key={idx} style={{
              background: '#FFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#093E30', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="#F59E0B" /> {course.name}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>{course.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 💰 Cost of Studying */}
      <section style={{ background: '#093E30', color: '#FFF', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: '2.2rem',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            Cost of Studying in Singapore
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Tuition */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem', color: '#F59E0B' }}>
                Tuition Fees (Annual)
              </h3>
              {tuitionList.map((t: any, i: number) => (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#A1A1AA', textTransform: 'uppercase', fontWeight: 700 }}>{t.level}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t.range}</div>
                </div>
              ))}
            </div>

            {/* Accommodation */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem', color: '#F59E0B' }}>
                Accommodation (Monthly)
              </h3>
              {accommodationList.map((a: any, i: number) => (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#A1A1AA', textTransform: 'uppercase', fontWeight: 700 }}>{a.type}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{a.range}</div>
                </div>
              ))}
            </div>

            {/* Living Cost */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem', color: '#F59E0B' }}>
                Living Expenses
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#A1A1AA', textTransform: 'uppercase', fontWeight: 700 }}>Average per year</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginTop: '0.25rem' }}>{livingCost}</div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#A1A1AA', lineHeight: 1.5, margin: 0 }}>
                Includes transportation, local meals, study materials, recreation, and health insurance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 📜 Scholarships */}
      <section style={{ maxWidth: '1100px', margin: '5rem auto', padding: '0 1.5rem' }}>
        <div style={{
          background: '#FFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 6px 20px rgba(0,0,0,0.02)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2rem', fontWeight: 800, color: '#093E30', marginBottom: '1rem' }}>
              {sanitySettings?.scholarshipTitle || 'Scholarships & MOE Tuition Grant'}
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {sanitySettings?.scholarshipDescription || 
                'The Ministry of Education (MOE) Tuition Grant is an option provided by the Government of Singapore to offset tuition costs for full-time tertiary education. International students who sign a bond agreeing to work for a Singapore-based company for three years upon graduation may qualify for significant subsidies.'
              }
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#093E30', fontWeight: 700 }}>
              <Award size={20} color="#F59E0B" /> Subsidies range from SGD 1,500 up to 75% of tuition fees.
            </div>
          </div>
          <div style={{ background: '#F1F5F9', borderRadius: '12px', padding: '2rem', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 1rem', color: '#093E30', fontWeight: 800 }}>Need help applying?</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>Our education consultants will guide you through the MOE application process and university scholarship portals.</p>
            <button
              onClick={() => setShowModal(true)}
              style={{ background: '#093E30', color: '#FFF', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '25px', fontWeight: 800, cursor: 'pointer' }}
            >
              Get Scholarship Help
            </button>
          </div>
        </div>
      </section>

      {/* 📑 Documents & Visa Steps */}
      <section style={{ background: '#F1F5F9', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Tab Headers */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <button
              onClick={() => setActiveTab('docs')}
              style={{
                background: activeTab === 'docs' ? '#093E30' : 'transparent',
                color: activeTab === 'docs' ? '#FFF' : '#475569',
                border: activeTab === 'docs' ? 'none' : '1px solid #CBD5E1',
                padding: '0.75rem 2rem',
                borderRadius: '30px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              📋 Documents Required
            </button>
            <button
              onClick={() => setActiveTab('visa')}
              style={{
                background: activeTab === 'visa' ? '#093E30' : 'transparent',
                color: activeTab === 'visa' ? '#FFF' : '#475569',
                border: activeTab === 'visa' ? 'none' : '1px solid #CBD5E1',
                padding: '0.75rem 2rem',
                borderRadius: '30px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🛂 Visa Application Process
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '2.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            {activeTab === 'docs' ? (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#093E30', marginBottom: '1.5rem' }}>
                  {sanitySettings?.documentsTitle || 'Documents Checklist'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {docsList.map((doc: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.9rem', color: '#475569', alignItems: 'flex-start' }}>
                      <Check size={16} color="#10B981" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#093E30', marginBottom: '1.5rem' }}>
                  {sanitySettings?.visaTitle || 'Student Visa Steps (Student\'s Pass)'}
                </h3>
                <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
                  {visaList.map((step: string, i: number) => (
                    <li key={i} style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.6 }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ✍️ Action Form Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(9, 62, 48, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFF',
            width: '100%',
            maxWidth: '520px',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            padding: '2rem',
            position: 'relative'
          }}>
            <button
              onClick={() => { setShowModal(false); setSuccessMsg(null); }}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.5rem', fontWeight: 800, color: '#093E30', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={24} color="#F59E0B" /> Education Consultation
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
              Submit your inquiry and a certified student consultant will schedule a free video advice session.
            </p>

            {successMsg ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#093E30', margin: '0 0 1rem' }}>{successMsg}</p>
                <button
                  onClick={() => { setShowModal(false); setSuccessMsg(null); }}
                  style={{ background: '#093E30', color: '#FFF', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '20px', cursor: 'pointer' }}
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Email Address *</label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={e => setClientEmail(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>WhatsApp Phone *</label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Preferred Stream</label>
                    <select
                      value={preferredCourse}
                      onChange={e => setPreferredCourse(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', background: '#FFF' }}
                    >
                      <option value="Business & Management">Business & Management</option>
                      <option value="Engineering">Engineering</option>
                      <option value="IT & Computer Science">IT & Computer Science</option>
                      <option value="Hospitality & Tourism">Hospitality & Tourism</option>
                      <option value="Architecture">Architecture</option>
                      <option value="Environmental Science">Environmental Science</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Preferred Call Slot</label>
                    <select
                      value={preferredTime}
                      onChange={e => setPreferredTime(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', background: '#FFF' }}
                    >
                      <option value="Morning (9:00 AM – 12:00 PM SGT)">Morning (9:00 AM – 12:00 PM SGT)</option>
                      <option value="Afternoon (1:00 PM – 4:00 PM SGT)">Afternoon (1:00 PM – 4:00 PM SGT)</option>
                      <option value="Evening (5:00 PM – 8:00 PM SGT)">Evening (5:00 PM – 8:00 PM SGT)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Questions / Academic Background</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us your current qualification (e.g. 12th, Graduate) and target universities."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', resize: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: '#093E30',
                    color: '#FFF',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '0.5rem'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Submitting Inquiry...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
