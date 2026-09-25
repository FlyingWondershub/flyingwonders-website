import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

export const dynamic = 'force-dynamic'

const SANITY_WRITE_TOKEN =
  process.env.SANITY_WRITE_TOKEN ||
  process.env.SANITY_API_TOKEN ||
  'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: SANITY_WRITE_TOKEN,
  useCdn: false,
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')?.toLowerCase()
    const jobId = searchParams.get('jobId')

    let groqQuery = `*[_type == "jobApplication"`

    if (status && status !== 'all') {
      groqQuery += ` && status == "${status}"`
    }
    if (jobId && jobId !== 'all') {
      groqQuery += ` && jobOpening._ref == "${jobId}"`
    }

    groqQuery += `] | order(appliedAt desc) {
      _id,
      _createdAt,
      applicantName,
      email,
      phone,
      currentLocation,
      linkedinUrl,
      portfolioUrl,
      jobTitle,
      yearsOfExperience,
      currentCompany,
      currentRole,
      noticePeriod,
      expectedSalary,
      coverLetter,
      status,
      rating,
      internalNotes,
      interviewDate,
      appliedAt,
      resumeUrl,
      resumeOriginalName,
      resumeSize,
      resumeMimeType,
      acknowledgementSent,
      jobOpening->{ _id, title, department }
    }`

    const applications = await writeClient.fetch(groqQuery)

    // Filter by client search text if provided
    let filtered = applications || []
    if (search) {
      filtered = filtered.filter((app: any) => {
        return (
          app.applicantName?.toLowerCase().includes(search) ||
          app.email?.toLowerCase().includes(search) ||
          app.phone?.toLowerCase().includes(search) ||
          app.jobTitle?.toLowerCase().includes(search) ||
          app.currentCompany?.toLowerCase().includes(search)
        )
      })
    }

    // Pipeline status counters
    const statusCounts = {
      all: (applications || []).length,
      new: (applications || []).filter((a: any) => a.status === 'new' || !a.status).length,
      reviewing: (applications || []).filter((a: any) => a.status === 'reviewing').length,
      shortlisted: (applications || []).filter((a: any) => a.status === 'shortlisted').length,
      interview_scheduled: (applications || []).filter((a: any) => a.status === 'interview_scheduled').length,
      offered: (applications || []).filter((a: any) => a.status === 'offered').length,
      rejected: (applications || []).filter((a: any) => a.status === 'rejected').length,
      archived: (applications || []).filter((a: any) => a.status === 'archived').length,
    }

    return NextResponse.json({
      success: true,
      applications: filtered,
      statusCounts,
    })
  } catch (err: any) {
    console.error('Job Applications API GET Error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch candidate applications' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status, rating, internalNotes, interviewDate } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Application ID is required.' }, { status: 400 })
    }

    const patch = writeClient.patch(id)
    if (status) patch.set({ status })
    if (typeof rating === 'number') patch.set({ rating })
    if (internalNotes !== undefined) patch.set({ internalNotes })
    if (interviewDate !== undefined) patch.set({ interviewDate })

    const updated = await patch.commit()

    return NextResponse.json({
      success: true,
      application: updated,
      message: 'Candidate application updated successfully!',
    })
  } catch (err: any) {
    console.error('Job Applications API PATCH Error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update application' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Application ID is required.' }, { status: 400 })
    }

    await writeClient.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Application record removed successfully.',
    })
  } catch (err: any) {
    console.error('Job Applications API DELETE Error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete application' },
      { status: 500 }
    )
  }
}
