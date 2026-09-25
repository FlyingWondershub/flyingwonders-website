'use client'

import React, { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  DollarSign,
  Send,
  UploadCloud,
  FileText,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Users,
  Compass,
  Award,
  Globe2,
  Share2,
  Check,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Building,
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
  workplaceType: 'On-site' | 'Hybrid' | 'Remote'
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
}

interface CareersSettings {
  heroBadge?: string
  heroTitle?: string
  heroSubtitle?: string
  adminNotificationEmails?: string
  autoReplyEnabled?: boolean
  acceptGeneralApplications?: boolean
  generalApplicationPrompt?: string
}

interface JobOpeningsClientProps {
  initialJobs: JobOpening[]
  initialSettings?: CareersSettings
}

export default function JobOpeningsClient({
  initialJobs,
  initialSettings,
}: JobOpeningsClientProps) {
  const [jobs] = useState<JobOpening[]>(initialJobs || [])
  const [settings] = useState<CareersSettings>(initialSettings || {})

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDept, setSelectedDept] = useState<string>('All')
  const [selectedWorkplace, setSelectedWorkplace] = useState<string>('All')

  // Modal states
  const [activeJobDetail, setActiveJobDetail] = useState<JobOpening | null>(null)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [applyRole, setApplyRole] = useState<{ id: string; title: string }>({
    id: '',
    title: '',
  })

  // Share feedback state
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    currentLocation: '',
    linkedinUrl: '',
    portfolioUrl: '',
    yearsOfExperience: '',
    currentCompany: '',
    currentRole: '',
    noticePeriod: '15 Days',
    expectedSalary: '',
    coverLetter: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isParsingResume, setIsParsingResume] = useState(false)
  const [parseFeedback, setParseFeedback] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<{
    referenceId: string
    candidateEmailSent: boolean
  } | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI Resume Auto-Fill parser
  const parseResumeWithAi = async (file: File) => {
    setIsParsingResume(true)
    setParseFeedback('✨ Gemini AI is analyzing your resume to pre-fill your details...')
    try {
      const data = new FormData()
      data.append('resume', file)
      const res = await fetch('/api/careers/parse-resume', {
        method: 'POST',
        body: data,
      })
      const result = await res.json()
      if (result.success && result.parsed) {
        const p = result.parsed
        setFormData((prev) => ({
          ...prev,
          applicantName: p.applicantName || prev.applicantName,
          email: p.email || prev.email,
          phone: p.phone || prev.phone,
          currentLocation: p.currentLocation || prev.currentLocation,
          linkedinUrl: p.linkedinUrl || prev.linkedinUrl,
          portfolioUrl: p.portfolioUrl || prev.portfolioUrl,
          yearsOfExperience: p.yearsOfExperience || prev.yearsOfExperience,
          currentCompany: p.currentCompany || prev.currentCompany,
          currentRole: p.currentRole || prev.currentRole,
          coverLetter: p.coverLetter || prev.coverLetter,
        }))
        setParseFeedback('🎉 Details extracted & pre-filled by AI! Please review or tweak any field below.')
      } else {
        setParseFeedback(null)
      }
    } catch (e) {
      setParseFeedback(null)
    } finally {
      setIsParsingResume(false)
    }
  }

  // Extract unique departments
  const departments = useMemo(() => {
    const set = new Set<string>()
    jobs.forEach((j) => {
      if (j.department) set.add(j.department)
    })
    return ['All', ...Array.from(set)]
  }, [jobs])

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesDept = selectedDept === 'All' || job.department === selectedDept
      const matchesWorkplace =
        selectedWorkplace === 'All' || job.workplaceType === selectedWorkplace

      const query = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.shortDescription.toLowerCase().includes(query) ||
        (job.requirements && job.requirements.some((r) => r.toLowerCase().includes(query)))

      return matchesDept && matchesWorkplace && matchesSearch
    })
  }, [jobs, selectedDept, selectedWorkplace, searchTerm])

  const openApplyModal = (job?: JobOpening) => {
    if (job) {
      setApplyRole({ id: job._id, title: job.title })
    } else {
      setApplyRole({
        id: '',
        title: 'General / Talent Network Application',
      })
    }
    setFormError(null)
    setSubmitSuccess(null)
    setIsApplyModalOpen(true)
  }

  const closeApplyModal = () => {
    setIsApplyModalOpen(false)
    if (submitSuccess) {
      // Reset form after successful submission
      setFormData({
        applicantName: '',
        email: '',
        phone: '',
        currentLocation: '',
        linkedinUrl: '',
        portfolioUrl: '',
        yearsOfExperience: '',
        currentCompany: '',
        currentRole: '',
        noticePeriod: '15 Days',
        expectedSalary: '',
        coverLetter: '',
      })
      setSelectedFile(null)
      setSubmitSuccess(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Max 20MB
      if (file.size > 20 * 1024 * 1024) {
        setFileError('File size is larger than 20MB. Please select a smaller document.')
        return
      }
      setSelectedFile(file)
      parseResumeWithAi(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setFileError(null)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.size > 20 * 1024 * 1024) {
        setFileError('File size is larger than 20MB. Please select a smaller document.')
        return
      }
      setSelectedFile(file)
      parseResumeWithAi(file)
    }
  }

  const handleShareJob = (job: JobOpening, e: React.MouseEvent) => {
    e.stopPropagation()
    const slug = job.slug?.current || job._id
    const url = `${window.location.origin}/job-openings/${slug}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      setCopiedJobId(job._id)
      setTimeout(() => setCopiedJobId(null), 2500)
    }
  }

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.applicantName.trim()) {
      setFormError('Please enter your full name.')
      return
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please provide a valid email address.')
      return
    }
    if (!formData.phone.trim()) {
      setFormError('Please provide a contact phone number.')
      return
    }

    setIsSubmitting(true)

    try {
      let fileBase64: string | null = null
      if (selectedFile) {
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(selectedFile)
        })
      }

      const payload = {
        applicantName: formData.applicantName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        currentLocation: formData.currentLocation.trim(),
        linkedinUrl: formData.linkedinUrl.trim(),
        portfolioUrl: formData.portfolioUrl.trim(),
        jobOpeningId: applyRole.id,
        jobTitle: applyRole.title,
        yearsOfExperience: formData.yearsOfExperience,
        currentCompany: formData.currentCompany.trim(),
        currentRole: formData.currentRole.trim(),
        noticePeriod: formData.noticePeriod,
        expectedSalary: formData.expectedSalary.trim(),
        coverLetter: formData.coverLetter.trim(),
        resumeBase64: fileBase64,
        resumeFileName: selectedFile?.name || null,
        resumeFileType: selectedFile?.type || null,
      }

      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit application. Please try again.')
      }

      setSubmitSuccess({
        referenceId: data.applicationId,
        candidateEmailSent: Boolean(data.candidateEmailSent),
      })
    } catch (err: any) {
      setFormError(err.message || 'Network error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAF9F6',
        color: '#1E293B',
        fontFamily: 'var(--font-inter), sans-serif',
        paddingBottom: '5rem',
      }}
    >
      {/* ── HERO BANNER (COMPACT & WIDE) ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2A0812 60%, #4A0012 100%)',
          color: '#FFFFFF',
          padding: '2.5rem 1.25rem 2.25rem 1.25rem',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(197, 168, 128, 0.25)',
        }}
      >
        <div
          style={{
            maxWidth: '1600px',
            width: '96%',
            margin: '0 auto',
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(197, 168, 128, 0.15)',
              border: '1px solid rgba(197, 168, 128, 0.4)',
              color: '#C5A880',
              padding: '0.25rem 0.8rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '1.2px',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={12} />
            <span>{settings.heroBadge || 'WE ARE HIRING TALENT'}</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(1.75rem, 3.2vw, 2.45rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '0.5rem',
              color: '#FFFFFF',
            }}
          >
            {settings.heroTitle || 'Shape the Future of Global Experiential Travel'}
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.9rem, 1.3vw, 1.02rem)',
              color: '#CBD5E1',
              maxWidth: '820px',
              margin: '0 auto 1.25rem auto',
              lineHeight: 1.5,
            }}
          >
            {settings.heroSubtitle ||
              'Join our passionate team delivering extraordinary journeys across Singapore, Southeast Asia, and worldwide. Explore open roles or submit your profile to our talent network.'}
          </p>

          {/* Compact Pillars */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.55rem',
              maxWidth: '1100px',
              margin: '0 auto',
            }}
          >
            {[
              { icon: Globe2, label: 'Singapore HQ & Global Hubs' },
              { icon: Compass, label: 'Travel Tech & Quoter Innovation' },
              { icon: Award, label: 'Merit-Driven Growth & Mentorship' },
              { icon: Users, label: 'Collaborative Customer-Obsessed Culture' },
            ].map((pillar, idx) => {
              const Icon = pillar.icon
              return (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '9999px',
                    padding: '0.35rem 0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#E2E8F0',
                  }}
                >
                  <Icon size={14} color="#F87171" />
                  <span>{pillar.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <section
        style={{
          maxWidth: '1600px',
          width: '96%',
          margin: '-1.25rem auto 2rem auto',
          padding: '0 0.5rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Search bar & workplace selector */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                flex: '1 1 320px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  color: '#64748B',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search job title, skills, keywords (e.g. Operations, Next.js, Sales)..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.95rem',
                  color: '#0F172A',
                  background: '#F8FAFC',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    padding: '4px',
                  }}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Workplace type selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>
                Workplace:
              </span>
              <div style={{ display: 'inline-flex', background: '#F1F5F9', borderRadius: '8px', padding: '3px' }}>
                {['All', 'Remote', 'Hybrid', 'On-site'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedWorkplace(type)}
                    style={{
                      border: 'none',
                      background: selectedWorkplace === type ? '#800020' : 'transparent',
                      color: selectedWorkplace === type ? '#FFFFFF' : '#475569',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Talent pool quick action */}
            <button
              onClick={() => openApplyModal()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#0F4C3A',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(15, 76, 58, 0.2)',
                whiteSpace: 'nowrap',
              }}
            >
              <Send size={15} />
              <span>Submit General Profile</span>
            </button>
          </div>

          {/* Department pills filter */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.25rem',
              scrollbarWidth: 'none',
            }}
          >
            {departments.map((dept) => {
              const isSelected = selectedDept === dept
              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '9999px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    border: isSelected ? '1px solid #800020' : '1px solid #E2E8F0',
                    background: isSelected ? '#800020' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#475569',
                  }}
                >
                  {dept}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── JOB LISTINGS CONTAINER ── */}
      <section style={{ maxWidth: '1600px', width: '96%', margin: '0 auto', padding: '0 0.5rem' }}>
        {/* Counter & status */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
            Showing{' '}
            <strong style={{ color: '#0F172A' }}>{filteredJobs.length}</strong> open{' '}
            {filteredJobs.length === 1 ? 'position' : 'positions'}
            {selectedDept !== 'All' && <span> in {selectedDept}</span>}
          </div>
          {(searchTerm || selectedDept !== 'All' || selectedWorkplace !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedDept('All')
                setSelectedWorkplace('All')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#800020',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Listings Grid */}
        {filteredJobs.length === 0 ? (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              border: '1px dashed #CBD5E1',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#FEF2F2',
                color: '#800020',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <Briefcase size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
              No Openings Found Matching Your Search
            </h3>
            <p style={{ color: '#64748B', maxWidth: '500px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
              We regularly create new opportunities across our travel tech and operations hubs. Drop your resume in our talent network and our hiring leaders will get in touch!
            </p>
            <button
              onClick={() => openApplyModal()}
              style={{
                background: '#800020',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Submit Profile to Talent Network
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredJobs.map((job) => {
              const isUrgent = job.urgent
              const isFeatured = job.featured

              return (
                <div
                  key={job._id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '1.75rem',
                    border: isFeatured ? '2px solid #C5A880' : '1px solid #E2E8F0',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <div>
                      {/* Badges */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.4rem',
                          alignItems: 'center',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <span
                          style={{
                            background: '#F1F5F9',
                            color: '#334155',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {job.department}
                        </span>

                        <span
                          style={{
                            background:
                              job.workplaceType === 'Remote'
                                ? '#ECFDF5'
                                : job.workplaceType === 'Hybrid'
                                ? '#EFF6FF'
                                : '#FFF7ED',
                            color:
                              job.workplaceType === 'Remote'
                                ? '#065F46'
                                : job.workplaceType === 'Hybrid'
                                ? '#1E40AF'
                                : '#9A3412',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: '6px',
                          }}
                        >
                          {job.workplaceType}
                        </span>

                        <span
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            color: '#475569',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          {job.employmentType}
                        </span>

                        {isUrgent && (
                          <span
                            style={{
                              background: '#FEF2F2',
                              color: '#991B1B',
                              border: '1px solid #FCA5A5',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            ⚡ URGENT HIRING
                          </span>
                        )}

                        {isFeatured && (
                          <span
                            style={{
                              background: '#FEF3C7',
                              color: '#92400E',
                              border: '1px solid #FCD34D',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            ⭐ FEATURED
                          </span>
                        )}
                      </div>

                      {/* Job Title */}
                      <h2
                        style={{
                          fontSize: '1.35rem',
                          fontWeight: 700,
                          color: '#0F172A',
                          margin: 0,
                          fontFamily: 'var(--font-inter), sans-serif',
                        }}
                      >
                        {job.title}
                      </h2>
                    </div>

                    {/* Quick actions (Share & Details) */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={(e) => handleShareJob(job, e)}
                        style={{
                          background: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          color: copiedJobId === job._id ? '#059669' : '#475569',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.15s',
                        }}
                        title="Copy job opening link"
                      >
                        {copiedJobId === job._id ? <Check size={14} /> : <Share2 size={14} />}
                        <span>{copiedJobId === job._id ? 'Link Copied!' : 'Share'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Meta pill row */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      color: '#64748B',
                      marginBottom: '0.9rem',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={15} color="#800020" />
                      <strong>{job.location}</strong>
                    </span>

                    {job.salaryRange && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <DollarSign size={15} color="#059669" />
                        <span>{job.salaryRange}</span>
                      </span>
                    )}

                    {job.experienceLevel && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={15} />
                        <span>{job.experienceLevel}</span>
                      </span>
                    )}
                  </div>

                  {/* Short Description */}
                  <p
                    style={{
                      fontSize: '0.92rem',
                      color: '#334155',
                      lineHeight: 1.6,
                      marginBottom: '1.25rem',
                    }}
                  >
                    {job.shortDescription}
                  </p>

                  {/* Highlights / Responsibilities snippet */}
                  {job.responsibilities && job.responsibilities.length > 0 && (
                    <div
                      style={{
                        background: '#F8FAFC',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        marginBottom: '1.25rem',
                        border: '1px solid #EDF2F7',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '0.4rem',
                        }}
                      >
                        Key Highlights
                      </div>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: '1.2rem',
                          fontSize: '0.85rem',
                          color: '#475569',
                          lineHeight: 1.5,
                        }}
                      >
                        {job.responsibilities.slice(0, 2).map((resp, i) => (
                          <li key={i}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bottom Action Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #F1F5F9',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setActiveJobDetail(job)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#800020',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0',
                        }}
                      >
                        <span>Quick View</span>
                        <ChevronRight size={15} />
                      </button>

                      <Link
                        href={`/job-openings/${job.slug?.current || job._id}`}
                        style={{
                          color: '#334155',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: '#F1F5F9',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          transition: 'all 0.15s',
                        }}
                      >
                        <ExternalLink size={13} color="#64748B" />
                        <span>Dedicated Page & Share</span>
                      </Link>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openApplyModal(job)}
                        style={{
                          background: '#800020',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '0.65rem 1.4rem',
                          borderRadius: '8px',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 3px 8px rgba(128, 0, 32, 0.25)',
                          transition: 'background 0.15s',
                        }}
                      >
                        <Send size={14} />
                        <span>Apply For This Role</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── TALENT NETWORK BANNER ── */}
        <div
          style={{
            marginTop: '3.5rem',
            background: 'linear-gradient(135deg, #0F4C3A 0%, #062B21 100%)',
            color: '#FFFFFF',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            boxShadow: '0 12px 30px rgba(15, 76, 58, 0.2)',
          }}
        >
          <div style={{ maxWidth: '750px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '0.3rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '1px',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}
            >
              <Sparkles size={13} />
              <span>SPONTANEOUS APPLICATION</span>
            </div>
            <h3
              style={{
                fontSize: '1.65rem',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: '0 0 0.6rem 0',
                fontFamily: 'var(--font-playfair), Georgia, serif',
              }}
            >
              Don&apos;t See the Exact Role You&apos;re Looking For?
            </h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#D1FAE5', lineHeight: 1.6 }}>
              {settings.generalApplicationPrompt ||
                "We are constantly expanding our Singapore operations, tour technology, and sales footprint. Submit your CV and LinkedIn profile to our talent pool — we review all profiles for future openings."}
            </p>
          </div>

          <button
            onClick={() => openApplyModal()}
            className="btn-talent-network"
            style={{
              background: '#FFFFFF',
              color: '#064E3B',
              border: 'none',
              padding: '0.9rem 1.8rem',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#064E3B', fontWeight: 800 }}>Join Our Talent Network</span>
            <ArrowRight size={17} color="#064E3B" style={{ color: '#064E3B', stroke: '#064E3B' }} />
          </button>
        </div>
      </section>

      {/* ── JOB DETAILS MODAL / DRAWER ── */}
      {activeJobDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
          onClick={() => setActiveJobDetail(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: '750px',
              maxHeight: '90vh',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.5rem 1.75rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                background: '#F8FAFC',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <span
                    style={{
                      background: '#800020',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {activeJobDetail.department}
                  </span>
                  <span
                    style={{
                      background: '#E2E8F0',
                      color: '#334155',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {activeJobDetail.workplaceType}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    margin: 0,
                  }}
                >
                  {activeJobDetail.title}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.85rem',
                    color: '#64748B',
                    marginTop: '0.35rem',
                  }}
                >
                  <span>📍 {activeJobDetail.location}</span>
                  {activeJobDetail.salaryRange && <span>💰 {activeJobDetail.salaryRange}</span>}
                  {activeJobDetail.employmentType && <span>⏱️ {activeJobDetail.employmentType}</span>}
                </div>
              </div>

              <button
                onClick={() => setActiveJobDetail(null)}
                style={{
                  background: '#EDF2F7',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: '1.75rem',
                overflowY: 'auto',
                fontSize: '0.92rem',
                color: '#334155',
                lineHeight: 1.65,
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
                  About the Role
                </h4>
                <p style={{ margin: 0 }}>{activeJobDetail.shortDescription}</p>
              </div>

              {activeJobDetail.responsibilities && activeJobDetail.responsibilities.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                    What You&apos;ll Do (Key Responsibilities)
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.3rem' }}>
                    {activeJobDetail.responsibilities.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '0.4rem' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeJobDetail.requirements && activeJobDetail.requirements.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                    What We&apos;re Looking For (Qualifications)
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.3rem' }}>
                    {activeJobDetail.requirements.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '0.4rem' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeJobDetail.benefits && activeJobDetail.benefits.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                    What We Offer (Perks & Benefits)
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.3rem' }}>
                    {activeJobDetail.benefits.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '0.4rem' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '1.25rem 1.75rem',
                borderTop: '1px solid #E2E8F0',
                background: '#F8FAFC',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <button
                onClick={() => setActiveJobDetail(null)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  const job = activeJobDetail
                  setActiveJobDetail(null)
                  openApplyModal(job)
                }}
                style={{
                  background: '#800020',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.65rem 1.6rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Send size={15} />
                <span>Apply for this Role</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── APPLICATION DRAWER / MODAL ── */}
      {isApplyModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={closeApplyModal}
        >
          <div
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '92vh',
              borderRadius: '20px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.5rem 1.75rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                background: 'linear-gradient(135deg, #800020 0%, #4A0012 100%)',
                color: '#FFFFFF',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 700,
                    color: '#F1D4DB',
                  }}
                >
                  Candidate Application
                </span>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    margin: '0.25rem 0 0 0',
                    color: '#FFFFFF',
                  }}
                >
                  {applyRole.title}
                </h3>
              </div>

              <button
                onClick={closeApplyModal}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.75rem', overflowY: 'auto' }}>
              {submitSuccess ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#ECFDF5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem auto',
                    }}
                  >
                    <CheckCircle2 size={36} />
                  </div>
                  <h3
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Application Successfully Submitted!
                  </h3>
                  <p
                    style={{
                      color: '#475569',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      maxWidth: '480px',
                      margin: '0 auto 1.5rem auto',
                    }}
                  >
                    Thank you for applying for <strong>{applyRole.title}</strong>. We have logged your profile under Reference ID:
                  </p>
                  <div
                    style={{
                      display: 'inline-block',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '0.6rem 1.25rem',
                      fontWeight: 700,
                      color: '#800020',
                      letterSpacing: '1px',
                      fontSize: '1.1rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    {submitSuccess.referenceId.slice(-8).toUpperCase()}
                  </div>

                  {submitSuccess.candidateEmailSent && (
                    <div
                      style={{
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        fontSize: '0.88rem',
                        color: '#1E40AF',
                        maxWidth: '480px',
                        margin: '0 auto 1.5rem auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        textAlign: 'left',
                      }}
                    >
                      <CheckCircle2 size={18} color="#2563EB" style={{ flexShrink: 0 }} />
                      <span>
                        An auto-acknowledgement email with next steps has been dispatched to{' '}
                        <strong>{formData.email}</strong>.
                      </span>
                    </div>
                  )}

                  <button
                    onClick={closeApplyModal}
                    style={{
                      background: '#800020',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.75rem 2rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitApplication} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {formError && (
                    <div
                      style={{
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#991B1B',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <AlertCircle size={18} style={{ flexShrink: 0 }} />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Name, Email, Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                        Full Name <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.applicantName}
                        onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                        placeholder="e.g. Rachel Lim"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                        Email Address <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. rachel@example.com"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                        Phone / WhatsApp <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+65 9123 4567 or +91 98765 43210"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                        Current City & Country
                      </label>
                      <input
                        type="text"
                        value={formData.currentLocation}
                        onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                        placeholder="e.g. Singapore, Bangalore, Kuala Lumpur"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>
                  </div>

                  {/* LinkedIn & Portfolio */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                        <LinkedinIcon size={15} color="#0A66C2" />
                        <span>LinkedIn Profile URL</span>
                      </label>
                      <input
                        type="url"
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                        placeholder="https://www.linkedin.com/in/yourprofile"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                        Portfolio / Website / GitHub URL
                      </label>
                      <input
                        type="url"
                        value={formData.portfolioUrl}
                        onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                        placeholder="https://yourportfolio.com"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>
                  </div>

                  {/* Resume Upload Box (PDF or Any Format) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Upload Resume / Profile Document (PDF, DOCX, DOC, Images, or Any Format)
                    </label>

                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed #CBD5E1',
                        borderRadius: '12px',
                        padding: '1.5rem 1rem',
                        textAlign: 'center',
                        background: '#F8FAFC',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept="*/*"
                      />

                      {selectedFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                          <FileText size={24} color="#800020" />
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>
                              {selectedFile.name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (selectedFile) parseResumeWithAi(selectedFile)
                              }}
                              disabled={isParsingResume}
                              style={{
                                background: '#FEF3C7',
                                border: '1px solid #FCD34D',
                                borderRadius: '6px',
                                padding: '3px 8px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                color: '#92400E',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                              title="Re-run AI parser"
                            >
                              <Sparkles size={12} />
                              <span>{isParsingResume ? 'Parsing...' : 'AI Auto-Fill'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedFile(null)
                                setParseFeedback(null)
                              }}
                              style={{
                                background: '#F1F5F9',
                                border: 'none',
                                borderRadius: '50%',
                                width: '26px',
                                height: '26px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#64748B',
                              }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <UploadCloud size={32} color="#64748B" style={{ margin: '0 auto 0.5rem auto' }} />
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                            Click to browse or drag and drop your resume file
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                            Supports PDF, Word (.docx), RTF, TXT, or scanned images up to 20MB
                          </div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', background: '#FEF3C7', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.74rem', fontWeight: 700, color: '#92400E' }}>
                            <Sparkles size={12} />
                            <span>Gemini AI automatically pre-fills your form details</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {isParsingResume && (
                      <div
                        style={{
                          background: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#1E40AF',
                          borderRadius: '8px',
                          padding: '0.6rem 0.85rem',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          marginTop: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                        }}
                      >
                        <Sparkles size={15} style={{ animation: 'spin 1.5s linear infinite' }} />
                        <span>Gemini AI is analyzing your resume to pre-fill your application fields...</span>
                      </div>
                    )}
                    {parseFeedback && !isParsingResume && (
                      <div
                        style={{
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#065F46',
                          borderRadius: '8px',
                          padding: '0.6rem 0.85rem',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          marginTop: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                        }}
                      >
                        <CheckCircle2 size={16} color="#059669" />
                        <span>{parseFeedback}</span>
                      </div>
                    )}
                    {fileError && (
                      <div style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '0.35rem' }}>
                        {fileError}
                      </div>
                    )}
                  </div>

                  {/* Experience, Employer & Notice */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                        Total Experience
                      </label>
                      <input
                        type="text"
                        value={formData.yearsOfExperience}
                        onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                        placeholder="e.g. 3.5 Years"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                        Notice Period
                      </label>
                      <select
                        value={formData.noticePeriod}
                        onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.9rem',
                          background: '#FFFFFF',
                        }}
                      >
                        <option value="Immediate">Immediate / Ready to join</option>
                        <option value="15 Days">15 Days</option>
                        <option value="1 Month">1 Month</option>
                        <option value="2 Months">2 Months</option>
                        <option value="3 Months">3 Months</option>
                        <option value="Negotiable">Negotiable</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                        Expected Salary
                      </label>
                      <input
                        type="text"
                        value={formData.expectedSalary}
                        onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                        placeholder="e.g. SGD 4,500 / month"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>
                  </div>

                  {/* Pitch / Cover Note */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Why are you excited about Flying Wonders? (Short Note / Elevator Pitch)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.coverLetter}
                      onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                      placeholder="Share a brief overview of your background, achievements, and why this role resonates with you..."
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #E2E8F0',
                    }}
                  >
                    <button
                      type="button"
                      onClick={closeApplyModal}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        color: '#475569',
                        padding: '0.65rem 1.25rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        background: '#800020',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '0.75rem 1.8rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: isSubmitting ? 0.7 : 1,
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          <span>Submit Profile</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
