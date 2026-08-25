import { NextResponse } from 'next/server'
import { client } from '../../../sanity/lib/client'

export const revalidate = 300

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
      hideInsurance,
      hideInsuranceCalculator,
      hideInsuranceComparisonTable,
      hideInsuranceClaimProcess,
      hideInsuranceFaq,
      insuranceSheetUrl,
      insurancePartnerName,
      insuranceEmergencyHelpline,
      insuranceWhatsappNumber,
      insuranceGstPercentage,
      insuranceInrToUsdRate,
      insuranceHeroTitle,
      insuranceHeroSubtitle,
      attractionsSheetUrl,
      customPackageSheetUrl,
      malaysiaPackageSheetUrl,
      iciciUpiId,
      iciciAccountName,
      iciciBankDetails,
      exchangeMarkupType,
      exchangeMarkupValue,
      manualRateOverride,
      hideReadyTemplatesSubpage,
      hideCustomPackageClientPreview,
      hidePreviewPackageOverlay,
      hideIciciCustomPackage,
      hideCashfreeCustomPackage,
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
        hideInsurance: false,
        hideInsuranceCalculator: false,
        hideInsuranceComparisonTable: false,
        hideInsuranceClaimProcess: false,
        hideInsuranceFaq: false,
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
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
        hideInsurance: false,
        hideInsuranceCalculator: false,
        hideInsuranceComparisonTable: false,
        hideInsuranceClaimProcess: false,
        hideInsuranceFaq: false,
      }
    })
  }
}
