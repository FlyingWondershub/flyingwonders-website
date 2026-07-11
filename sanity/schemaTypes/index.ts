import { type SchemaTypeDefinition } from 'sanity'

import { packageSchema } from './packageType'
import { reviewSchema } from './reviewType'
import { recognitionSchema } from './recognitionType'
import { experienceSchema } from './experienceType'
import { siteSettingsSchema } from './siteSettings'
import { bookingRequestSchema } from './bookingRequest'
import { contactSubmissionSchema } from './contactSubmission'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    packageSchema,
    reviewSchema,
    recognitionSchema,
    experienceSchema,
    siteSettingsSchema,
    bookingRequestSchema,
    contactSubmissionSchema
  ],
}
