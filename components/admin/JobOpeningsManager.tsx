'use client'

import React, { useState, useEffect } from 'react'
import {
  Briefcase,
  Users,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  Star,
  Trash2,
  Edit,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  RefreshCw,
  X,
  ChevronDown,
  Save,
  MessageSquare,
  Sparkles,
  Calendar,
  Check,
  LayoutGrid,
  List,
  Send,
  ArrowRight,
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

export default function JobOpeningsManager() {
  const [activeTab, setActiveTab] = useState<'applications' | 'jobs' | 'settings'>('applications')

  // Loading & feedback
  const [loading, setLoading] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // ── APPLICATIONS STATE ──
  const [applications, setApplications] = useState<any[]>([])
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [appSearch, setAppSearch] = useState('')
  const [appStatusFilter, setAppStatusFilter] = useState('all')
  const [appViewMode, setAppViewMode] = useState<'table' | 'kanban'>('table')
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [editRating, setEditRating] = useState(0)
  const [isUpdatingApp, setIsUpdatingApp] = useState(false)

  // Status Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailTargetApp, setEmailTargetApp] = useState<any | null>(null)
  const [emailTemplateType, setEmailTemplateType] = useState<'interview' | 'shortlist' | 'offer' | 'regret'>('interview')
  const [emailSubject, setEmailSubject] = useState('')
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewFormat, setInterviewFormat] = useState('Google Meet (Video Conference)')
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/')
  const [offerRole, setOfferRole] = useState('')
  const [remuneration, setRemuneration] = useState('')
  const [startDate, setStartDate] = useState('')
  const [emailCustomMessage, setEmailCustomMessage] = useState('')
  const [isSendingStatusEmail, setIsSendingStatusEmail] = useState(false)

  // ── JOBS STATE ──
  const [jobs, setJobs] = useState<any[]>([])
  const [jobStats, setJobStats] = useState({ total: 0, active: 0, draft: 0, closed: 0 })
  const [isJobModalOpen, setIsJobModalOpen] = useState(false)
  const [editingJobId, setEditingJobId] = useState<string | null>(null)
  const [jobForm, setJobForm] = useState({
    title: '',
    department: 'Operations & Tour Logistics',
    location: 'Singapore (HQ) / Hybrid',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-level',
    salaryRange: '',
    shortDescription: '',
    responsibilitiesText: '',
    requirementsText: '',
    benefitsText: '',
    status: 'active',
    featured: false,
    urgent: false,
    order: 0,
  })

  // ── SETTINGS STATE ──
  const [settings, setSettings] = useState<any>({
    heroBadge: 'WE ARE HIRING TALENT',
    heroTitle: 'Shape the Future of Global Experiential Travel',
    heroSubtitle:
      'Join our passionate team delivering extraordinary journeys across Singapore, Southeast Asia, and worldwide.',
    adminNotificationEmails: 'contact@flyingwonders.net, info.flyingwonders@gmail.com',
    autoReplyEnabled: true,
    acknowledgementEmailSubject: 'Application Received: {{jobTitle}} at Flying Wonders',
    acknowledgementCustomMessage:
      'Thank you for taking the time to share your background with us. Our hiring and operations leadership reviews all submissions carefully. If your skills match our current focus, our team will reach out within 48 to 72 hours for an exploratory conversation.',
    acceptGeneralApplications: true,
    generalApplicationPrompt:
      "Don't see your specific role? Join our Talent Network and we'll reach out when matching opportunities arise.",
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Fetch initial data
  useEffect(() => {
    fetchApplications()
    fetchJobs()
    fetchSettings()
  }, [])

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg)
      setTimeout(() => setActionError(null), 4000)
    } else {
      setActionSuccess(msg)
      setTimeout(() => setActionSuccess(null), 4000)
    }
  }

  // ── FETCH APIS ──
  const fetchApplications = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/careers/applications?cb=${Date.now()}`)
      const data = await res.json()
      if (data.success) {
        setApplications(data.applications || [])
        setStatusCounts(data.statusCounts || {})
      }
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const res = await fetch(`/api/careers/jobs?scope=admin&cb=${Date.now()}`)
      const data = await res.json()
      if (data.success) {
        setJobs(data.jobs || [])
        setJobStats(data.stats || { total: 0, active: 0, draft: 0, closed: 0 })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/careers/settings?cb=${Date.now()}`)
      const data = await res.json()
      if (data.success && data.settings) {
        setSettings(data.settings)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // ── APPLICATION ACTIONS ──
  const openAppDetails = (app: any) => {
    setSelectedApp(app)
    setEditNotes(app.internalNotes || '')
    setEditRating(app.rating || 0)
  }

  const handleUpdateAppStatus = async (appId: string, newStatus: string) => {
    try {
      setIsUpdatingApp(true)
      const res = await fetch('/api/careers/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        showNotification(`Application status marked as ${newStatus.toUpperCase()}`)
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp({ ...selectedApp, status: newStatus })
        }
        fetchApplications()
      } else {
        showNotification(data.error || 'Failed to update status', true)
      }
    } catch (e: any) {
      showNotification(e.message, true)
    } finally {
      setIsUpdatingApp(false)
    }
  }

  const handleSaveAppNotes = async () => {
    if (!selectedApp) return
    try {
      setIsUpdatingApp(true)
      const res = await fetch('/api/careers/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedApp._id,
          internalNotes: editNotes,
          rating: editRating,
        }),
      })
      const data = await res.json()
      if (data.success) {
        showNotification('Candidate review notes and rating saved!')
        setSelectedApp({ ...selectedApp, internalNotes: editNotes, rating: editRating })
        fetchApplications()
      } else {
        showNotification(data.error || 'Failed to save notes', true)
      }
    } catch (e: any) {
      showNotification(e.message, true)
    } finally {
      setIsUpdatingApp(false)
    }
  }

  const openEmailModal = (app: any, type: 'interview' | 'shortlist' | 'offer' | 'regret') => {
    setEmailTargetApp(app)
    setEmailTemplateType(type)
    if (type === 'interview') {
      setEmailSubject(`Invitation to Interview: ${app.jobTitle} at Flying Wonders`)
      setInterviewDate('')
      setInterviewFormat('Google Meet (Video Conference)')
      setMeetingLink('https://meet.google.com/')
      setEmailCustomMessage('We are eager to learn more about your operational background and discuss how you can contribute to our upcoming travel season.')
    } else if (type === 'shortlist') {
      setEmailSubject(`Application Update: Shortlisted for ${app.jobTitle} - Flying Wonders`)
      setEmailCustomMessage('Your profile has been advanced to our hiring committee review. We will contact you shortly with the schedule for the next discussion.')
    } else if (type === 'offer') {
      setEmailSubject(`Employment Offer: ${app.jobTitle} at Flying Wonders`)
      setOfferRole(app.jobTitle)
      setRemuneration(app.expectedSalary || 'Competitive remuneration package')
      setStartDate('To be confirmed')
      setEmailCustomMessage('We are thrilled to offer you this role and look forward to welcoming you to the Flying Wonders team.')
    } else if (type === 'regret') {
      setEmailSubject(`Update regarding your application for ${app.jobTitle} - Flying Wonders`)
      setEmailCustomMessage('While we have decided to proceed with other candidates at this time, we have retained your resume in our talent network for future roles.')
    }
    setIsEmailModalOpen(true)
  }

  const handleSendStatusEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailTargetApp) return
    setIsSendingStatusEmail(true)
    try {
      const res = await fetch('/api/careers/send-status-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: emailTargetApp._id,
          candidateEmail: emailTargetApp.email,
          candidateName: emailTargetApp.applicantName,
          jobTitle: emailTargetApp.jobTitle,
          templateType: emailTemplateType,
          subject: emailSubject,
          interviewDate,
          interviewFormat,
          meetingLinkOrLocation: meetingLink,
          proposedRole: offerRole,
          remuneration,
          startDate,
          customMessage: emailCustomMessage,
        }),
      })
      const data = await res.json()
      if (data.success) {
        showNotification(`Email sent to ${emailTargetApp.email} and status updated to ${data.newStatus?.toUpperCase()}!`)
        setIsEmailModalOpen(false)
        if (selectedApp && selectedApp._id === emailTargetApp._id) {
          setSelectedApp((prev: any) => ({ ...prev, status: data.newStatus }))
        }
        fetchApplications()
      } else {
        showNotification(data.error || 'Failed to dispatch email', true)
      }
    } catch (err: any) {
      showNotification(err.message, true)
    } finally {
      setIsSendingStatusEmail(false)
    }
  }

  const handleDeleteApplication = async (appId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this candidate application?')) {
      return
    }
    try {
      const res = await fetch(`/api/careers/applications?id=${appId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showNotification('Application deleted successfully')
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp(null)
        }
        fetchApplications()
      } else {
        showNotification(data.error || 'Failed to delete application', true)
      }
    } catch (e: any) {
      showNotification(e.message, true)
    }
  }

  // ── JOB ACTIONS ──
  const openNewJobModal = () => {
    setEditingJobId(null)
    setJobForm({
      title: '',
      department: 'Operations & Tour Logistics',
      location: 'Singapore (HQ) / Hybrid',
      workplaceType: 'Hybrid',
      employmentType: 'Full-time',
      experienceLevel: 'Mid-level',
      salaryRange: '',
      shortDescription: '',
      responsibilitiesText: '',
      requirementsText: '',
      benefitsText: '',
      status: 'active',
      featured: false,
      urgent: false,
      order: 0,
    })
    setIsJobModalOpen(true)
  }

  const openEditJobModal = (job: any) => {
    setEditingJobId(job._id)
    setJobForm({
      title: job.title || '',
      department: job.department || 'Operations & Tour Logistics',
      location: job.location || '',
      workplaceType: job.workplaceType || 'Hybrid',
      employmentType: job.employmentType || 'Full-time',
      experienceLevel: job.experienceLevel || 'Mid-level',
      salaryRange: job.salaryRange || '',
      shortDescription: job.shortDescription || '',
      responsibilitiesText: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : '',
      requirementsText: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
      benefitsText: Array.isArray(job.benefits) ? job.benefits.join('\n') : '',
      status: job.status || 'active',
      featured: Boolean(job.featured),
      urgent: Boolean(job.urgent),
      order: job.order || 0,
    })
    setIsJobModalOpen(true)
  }

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobForm.title || !jobForm.shortDescription) {
      showNotification('Title and Short Description are required', true)
      return
    }

    const payload = {
      id: editingJobId,
      title: jobForm.title,
      department: jobForm.department,
      location: jobForm.location,
      workplaceType: jobForm.workplaceType,
      employmentType: jobForm.employmentType,
      experienceLevel: jobForm.experienceLevel,
      salaryRange: jobForm.salaryRange,
      shortDescription: jobForm.shortDescription,
      responsibilities: jobForm.responsibilitiesText.split('\n').map((s) => s.trim()).filter(Boolean),
      requirements: jobForm.requirementsText.split('\n').map((s) => s.trim()).filter(Boolean),
      benefits: jobForm.benefitsText.split('\n').map((s) => s.trim()).filter(Boolean),
      status: jobForm.status,
      featured: jobForm.featured,
      urgent: jobForm.urgent,
      order: Number(jobForm.order) || 0,
    }

    try {
      const url = '/api/careers/jobs'
      const method = editingJobId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        showNotification(editingJobId ? 'Job opening updated!' : 'Job opening published!')
        setIsJobModalOpen(false)
        fetchJobs()
      } else {
        showNotification(data.error || 'Failed to save job opening', true)
      }
    } catch (e: any) {
      showNotification(e.message, true)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to remove this job opening?')) {
      return
    }
    try {
      const res = await fetch(`/api/careers/jobs?id=${jobId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showNotification('Job opening removed')
        fetchJobs()
      } else {
        showNotification(data.error || 'Failed to remove job', true)
      }
    } catch (e: any) {
      showNotification(e.message, true)
    }
  }

  const handleToggleJobStatus = async (job: any) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active'
    try {
      const res = await fetch('/api/careers/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: job._id, status: nextStatus }),
      })
      const data = await res.json()
      if (data.success) {
        showNotification(`Job marked as ${nextStatus.toUpperCase()}`)
        fetchJobs()
      }
    } catch (e: any) {
      showNotification(e.message, true)
    }
  }

  // ── SETTINGS ACTIONS ──
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSavingSettings(true)
      const res = await fetch('/api/careers/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (data.success) {
        showNotification('Careers & Auto-Acknowledgement settings saved!')
      } else {
        showNotification(data.error || 'Failed to save settings', true)
      }
    } catch (e: any) {
      showNotification(e.message, true)
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Filtered applications
  const filteredApplications = applications.filter((app) => {
    const matchesStatus =
      appStatusFilter === 'all' ||
      (appStatusFilter === 'new' && (!app.status || app.status === 'new')) ||
      app.status === appStatusFilter

    const q = appSearch.toLowerCase().trim()
    const matchesSearch =
      !q ||
      app.applicantName?.toLowerCase().includes(q) ||
      app.email?.toLowerCase().includes(q) ||
      app.phone?.toLowerCase().includes(q) ||
      app.jobTitle?.toLowerCase().includes(q) ||
      app.currentCompany?.toLowerCase().includes(q)

    return matchesStatus && matchesSearch
  })

  return (
    <div style={{ fontFamily: 'var(--font-inter), sans-serif', color: '#1E293B' }}>
      {/* ── TOP NOTIFICATION BANNER ── */}
      {actionSuccess && (
        <div
          style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#991B1B',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {/* ── SUB-TABS NAVIGATION ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '0.85rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('applications')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              transition: 'all 0.15s',
              background: activeTab === 'applications' ? '#800020' : '#F1F5F9',
              color: activeTab === 'applications' ? '#FFFFFF' : '#475569',
            }}
          >
            <Users size={16} />
            <span>Applications & Responses</span>
            <span
              style={{
                background: activeTab === 'applications' ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                color: activeTab === 'applications' ? '#FFFFFF' : '#0F172A',
                padding: '2px 7px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              {applications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              transition: 'all 0.15s',
              background: activeTab === 'jobs' ? '#800020' : '#F1F5F9',
              color: activeTab === 'jobs' ? '#FFFFFF' : '#475569',
            }}
          >
            <Briefcase size={16} />
            <span>Job Openings ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              transition: 'all 0.15s',
              background: activeTab === 'settings' ? '#800020' : '#F1F5F9',
              color: activeTab === 'settings' ? '#FFFFFF' : '#475569',
            }}
          >
            <Settings size={16} />
            <span>Settings & Auto-Email</span>
          </button>
        </div>

        {/* Global Action buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a
            href="/job-openings"
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#334155',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <span>Preview Public Page</span>
            <ExternalLink size={13} />
          </a>

          {activeTab === 'applications' && (
            <a
              href="/api/careers/export"
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 0.95rem',
                borderRadius: '8px',
                background: '#059669',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(5,150,105,0.2)',
              }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </a>
          )}

          {activeTab === 'jobs' && (
            <button
              onClick={openNewJobModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: '#800020',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={15} />
              <span>Create Job Opening</span>
            </button>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: APPLICATIONS & RESPONSES MONITOR */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'applications' && (
        <div>
          {/* Status Pipeline Filter Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
              marginBottom: '1rem',
              scrollbarWidth: 'none',
            }}
          >
            {[
              { id: 'all', label: 'All Candidates', count: statusCounts.all || 0 },
              { id: 'new', label: '🆕 New', count: statusCounts.new || 0 },
              { id: 'reviewing', label: '👀 Reviewing', count: statusCounts.reviewing || 0 },
              { id: 'shortlisted', label: '⭐ Shortlisted', count: statusCounts.shortlisted || 0 },
              { id: 'interview_scheduled', label: '📅 Interview', count: statusCounts.interview_scheduled || 0 },
              { id: 'offered', label: '🎉 Offered', count: statusCounts.offered || 0 },
              { id: 'rejected', label: '❌ Rejected', count: statusCounts.rejected || 0 },
              { id: 'archived', label: '📦 Archived', count: statusCounts.archived || 0 },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setAppStatusFilter(st.id)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  border: appStatusFilter === st.id ? '1px solid #800020' : '1px solid #E2E8F0',
                  background: appStatusFilter === st.id ? '#FEF2F2' : '#FFFFFF',
                  color: appStatusFilter === st.id ? '#800020' : '#475569',
                  fontWeight: appStatusFilter === st.id ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{st.label}</span>
                <span
                  style={{
                    background: appStatusFilter === st.id ? '#800020' : '#F1F5F9',
                    color: appStatusFilter === st.id ? '#FFFFFF' : '#64748B',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search bar & View Mode Switcher */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input
                type="text"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Search by candidate name, email, phone, role, company..."
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.6rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                  background: '#FFFFFF',
                }}
              />
            </div>

            {/* View Mode Toggle */}
            <div
              style={{
                display: 'inline-flex',
                background: '#F1F5F9',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
              }}
            >
              <button
                type="button"
                onClick={() => setAppViewMode('table')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: appViewMode === 'table' ? '#FFFFFF' : 'transparent',
                  color: appViewMode === 'table' ? '#800020' : '#64748B',
                  boxShadow: appViewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <List size={14} />
                <span>Table View</span>
              </button>
              <button
                type="button"
                onClick={() => setAppViewMode('kanban')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: appViewMode === 'kanban' ? '#FFFFFF' : 'transparent',
                  color: appViewMode === 'kanban' ? '#800020' : '#64748B',
                  boxShadow: appViewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <LayoutGrid size={14} />
                <span>Kanban Pipeline</span>
              </button>
            </div>
          </div>

          {/* Applications View (Table or Kanban) */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
              <div>Loading applications...</div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
              <Users size={32} color="#94A3B8" style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontWeight: 700, color: '#334155', fontSize: '1rem' }}>No candidate applications found</div>
              <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>
                Applications submitted via the public careers page or talent network will appear here in real-time.
              </div>
            </div>
          ) : appViewMode === 'kanban' ? (
            /* ── KANBAN PIPELINE VIEW ── */
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                paddingBottom: '1rem',
                alignItems: 'flex-start',
              }}
            >
              {[
                { id: 'new', label: '🆕 New Applicants', color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE' },
                { id: 'reviewing', label: '👀 Under Review', color: '#92400E', bg: '#FEF3C7', border: '#FCD34D' },
                { id: 'shortlisted', label: '⭐ Shortlisted', color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0' },
                { id: 'interview_scheduled', label: '📅 Interviewing', color: '#6B21A8', bg: '#F3E8FF', border: '#D8B4FE' },
                { id: 'offered', label: '🎉 Job Offered', color: '#15803D', bg: '#DCFCE7', border: '#86EFAC' },
                { id: 'rejected', label: '❌ Rejected / Archived', color: '#991B1B', bg: '#FEE2E2', border: '#FCA5A5' },
              ].map((col) => {
                const colApps = filteredApplications.filter((app) => {
                  const s = app.status || 'new'
                  if (col.id === 'rejected') {
                    return s === 'rejected' || s === 'archived'
                  }
                  return s === col.id
                })

                return (
                  <div
                    key={col.id}
                    style={{
                      flex: '0 0 290px',
                      width: '290px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Column Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        background: col.bg,
                        border: `1px solid ${col.border}`,
                        borderRadius: '10px 10px 0 0',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        color: col.color,
                      }}
                    >
                      <span>{col.label}</span>
                      <span
                        style={{
                          background: col.color,
                          color: '#FFFFFF',
                          padding: '1px 7px',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                        }}
                      >
                        {colApps.length}
                      </span>
                    </div>

                    {/* Column Cards Container */}
                    <div
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderTop: 'none',
                        borderRadius: '0 0 10px 10px',
                        padding: '0.6rem',
                        minHeight: '480px',
                        maxHeight: 'calc(80vh - 180px)',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                      }}
                    >
                      {colApps.length === 0 ? (
                        <div
                          style={{
                            textAlign: 'center',
                            padding: '2rem 1rem',
                            color: '#94A3B8',
                            fontSize: '0.78rem',
                            fontStyle: 'italic',
                          }}
                        >
                          No candidates in this stage
                        </div>
                      ) : (
                        colApps.map((app) => (
                          <div
                            key={app._id}
                            style={{
                              background: '#FFFFFF',
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                              padding: '0.75rem',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.45rem',
                            }}
                          >
                            {/* Card Top: Name + Rating */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <button
                                onClick={() => openAppDetails(app)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  fontWeight: 700,
                                  color: '#0F172A',
                                  fontSize: '0.88rem',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                }}
                              >
                                {app.applicantName}
                              </button>
                              {app.rating > 0 && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', color: '#D97706', fontWeight: 700 }}>
                                  <Star size={11} fill="#F59E0B" color="#F59E0B" />
                                  <span>{app.rating}</span>
                                </span>
                              )}
                            </div>

                            {/* Role Badge */}
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#800020' }}>
                              {app.jobTitle}
                            </div>

                            {/* Candidate Info Snippet */}
                            <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {app.yearsOfExperience && <div>Exp: <strong>{app.yearsOfExperience}</strong></div>}
                              {app.currentCompany && <div>At: <strong>{app.currentCompany}</strong></div>}
                              {app.expectedSalary && <div style={{ color: '#059669', fontWeight: 600 }}>Exp. Pay: {app.expectedSalary}</div>}
                            </div>

                            {/* Quick Links (Resume, LinkedIn, WhatsApp) */}
                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                              {app.resumeUrl && (
                                <a
                                  href={app.resumeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    background: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    color: '#800020',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                  }}
                                >
                                  <FileText size={10} />
                                  <span>Resume</span>
                                </a>
                              )}
                              {app.linkedinUrl && (
                                <a
                                  href={app.linkedinUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    background: '#EFF6FF',
                                    border: '1px solid #BFDBFE',
                                    color: '#0A66C2',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                  }}
                                >
                                  <LinkedinIcon size={10} />
                                  <span>Profile</span>
                                </a>
                              )}
                              {app.phone && (
                                <a
                                  href={`https://wa.me/${app.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    background: '#DCFCE7',
                                    border: '1px solid #86EFAC',
                                    color: '#15803D',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                  }}
                                  title="WhatsApp Quick Reply"
                                >
                                  <MessageSquare size={10} />
                                  <span>WA</span>
                                </a>
                              )}
                            </div>

                            {/* Card Actions & Stage Changer */}
                            <div
                              style={{
                                borderTop: '1px solid #F1F5F9',
                                paddingTop: '0.45rem',
                                marginTop: '0.2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.35rem',
                              }}
                            >
                              <div style={{ display: 'flex', gap: '0.3rem' }}>
                                <button
                                  type="button"
                                  onClick={() => openAppDetails(app)}
                                  style={{
                                    flex: 1,
                                    background: '#F1F5F9',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '4px',
                                    padding: '3px 6px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    color: '#0F172A',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '3px',
                                  }}
                                >
                                  <Eye size={11} />
                                  <span>Review</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEmailModal(app, 'interview')}
                                  style={{
                                    background: '#FAF5FF',
                                    border: '1px solid #D8B4FE',
                                    borderRadius: '4px',
                                    padding: '3px 6px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    color: '#6B21A8',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                  }}
                                  title="Send Email"
                                >
                                  <Mail size={11} />
                                  <span>Email</span>
                                </button>
                              </div>

                              {/* Stage Select Dropdown */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>Stage:</span>
                                <select
                                  value={app.status || 'new'}
                                  onChange={(e) => handleUpdateAppStatus(app._id, e.target.value)}
                                  style={{
                                    flex: 1,
                                    padding: '2px 4px',
                                    borderRadius: '4px',
                                    border: '1px solid #CBD5E1',
                                    fontSize: '0.7rem',
                                    background: '#FFFFFF',
                                    color: '#334155',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <option value="new">🆕 New</option>
                                  <option value="reviewing">👀 Reviewing</option>
                                  <option value="shortlisted">⭐ Shortlisted</option>
                                  <option value="interview_scheduled">📅 Interview</option>
                                  <option value="offered">🎉 Offered</option>
                                  <option value="rejected">❌ Rejected</option>
                                  <option value="archived">📦 Archived</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* ── TABLE VIEW ── */
            <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Candidate</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Applied Role</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Pipeline Status</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Profile & Resume</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Experience</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Notice / Salary</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Applied At</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => {
                    const st = app.status || 'new'
                    const statusColors: Record<string, { bg: string; text: string; border: string }> = {
                      new: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
                      reviewing: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
                      shortlisted: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
                      interview_scheduled: { bg: '#F3E8FF', text: '#6B21A8', border: '#D8B4FE' },
                      offered: { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
                      rejected: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
                      archived: { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' },
                    }
                    const badge = statusColors[st] || statusColors.new

                    const dateStr = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'

                    return (
                      <tr key={app._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        {/* Candidate */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                            {app.applicantName}
                          </div>
                          <div style={{ color: '#64748B', fontSize: '0.78rem' }}>{app.email}</div>
                          <div style={{ color: '#64748B', fontSize: '0.78rem' }}>{app.phone}</div>
                        </td>

                        {/* Applied Role */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                          <span style={{ fontWeight: 600, color: '#1E293B' }}>{app.jobTitle}</span>
                          {app.currentLocation && (
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>📍 {app.currentLocation}</div>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              background: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`,
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            {st.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Profile & Resume links */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {app.resumeUrl ? (
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  background: '#FEF2F2',
                                  border: '1px solid #FECACA',
                                  color: '#800020',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                }}
                              >
                                <FileText size={12} />
                                <span>Resume</span>
                              </a>
                            ) : (
                              <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>No file</span>
                            )}

                            {app.linkedinUrl && (
                              <a
                                href={app.linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  background: '#EFF6FF',
                                  border: '1px solid #BFDBFE',
                                  color: '#0A66C2',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                }}
                              >
                                <LinkedinIcon size={12} />
                                <span>Profile</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Experience */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 600 }}>{app.yearsOfExperience || 'N/A'}</div>
                          {app.currentCompany && (
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{app.currentCompany}</div>
                          )}
                        </td>

                        {/* Notice & Salary */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                          <div style={{ fontSize: '0.8rem' }}>{app.noticePeriod || 'N/A'}</div>
                          {app.expectedSalary && (
                            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                              {app.expectedSalary}
                            </div>
                          )}
                        </td>

                        {/* Date */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', color: '#64748B', whiteSpace: 'nowrap' }}>
                          {dateStr}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => openAppDetails(app)}
                              style={{
                                background: '#F1F5F9',
                                border: '1px solid #CBD5E1',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                color: '#0F172A',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                              title="Review Candidate"
                            >
                              <Eye size={13} />
                              <span>Review</span>
                            </button>

                            <button
                              onClick={() => handleDeleteApplication(app._id)}
                              style={{
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                color: '#991B1B',
                              }}
                              title="Delete Application"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Candidate Dossier Review Modal */}
          {selectedApp && (
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
              onClick={() => setSelectedApp(null)}
            >
              <div
                style={{
                  background: '#FFFFFF',
                  width: '100%',
                  maxWidth: '720px',
                  maxHeight: '92vh',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    background: '#0F172A',
                    color: '#FFFFFF',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94A3B8', fontWeight: 700 }}>
                      Candidate Dossier
                    </span>
                    <h3 style={{ margin: '0.2rem 0', fontSize: '1.3rem', fontWeight: 700 }}>
                      {selectedApp.applicantName}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>Role: {selectedApp.jobTitle}</div>
                  </div>
                  <button
                    onClick={() => setSelectedApp(null)}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Status Pipeline Buttons */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Update Application Pipeline Status
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {[
                        { id: 'new', label: '🆕 New' },
                        { id: 'reviewing', label: '👀 Reviewing' },
                        { id: 'shortlisted', label: '⭐ Shortlisted' },
                        { id: 'interview_scheduled', label: '📅 Interview Scheduled' },
                        { id: 'offered', label: '🎉 Offered' },
                        { id: 'rejected', label: '❌ Rejected' },
                        { id: 'archived', label: '📦 Archived' },
                      ].map((item) => {
                        const isCurrent = (selectedApp.status || 'new') === item.id
                        return (
                          <button
                            key={item.id}
                            disabled={isUpdatingApp}
                            onClick={() => handleUpdateAppStatus(selectedApp._id, item.id)}
                            style={{
                              padding: '0.4rem 0.75rem',
                              borderRadius: '6px',
                              border: isCurrent ? '2px solid #800020' : '1px solid #CBD5E1',
                              background: isCurrent ? '#800020' : '#F8FAFC',
                              color: isCurrent ? '#FFFFFF' : '#334155',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            {item.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 1-Click Status Email Dispatch */}
                  <div
                    style={{
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '10px',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={15} color="#15803D" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Candidate Communication (1-Click Status Email)
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 600 }}>SES / Brevo / SMTP</span>
                    </div>
                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: '#166534', lineHeight: 1.4 }}>
                      Send pre-formatted branded updates directly to <strong>{selectedApp.email}</strong>. Automatically updates pipeline status & records audit history.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                      <button
                        type="button"
                        onClick={() => openEmailModal(selectedApp, 'interview')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid #D8B4FE',
                          background: '#FAF5FF',
                          color: '#6B21A8',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Calendar size={13} />
                        <span>Schedule Interview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEmailModal(selectedApp, 'shortlist')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid #A7F3D0',
                          background: '#ECFDF5',
                          color: '#065F46',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Star size={13} />
                        <span>Send Shortlist Notice</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEmailModal(selectedApp, 'offer')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid #86EFAC',
                          background: '#DCFCE7',
                          color: '#15803D',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Send Job Offer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEmailModal(selectedApp, 'regret')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid #FECACA',
                          background: '#FEF2F2',
                          color: '#991B1B',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={13} />
                        <span>Send Regret / Archive</span>
                      </button>
                    </div>
                  </div>

                  {/* Contact & Links Bar */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', padding: '1rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <a
                      href={`mailto:${selectedApp.email}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#0F172A',
                        textDecoration: 'none',
                      }}
                    >
                      <Mail size={14} color="#800020" />
                      <span>{selectedApp.email}</span>
                    </a>

                    <a
                      href={`tel:${selectedApp.phone}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#0F172A',
                        textDecoration: 'none',
                      }}
                    >
                      <Phone size={14} color="#059669" />
                      <span>{selectedApp.phone}</span>
                    </a>

                    {selectedApp.phone && (
                      <a
                        href={`https://wa.me/${selectedApp.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#25D366',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          padding: '0.4rem 0.8rem',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        <MessageSquare size={14} />
                        <span>WhatsApp Chat</span>
                      </a>
                    )}

                    {selectedApp.linkedinUrl && (
                      <a
                        href={selectedApp.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#0A66C2',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          padding: '0.4rem 0.8rem',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        <LinkedinIcon size={14} />
                        <span>LinkedIn Profile</span>
                      </a>
                    )}

                    {selectedApp.resumeUrl && (
                      <a
                        href={selectedApp.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#800020',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          padding: '0.4rem 0.8rem',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        <FileText size={14} />
                        <span>Download Resume ({selectedApp.resumeOriginalName || 'File'})</span>
                      </a>
                    )}
                  </div>

                  {/* Overview details grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#64748B' }}>Current Location:</span>{' '}
                      <strong>{selectedApp.currentLocation || 'Not specified'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Experience:</span>{' '}
                      <strong>{selectedApp.yearsOfExperience || 'Not specified'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Current Role:</span>{' '}
                      <strong>{selectedApp.currentRole || selectedApp.currentCompany || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Notice Period:</span>{' '}
                      <strong>{selectedApp.noticePeriod || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Expected Remuneration:</span>{' '}
                      <strong style={{ color: '#059669' }}>{selectedApp.expectedSalary || 'Negotiable'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Acknowledgement Mail:</span>{' '}
                      <strong>{selectedApp.acknowledgementSent ? '✅ Sent' : '⚠️ Pending'}</strong>
                    </div>
                  </div>

                  {/* Cover Pitch */}
                  {selectedApp.coverLetter && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Candidate Pitch / Note
                      </label>
                      <div
                        style={{
                          background: '#F8FAFC',
                          borderRadius: '8px',
                          padding: '0.85rem 1rem',
                          fontSize: '0.88rem',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          color: '#334155',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        {selectedApp.coverLetter}
                      </div>
                    </div>
                  )}

                  {/* Internal Notes & Star Rating */}
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>
                        Internal Interview Notes & Team Score
                      </label>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={18}
                            onClick={() => setEditRating(s)}
                            style={{
                              cursor: 'pointer',
                              fill: s <= editRating ? '#F59E0B' : 'none',
                              color: s <= editRating ? '#F59E0B' : '#CBD5E1',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add private evaluation notes, interview questions feedback, salary discussions..."
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '6px',
                        border: '1px solid #FCD34D',
                        fontSize: '0.85rem',
                        background: '#FFFFFF',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button
                        onClick={handleSaveAppNotes}
                        disabled={isUpdatingApp}
                        style={{
                          background: '#800020',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '0.45rem 1rem',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Save size={13} />
                        <span>Save Notes & Score</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '1rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setSelectedApp(null)}
                    style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#475569', padding: '0.5rem 1.25rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: JOB OPENINGS & LISTINGS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'jobs' && (
        <div>
          {/* Stats Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {[
              { label: 'Total Postings', val: jobStats.total, bg: '#F8FAFC', text: '#0F172A' },
              { label: '🟢 Active Openings', val: jobStats.active, bg: '#ECFDF5', text: '#065F46' },
              { label: '🟡 Drafts (Hidden)', val: jobStats.draft, bg: '#FEF3C7', text: '#92400E' },
              { label: '🔴 Closed / Filled', val: jobStats.closed, bg: '#FEF2F2', text: '#991B1B' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: stat.bg,
                  borderRadius: '10px',
                  padding: '1rem',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>{stat.label}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.text, marginTop: '0.2rem' }}>
                  {stat.val}
                </div>
              </div>
            ))}
          </div>

          {/* Jobs List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {jobs.map((job) => {
              const isActive = job.status === 'active'

              return (
                <div
                  key={job._id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: '1 1 360px' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span
                        style={{
                          background: isActive ? '#ECFDF5' : '#F1F5F9',
                          color: isActive ? '#065F46' : '#64748B',
                          border: `1px solid ${isActive ? '#A7F3D0' : '#CBD5E1'}`,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {job.status}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                        {job.department} • {job.location} ({job.workplaceType})
                      </span>
                      {job.urgent && (
                        <span style={{ background: '#FEF2F2', color: '#991B1B', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                          ⚡ Urgent
                        </span>
                      )}
                    </div>

                    <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                      {job.title}
                    </h4>

                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                      {job.shortDescription}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={() => handleToggleJobStatus(job)}
                      style={{
                        background: isActive ? '#FEF3C7' : '#ECFDF5',
                        color: isActive ? '#92400E' : '#065F46',
                        border: `1px solid ${isActive ? '#FCD34D' : '#A7F3D0'}`,
                        padding: '0.45rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isActive ? 'Pause / Close' : 'Activate'}
                    </button>

                    <button
                      onClick={() => openEditJobModal(job)}
                      style={{
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        color: '#0F172A',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Edit size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      style={{
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#991B1B',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                      title="Delete job"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Job Create / Edit Modal */}
          {isJobModalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(4px)',
                zIndex: 1300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.25rem',
              }}
              onClick={() => setIsJobModalOpen(false)}
            >
              <div
                style={{
                  background: '#FFFFFF',
                  width: '100%',
                  maxWidth: '720px',
                  maxHeight: '92vh',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ padding: '1.25rem 1.5rem', background: '#800020', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                    {editingJobId ? 'Edit Job Opening' : 'Create New Job Opening'}
                  </h3>
                  <button
                    onClick={() => setIsJobModalOpen(false)}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSaveJob} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                      Job Title <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      placeholder="e.g. Senior Tour Operations Executive"
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                        Department
                      </label>
                      <select
                        value={jobForm.department}
                        onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', background: '#FFF' }}
                      >
                        <option value="Operations & Tour Logistics">Operations & Tour Logistics</option>
                        <option value="Sales & Business Development">Sales & Business Development</option>
                        <option value="Software Engineering & Tech">Software Engineering & Tech</option>
                        <option value="Ticketing & Attractions Operations">Ticketing & Attractions Operations</option>
                        <option value="Marketing, Content & SEO">Marketing, Content & SEO</option>
                        <option value="Customer Experience & Concierge">Customer Experience & Concierge</option>
                        <option value="Finance, Accounts & Compliance">Finance, Accounts & Compliance</option>
                        <option value="Human Resources & Talent">Human Resources & Talent</option>
                        <option value="Corporate & MICE Travel">Corporate & MICE Travel</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                        Location
                      </label>
                      <input
                        type="text"
                        required
                        value={jobForm.location}
                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                        placeholder="e.g. Singapore (HQ), Bangalore, or Remote"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                        Workplace Type
                      </label>
                      <select
                        value={jobForm.workplaceType}
                        onChange={(e) => setJobForm({ ...jobForm, workplaceType: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', background: '#FFF' }}
                      >
                        <option value="Hybrid">Hybrid</option>
                        <option value="Remote">Remote</option>
                        <option value="On-site">On-site</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                        Employment Type
                      </label>
                      <select
                        value={jobForm.employmentType}
                        onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', background: '#FFF' }}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                        Salary Range
                      </label>
                      <input
                        type="text"
                        value={jobForm.salaryRange}
                        onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                        placeholder="e.g. SGD 3,800 - 5,000 / mo"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                      Short Summary (Displayed on cards) <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={jobForm.shortDescription}
                      onChange={(e) => setJobForm({ ...jobForm, shortDescription: e.target.value })}
                      placeholder="Concise 2-3 sentence overview of this position..."
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                      Key Responsibilities (One item per line)
                    </label>
                    <textarea
                      rows={3}
                      value={jobForm.responsibilitiesText}
                      onChange={(e) => setJobForm({ ...jobForm, responsibilitiesText: e.target.value })}
                      placeholder="Execute daily tour itineraries...&#10;Liaise with fleet transport partners...&#10;Coordinate attraction bundles..."
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                      Requirements & Skills (One item per line)
                    </label>
                    <textarea
                      rows={3}
                      value={jobForm.requirementsText}
                      onChange={(e) => setJobForm({ ...jobForm, requirementsText: e.target.value })}
                      placeholder="2+ years experience in Singapore tourism...&#10;Fluent English communication...&#10;Customer-focused mindset..."
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={jobForm.urgent}
                        onChange={(e) => setJobForm({ ...jobForm, urgent: e.target.checked })}
                      />
                      <span>Urgent Hiring Badge</span>
                    </label>

                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={jobForm.featured}
                        onChange={(e) => setJobForm({ ...jobForm, featured: e.target.checked })}
                      />
                      <span>Featured Highlight</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsJobModalOpen(false)}
                      style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#475569', padding: '0.5rem 1.25rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ background: '#800020', color: '#FFFFFF', border: 'none', padding: '0.55rem 1.6rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
                    >
                      {editingJobId ? 'Save Changes' : 'Publish Job Opening'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: CAREERS & AUTO-EMAIL SETTINGS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} style={{ maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Notification Emails */}
          <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
              Internal Admin Alert Notifications
            </h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748B' }}>
              Comma-separated email addresses that immediately receive candidate details, resume links, and LinkedIn shortcuts when someone submits an application.
            </p>
            <input
              type="text"
              value={settings.adminNotificationEmails || ''}
              onChange={(e) => setSettings({ ...settings, adminNotificationEmails: e.target.value })}
              placeholder="contact@flyingwonders.net, info.flyingwonders@gmail.com"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
            />
          </div>

          {/* Auto-Acknowledgement Mail */}
          <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                  Candidate Auto-Acknowledgement Email
                </h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                  Automatically dispatch a branded confirmation email to candidates as soon as their profile is submitted.
                </p>
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', color: settings.autoReplyEnabled ? '#059669' : '#64748B' }}>
                <input
                  type="checkbox"
                  checked={settings.autoReplyEnabled !== false}
                  onChange={(e) => setSettings({ ...settings, autoReplyEnabled: e.target.checked })}
                />
                <span>{settings.autoReplyEnabled ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Email Subject Line (Tokens: <code>{'{{jobTitle}}'}</code>, <code>{'{{candidateName}}'}</code>)
                </label>
                <input
                  type="text"
                  value={settings.acknowledgementEmailSubject || ''}
                  onChange={(e) => setSettings({ ...settings, acknowledgementEmailSubject: e.target.value })}
                  placeholder="Application Received: {{jobTitle}} at Flying Wonders"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Custom Next Steps / Message Note
                </label>
                <textarea
                  rows={3}
                  value={settings.acknowledgementCustomMessage || ''}
                  onChange={(e) => setSettings({ ...settings, acknowledgementCustomMessage: e.target.value })}
                  placeholder="Thank you for sharing your background... our team will reach out within 48 to 72 hours..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>
            </div>
          </div>

          {/* Careers Page Copy */}
          <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
              Careers Page Header Content
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Hero Headline
                </label>
                <input
                  type="text"
                  value={settings.heroTitle || ''}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                  placeholder="Shape the Future of Global Experiential Travel"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Hero Subtitle
                </label>
                <textarea
                  rows={2}
                  value={settings.heroSubtitle || ''}
                  onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                  placeholder="Join our passionate team delivering extraordinary journeys..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="submit"
              disabled={isSavingSettings}
              style={{
                background: '#800020',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 3px 8px rgba(128,0,32,0.25)',
              }}
            >
              <Save size={16} />
              <span>{isSavingSettings ? 'Saving Settings...' : 'Save All Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CANDIDATE STATUS EMAIL COMPOSER MODAL (ENHANCEMENT 3) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isEmailModalOpen && emailTargetApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
          onClick={() => setIsEmailModalOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '92vh',
              borderRadius: '16px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                background: '#0F172A',
                color: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94A3B8', fontWeight: 700 }}>
                  Automated Candidate Communication
                </span>
                <h3 style={{ margin: '0.2rem 0', fontSize: '1.2rem', fontWeight: 700 }}>
                  Dispatch Status Email
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>
                  Candidate: <strong>{emailTargetApp.applicantName}</strong> &bull; {emailTargetApp.email}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendStatusEmail} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                {/* Template Selector Tabs */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Select Email Template
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                    {[
                      { type: 'interview' as const, label: '📅 Interview', activeBg: '#FAF5FF', activeColor: '#6B21A8', activeBorder: '#D8B4FE' },
                      { type: 'shortlist' as const, label: '⭐ Shortlist', activeBg: '#ECFDF5', activeColor: '#065F46', activeBorder: '#A7F3D0' },
                      { type: 'offer' as const, label: '🎉 Offer', activeBg: '#DCFCE7', activeColor: '#15803D', activeBorder: '#86EFAC' },
                      { type: 'regret' as const, label: '❌ Regret', activeBg: '#FEF2F2', activeColor: '#991B1B', activeBorder: '#FECACA' },
                    ].map((item) => {
                      const isSel = emailTemplateType === item.type
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => openEmailModal(emailTargetApp, item.type)}
                          style={{
                            padding: '0.5rem 0.4rem',
                            borderRadius: '8px',
                            border: isSel ? `2px solid ${item.activeBorder}` : '1px solid #CBD5E1',
                            background: isSel ? item.activeBg : '#F8FAFC',
                            color: isSel ? item.activeColor : '#64748B',
                            fontWeight: isSel ? 700 : 500,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Email Subject */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                      background: '#FFFFFF',
                    }}
                  />
                </div>

                {/* Conditional Fields: Interview */}
                {emailTemplateType === 'interview' && (
                  <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontWeight: 700, color: '#6B21A8', fontSize: '0.85rem' }}>
                      Interview Logistics
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4A044E', marginBottom: '0.25rem' }}>
                          Date & Time (e.g., 28 Sep 2026, 2:30 PM SGT)
                        </label>
                        <input
                          type="text"
                          required
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                          placeholder="Tomorrow at 3:00 PM SGT"
                          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #D8B4FE', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4A044E', marginBottom: '0.25rem' }}>
                          Format
                        </label>
                        <input
                          type="text"
                          value={interviewFormat}
                          onChange={(e) => setInterviewFormat(e.target.value)}
                          placeholder="Google Meet / In-person Office"
                          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #D8B4FE', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4A044E', marginBottom: '0.25rem' }}>
                        Meeting Video Link / Office Address
                      </label>
                      <input
                        type="text"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        placeholder="https://meet.google.com/xyz-abc or 100 Orchard Rd..."
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #D8B4FE', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                )}

                {/* Conditional Fields: Offer */}
                {emailTemplateType === 'offer' && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.85rem' }}>
                      Job Offer Details
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#14532D', marginBottom: '0.25rem' }}>
                          Offered Position Title
                        </label>
                        <input
                          type="text"
                          required
                          value={offerRole}
                          onChange={(e) => setOfferRole(e.target.value)}
                          placeholder="Senior Tour Director"
                          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #86EFAC', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#14532D', marginBottom: '0.25rem' }}>
                          Remuneration / Salary
                        </label>
                        <input
                          type="text"
                          required
                          value={remuneration}
                          onChange={(e) => setRemuneration(e.target.value)}
                          placeholder="SGD 5,500 - 6,800/mo + Performance Bonus"
                          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #86EFAC', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#14532D', marginBottom: '0.25rem' }}>
                        Proposed Start Date
                      </label>
                      <input
                        type="text"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="1st of next month or Immediate"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #86EFAC', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                )}

                {/* Custom Personal Note */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Personal Note / Custom Instructions to Candidate
                  </label>
                  <textarea
                    rows={4}
                    value={emailCustomMessage}
                    onChange={(e) => setEmailCustomMessage(e.target.value)}
                    placeholder="Enter any tailored remarks or next steps for the candidate..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                    }}
                  />
                </div>

                {/* Auto Pipeline Update Notice */}
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.78rem',
                    color: '#64748B',
                    lineHeight: 1.4,
                  }}
                >
                  ℹ️ <strong>Automated Workflow:</strong> Dispatching this email will immediately deliver a beautifully branded notice via AWS SES / Brevo / SMTP, update the applicant's pipeline status to <strong>{emailTemplateType === 'interview' ? 'INTERVIEW SCHEDULED' : emailTemplateType.toUpperCase()}</strong>, and append an internal audit timestamp to Sanity CMS.
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: '1rem 1.5rem',
                  background: '#F8FAFC',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingStatusEmail}
                  style={{
                    background: '#800020',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.55rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 6px rgba(128,0,32,0.25)',
                  }}
                >
                  {isSendingStatusEmail ? (
                    <>
                      <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Send Email & Update Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
