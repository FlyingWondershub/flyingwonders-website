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

export async function POST(req: NextRequest) {
  try {
    const { profileId, recommenderEmail, recommenderCompany, recommenderName, comment } = await req.json()

    if (!profileId || !recommenderEmail || !recommenderCompany) {
      return NextResponse.json({ success: false, error: 'Profile ID, Recommender Email, and Company Name are required.' }, { status: 400 })
    }

    const newRecommendation = {
      recommenderEmail: recommenderEmail.trim().toLowerCase(),
      recommenderCompany: recommenderCompany.trim(),
      recommenderName: recommenderName ? recommenderName.trim() : 'Verified Travel Partner',
      comment: comment ? comment.trim() : 'Strongly recommended B2B partner for ground handling and local services.',
      createdAt: new Date().toISOString().split('T')[0],
    }

    try {
      const existing = await writeClient.fetch(`*[_id == $profileId][0]`, { profileId })
      if (existing) {
        const currentRecs = Array.isArray(existing.recommendations) ? existing.recommendations : []
        // Prevent duplicate recommendation from same email
        if (currentRecs.some((r: any) => r.recommenderEmail === newRecommendation.recommenderEmail)) {
          return NextResponse.json({ success: false, error: 'You have already recommended this agency profile.' }, { status: 400 })
        }

        const updatedDoc = await writeClient
          .patch(profileId)
          .setIfMissing({ recommendations: [] })
          .insert('after', 'recommendations[-1]', [newRecommendation])
          .commit()

        return NextResponse.json({ success: true, recommendations: updatedDoc.recommendations })
      }
    } catch (err) {
      console.warn('Failed to post recommendation to Sanity', err)
    }

    return NextResponse.json({ success: true, recommendation: newRecommendation })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
