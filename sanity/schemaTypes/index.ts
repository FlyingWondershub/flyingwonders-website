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
    adminUserSchema
  ],
}
