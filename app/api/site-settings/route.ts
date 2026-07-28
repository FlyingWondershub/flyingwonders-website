import { NextResponse } from 'next/server'
import { client } from '../../../sanity/lib/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const siteSettings = await client.fetch(`*[_type == "siteSettings"][0]{
      notificationEmails,
      hideInstantQuote,
      hideCustomPackage,
      hideCustomPackageClientPreview,
      hideSingaporeAttractions,
      hidePackages,
      hideBrochure,
      hideReviews,
      hideBlog,
      hideContact,
      hideChatbot,
      hideFaq,
      attractionsSheetUrl,
      customPackageSheetUrl,
      iciciUpiId,
      iciciAccountName,
      iciciBankDetails,
      exchangeMarkupType,
      exchangeMarkupValue,
      manualRateOverride,
      hideIciciCustomPackage,
      hideIciciInstantQuote,
      hideIciciAttractions,
      hideIciciPackages,
      hideIciciPayDirect
    }`)

    return NextResponse.json({
      success: true,
      settings: siteSettings || {
        hideInstantQuote: true,
        hideCustomPackage: false,
        hideCustomPackageClientPreview: false,
        hideSingaporeAttractions: false,
        hidePackages: false,
        hideBrochure: false,
        hideReviews: false,
        hideBlog: false,
        hideContact: false,
        hideChatbot: false,
      }
    })
  } catch (err: any) {
    console.error('Failed to fetch site settings:', err)
    return NextResponse.json({
      success: false,
      settings: {
        hideInstantQuote: true,
        hideCustomPackage: false,
        hideCustomPackageClientPreview: false,
        hideSingaporeAttractions: false,
        hidePackages: false,
        hideBrochure: false,
        hideReviews: false,
        hideBlog: false,
        hideContact: false,
        hideChatbot: false,
      }
    })
  }
}
