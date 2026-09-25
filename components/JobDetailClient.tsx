'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Building,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  UploadCloud,
  FileText,
  AlertCircle,
  X,
  Users,
} from 'lucide-react'

function LinkedinIcon({ size = 16, color = '#0A66C2' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

interface JobOpening {
  _id: string
  title: string
  slug?: { current: string }
  department: string
  location: string
  workplaceType: 'On-site' | 'Hybrid' | 'Remote' | string
  employmentType: string
  experienceLevel?: string
  salaryRange?: string
  shortDescription: string
  responsibilities?: string[]
  requirements?: string[]
  benefits?: string[]
  status: string
  featured?: boolean
  urgent?: boolean
  publishedAt?: string
  _createdAt?: string
}

interface JobDetailClientProps {
  job: JobOpening
  otherJobs: JobOpening[]
  settings?: any
}

export default function JobDetailClient({ job, otherJobs }: JobDetailClientProps) {
  const [copied, setCopied] = useState(false)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)

  // Application form states
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    currentLocation: '',
    yearsOfExperience: '',
    currentCompany: '',
    expectedSalary: '',
    noticePeriod: '15 Days',
    linkedinUrl: '',
    portfolioUrl: '',
    coverLetter: '',
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isParsingResume, setIsParsingResume] = useState(false)
  const [parseStatus, setParseStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const shareUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://flyingwonders.net/job-openings/${job.slug?.current || job._id}`

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out this career opening at Flying Wonders: ${job.title} (${job.location}) - ${shareUrl}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleShareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=600'
    )
  }

  // Gemini AI Resume Auto-Fill
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setResumeFile(file)
    setSubmitError(null)

    if (
      file.type.includes('text') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.json')
    ) {
      try {
        setIsParsingResume(true)
        setParseStatus('AI is analyzing your resume...')
        const textContent = await file.text()
        const res = await fetch('/api/careers/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: textContent }),
        })
        const data = await res.json()
        if (data.success && data.data) {
          const p = data.data
          setFormData((prev) => ({
            ...prev,
            applicantName: p.applicantName || prev.applicantName,
            email: p.email || prev.email,
            phone: p.phone || prev.phone,
            currentLocation: p.currentLocation || prev.currentLocation,
            yearsOfExperience: p.yearsOfExperience || prev.yearsOfExperience,
            currentCompany: p.currentCompany || prev.currentCompany,
            coverLetter: p.summaryPitch || prev.coverLetter,
          }))
          setParseStatus('AI auto-filled your profile!')
          setTimeout(() => setParseStatus(null), 4000)
        }
      } catch (err) {
        console.warn('AI Parsing skipped:', err)
      } finally {
        setIsParsingResume(false)
      }
    }
  }

  // Submit Application via JSON
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      let fileBase64: string | null = null
      if (resumeFile) {
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(resumeFile)
        })
      }

      const payload = {
        jobOpeningId: job._id,
        jobTitle: job.title,
        applicantName: formData.applicantName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        currentLocation: formData.currentLocation.trim(),
        yearsOfExperience: formData.yearsOfExperience,
        currentCompany: formData.currentCompany.trim(),
        expectedSalary: formData.expectedSalary.trim(),
        noticePeriod: formData.noticePeriod,
        linkedinUrl: formData.linkedinUrl.trim(),
        portfolioUrl: formData.portfolioUrl.trim(),
        coverLetter: formData.coverLetter.trim(),
        resumeBase64: fileBase64,
        resumeFileName: resumeFile?.name || null,
        resumeFileType: resumeFile?.type || null,
      }

      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        setSubmitSuccess(data.message || 'Application submitted successfully!')
      } else {
        setSubmitError(data.error || 'Failed to submit application. Please try again.')
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Network error submitting application.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font-inter), sans-serif', color: '#1E293B', background: '#F8FAFC', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* ── BREADCRUMB ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748B' }}>
          <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>
            Home
          </Link>
          <ChevronRight size={14} />
          <Link href="/job-openings" style={{ color: '#800020', fontWeight: 600, textDecoration: 'none' }}>
            Careers & Job Openings
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: '#0F172A', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {job.title}
          </span>
        </div>
      </div>

      {/* ── TOP HERO BANNER ── */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #4A044E 100%)', color: '#FFFFFF', padding: '3.5rem 1.5rem 3rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Link
            href="/job-openings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#CBD5E1',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: '1.25rem',
              transition: 'color 0.15s',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to All Openings</span>
          </Link>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {job.department}
            </span>
            <span style={{ background: '#059669', color: '#FFFFFF', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700 }}>
              {job.workplaceType}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.12)', color: '#CBD5E1', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600 }}>
              {job.employmentType}
            </span>
            {job.urgent && (
              <span style={{ background: '#EF4444', color: '#FFFFFF', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800 }}>
                ⚡ URGENT HIRING
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
              fontWeight: 800,
              lineHeight: 1.25,
              margin: '0 0 1rem 0',
              color: '#FFFFFF',
            }}
          >
            {job.title}
          </h1>

          {/* Meta Info Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', fontSize: '0.9rem', color: '#CBD5E1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} color="#F59E0B" />
              <span>{job.location}</span>
            </div>
            {job.salaryRange && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <DollarSign size={16} color="#10B981" />
                <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{job.salaryRange}</span>
              </div>
            )}
            {job.experienceLevel && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Briefcase size={16} color="#A78BFA" />
                <span>{job.experienceLevel}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building size={16} color="#60A5FA" />
              <span>Flying Wonders Global</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div style={{ maxWidth: '1200px', margin: '-1.5rem auto 0 auto', padding: '0 1.5rem' }}>
        {/* SHARE & QUICK ACTIONS BAR */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
            <Share2 size={16} color="#800020" />
            <span>Share this Position:</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: copied ? '#ECFDF5' : '#F1F5F9',
                border: copied ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                color: copied ? '#065F46' : '#334155',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
              <span>{copied ? 'Link Copied!' : 'Copy Direct URL'}</span>
            </button>

            {/* WhatsApp Share */}
            <button
              onClick={handleShareWhatsApp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#DCFCE7',
                border: '1px solid #86EFAC',
                color: '#15803D',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Share on WhatsApp"
            >
              <MessageSquare size={14} />
              <span>WhatsApp</span>
            </button>

            {/* LinkedIn Share */}
            <button
              onClick={handleShareLinkedIn}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#0A66C2',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Share on LinkedIn"
            >
              <LinkedinIcon size={14} />
              <span>LinkedIn</span>
            </button>

            {/* Apply CTA */}
            <button
              onClick={() => setIsApplyModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#800020',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.55rem 1.4rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(128,0,32,0.25)',
              }}
            >
              <span>Apply Now</span>
            </button>
          </div>
        </div>

        {/* ── TWO COLUMN LAYOUT ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '2rem', alignItems: 'flex-start' }}>
          {/* LEFT: JOB DETAILS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Short Description */}
            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem 0' }}>
                Role Overview
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#334155', margin: 0 }}>
                {job.shortDescription}
              </p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                  Key Responsibilities
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {job.responsibilities.map((resp, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <CheckCircle2 size={13} color="#800020" />
                      </div>
                      <span style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#334155' }}>
                        {resp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                  Qualifications & Requirements
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {job.requirements.map((req, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <CheckCircle2 size={13} color="#1E40AF" />
                      </div>
                      <span style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#334155' }}>
                        {req}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                  What We Offer
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                  {job.benefits.map((ben, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        borderRadius: '10px',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                      }}
                    >
                      <CheckCircle2 size={18} color="#15803D" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#14532D', fontWeight: 600 }}>
                        {ben}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: STICKY APPLICATION CARD */}
          <div style={{ position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '1.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem 0' }}>
                Job Highlights
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748B' }}>Department</span>
                  <strong style={{ color: '#0F172A' }}>{job.department}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748B' }}>Location</span>
                  <strong style={{ color: '#0F172A' }}>{job.location}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748B' }}>Workplace</span>
                  <strong style={{ color: '#059669' }}>{job.workplaceType}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748B' }}>Employment</span>
                  <strong style={{ color: '#0F172A' }}>{job.employmentType}</strong>
                </div>
                {job.salaryRange && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                    <span style={{ color: '#64748B' }}>Remuneration</span>
                    <strong style={{ color: '#059669' }}>{job.salaryRange}</strong>
                  </div>
                )}
                {job.experienceLevel && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                    <span style={{ color: '#64748B' }}>Experience</span>
                    <strong style={{ color: '#0F172A' }}>{job.experienceLevel}</strong>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  style={{
                    width: '100%',
                    background: '#800020',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(128,0,32,0.25)',
                    transition: 'all 0.15s',
                  }}
                >
                  Apply for this Role
                </button>
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.78rem', color: '#64748B' }}>
                🔒 Fast application. Your privacy is guaranteed.
              </div>
            </div>

            {/* Why Flying Wonders Box */}
            <div
              style={{
                background: '#FAF5FF',
                border: '1px solid #E9D5FF',
                borderRadius: '16px',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: '#6B21A8', fontSize: '0.92rem', marginBottom: '0.5rem' }}>
                <Sparkles size={16} />
                <span>Why Join Flying Wonders?</span>
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.55, color: '#581C87', margin: 0 }}>
                We are a modern, high-growth Singapore & global experiential travel operator. We foster meritocracy, remote flexibility, and extraordinary journeys for our travelers and team.
              </p>
            </div>
          </div>
        </div>

        {/* ── OTHER OPEN POSITIONS ── */}
        {otherJobs && otherJobs.length > 0 && (
          <div style={{ marginTop: '4rem', borderTop: '1px solid #E2E8F0', paddingTop: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Other Opportunities at Flying Wonders
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                  Explore other roles in operations, technology, and sales.
                </p>
              </div>
              <Link
                href="/job-openings"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#800020',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                }}
              >
                <span>View All Positions</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {otherJobs.map((oj) => (
                <Link
                  key={oj._id}
                  href={`/job-openings/${oj.slug?.current || oj._id}`}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '1.25rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                        {oj.department}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '4px' }}>
                        {oj.workplaceType}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
                      {oj.title}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {oj.shortDescription}
                    </p>
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#800020', fontWeight: 700 }}>
                    <span>Learn More &rarr;</span>
                    <span style={{ color: '#64748B' }}>📍 {oj.location}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── APPLICATION MODAL ── */}
      {isApplyModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
          onClick={() => setIsApplyModalOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '92vh',
              borderRadius: '16px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', background: '#0F172A', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94A3B8', fontWeight: 700 }}>
                  Application Form
                </span>
                <h3 style={{ margin: '0.2rem 0', fontSize: '1.2rem', fontWeight: 700 }}>
                  Applying for: {job.title}
                </h3>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            {submitSuccess ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#065F46', marginBottom: '0.5rem' }}>
                  Application Received!
                </h3>
                <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
                  {submitSuccess} An automated acknowledgement email has been delivered to your inbox. Our hiring team will review your application carefully.
                </p>
                <button
                  onClick={() => {
                    setIsApplyModalOpen(false)
                    setSubmitSuccess(null)
                  }}
                  style={{ background: '#800020', color: '#FFFFFF', border: 'none', padding: '0.65rem 1.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                  {submitError && (
                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                      {submitError}
                    </div>
                  )}

                  {/* Resume Upload + AI Parser Banner */}
                  <div style={{ border: '2px dashed #CBD5E1', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', background: '#F8FAFC' }}>
                    <input
                      type="file"
                      id="resume-upload-detail"
                      accept=".pdf,.docx,.doc,.txt,.rtf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="resume-upload-detail" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <UploadCloud size={32} color="#800020" />
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                        {resumeFile ? resumeFile.name : 'Upload Your Resume / CV (PDF, DOCX, TXT, Images)'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        Supports any format up to 20MB &bull; <strong>Gemini AI</strong> auto-fills fields
                      </div>
                    </label>

                    {isParsingResume && (
                      <div style={{ marginTop: '0.6rem', color: '#800020', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <Sparkles size={14} />
                        <span>{parseStatus}</span>
                      </div>
                    )}
                  </div>

                  {/* 2-col inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.applicantName}
                        onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                        placeholder="John Tan"
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+65 9123 4567"
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Current City & Country
                      </label>
                      <input
                        type="text"
                        value={formData.currentLocation}
                        onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                        placeholder="Singapore / Bangalore / Remote"
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Years of Experience
                      </label>
                      <input
                        type="text"
                        value={formData.yearsOfExperience}
                        onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                        placeholder="3 years"
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Pitch / Why are you a great fit? (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.coverLetter}
                      onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                      placeholder="Briefly tell us what excites you about this role..."
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', lineHeight: 1.5 }}
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div style={{ padding: '1rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#475569', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ background: '#800020', color: '#FFFFFF', border: 'none', padding: '0.55rem 1.5rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(128,0,32,0.25)' }}
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
