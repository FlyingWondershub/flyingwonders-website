import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

export const dynamic = 'force-dynamic'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) return '""'
  const str = String(value).replace(/"/g, '""')
  return `"${str}"`
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let groqQuery = `*[_type == "jobApplication"`
    if (status && status !== 'all') {
      groqQuery += ` && status == "${status}"`
    }
    groqQuery += `] | order(appliedAt desc)`

    const applications = (await writeClient.fetch(groqQuery)) || []

    const headers = [
      'Application ID',
      'Candidate Name',
      'Email Address',
      'Phone / WhatsApp',
      'Current Location',
      'Job Title',
      'Pipeline Status',
      'Star Rating',
      'Experience',
      'Current Employer',
      'Current Role',
      'Notice Period',
      'Expected Salary',
      'LinkedIn Profile',
      'Portfolio / Website',
      'Resume CDN URL',
      'Original Resume File',
      'Cover Pitch',
      'Internal Notes',
      'Applied At Date',
    ]

    const rows = applications.map((app: any) => [
      escapeCsvCell(app._id),
      escapeCsvCell(app.applicantName),
      escapeCsvCell(app.email),
      escapeCsvCell(app.phone),
      escapeCsvCell(app.currentLocation),
      escapeCsvCell(app.jobTitle),
      escapeCsvCell(app.status || 'new'),
      escapeCsvCell(app.rating || 0),
      escapeCsvCell(app.yearsOfExperience),
      escapeCsvCell(app.currentCompany),
      escapeCsvCell(app.currentRole),
      escapeCsvCell(app.noticePeriod),
      escapeCsvCell(app.expectedSalary),
      escapeCsvCell(app.linkedinUrl),
      escapeCsvCell(app.portfolioUrl),
      escapeCsvCell(app.resumeUrl),
      escapeCsvCell(app.resumeOriginalName),
      escapeCsvCell(app.coverLetter),
      escapeCsvCell(app.internalNotes),
      escapeCsvCell(app.appliedAt ? new Date(app.appliedAt).toISOString() : ''),
    ])

    const csvContent =
      '\uFEFF' + [headers.map((h) => `"${h}"`).join(','), ...rows.map((r: string[]) => r.join(','))].join('\r\n')

    const filename = `flying-wonders-candidates-${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    console.error('Job Export API Error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to export applications' },
      { status: 500 }
    )
  }
}
