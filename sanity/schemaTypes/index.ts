import { type SchemaTypeDefinition } from 'sanity'

import { packageSchema } from './packageType'
import { reviewSchema } from './reviewType'
import { recognitionSchema } from './recognitionType'
import { experienceSchema } from './experienceType'
import { siteSettingsSchema } from './siteSettings'
import { globalContactSchema } from './globalContact'
import { legalPageSchema } from './legalPage'
import { auditLogSchema } from './auditLog'
import { bookingRequestSchema } from './bookingRequest'
import { contactSubmissionSchema } from './contactSubmission'
import { b2bAgentSchema } from './b2bAgent'
import { newsletterSubscriberSchema } from './newsletterSubscriber'
import { newsletterCampaignSchema } from './newsletterCampaign'
import { attractionsUserSchema } from './attractionsUser'
import { attractionBundleSchema } from './attractionBundle'
import { attractionMetaSchema } from './attractionMeta'
import { proposalSchema } from './proposal'
import { promotionSchema } from './promotion'
import { promotionInquirySchema } from './promotionInquiry'
import { businessCardSchema } from './businessCard'
import { manualPaymentSchema } from './manualPayment'
import { faqItemSchema } from './faqItem'

import { adminUserSchema } from './adminUser'
import { competitorPriceSchema } from './competitorPrice'
import { corporateTravelSchema } from './corporateTravel'
import { travelToolsSchema } from './travelTools'
import { eventsPageSchema } from './eventsPage'
import { readyPackageTemplateSchema } from './readyPackageTemplate'
import { b2bCatalogProfileSchema } from './b2bCatalogProfile'
import { b2bDirectorySettingsSchema } from './b2bDirectorySettings'
import { b2bServiceCatalogSettingsSchema } from './b2bServiceCatalogSettings'
import { b2bServiceMediaSchema } from './b2bServiceMedia'
import { blogPostSchema } from './blogPost'
import { b2bTravelToolCommentSchema } from './b2bTravelToolComment'
import { travelConsultantSchema } from './travelConsultant'
import { travelConsultingPackageSchema } from './travelConsultingPackage'
import { travelConsultingSettingsSchema } from './travelConsultingSettings'
import { travelConsultingBookingSchema } from './travelConsultingBooking'

import { studyUniversitySchema } from './studyUniversity'
import { studyCourseCategorySchema } from './studyCourseCategory'
import { studyInSingaporeSettingsSchema } from './studyInSingaporeSettings'
import { educationToursSettingsSchema } from './educationToursSettings'
import { karnatakaPackageSchema } from './karnatakaPackage'
import { karnatakaSettingsSchema } from './karnatakaSettings'
import { b2bLeadInquirySchema } from './b2bLeadInquiry'
import { b2bLeadsSettingsSchema } from './b2bLeadsSettings'
import { b2bLeadSubscriberSchema } from './b2bLeadSubscriber'
import { b2bLeadAuditLogSchema } from './b2bLeadAuditLog'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    packageSchema,
    reviewSchema,
    recognitionSchema,
    experienceSchema,
    siteSettingsSchema,
    globalContactSchema,
    legalPageSchema,
    auditLogSchema,
    bookingRequestSchema,
    contactSubmissionSchema,
    b2bAgentSchema,
    b2bCatalogProfileSchema,
    b2bDirectorySettingsSchema,
    b2bServiceCatalogSettingsSchema,
    b2bServiceMediaSchema,
    b2bTravelToolCommentSchema,
    travelConsultantSchema,
    travelConsultingPackageSchema,
    travelConsultingSettingsSchema,
    travelConsultingBookingSchema,
    studyUniversitySchema,
    studyCourseCategorySchema,
    studyInSingaporeSettingsSchema,
    educationToursSettingsSchema,
    karnatakaPackageSchema,
    karnatakaSettingsSchema,
    newsletterSubscriberSchema,
    newsletterCampaignSchema,
    attractionsUserSchema,
    attractionBundleSchema,
    attractionMetaSchema,
    proposalSchema,
    promotionSchema,
    promotionInquirySchema,
    businessCardSchema,
    manualPaymentSchema,
    faqItemSchema,
    adminUserSchema,
    competitorPriceSchema,
    corporateTravelSchema,
    travelToolsSchema,
    eventsPageSchema,
    readyPackageTemplateSchema,
    blogPostSchema,
    b2bLeadInquirySchema,
    b2bLeadsSettingsSchema,
    b2bLeadSubscriberSchema,
    b2bLeadAuditLogSchema
  ],
}
