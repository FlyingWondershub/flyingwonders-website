import { type SchemaTypeDefinition } from 'sanity'

import { packageSchema } from './packageType'
import { reviewSchema } from './reviewType'
import { recognitionSchema } from './recognitionType'
import { experienceSchema } from './experienceType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [packageSchema, reviewSchema, recognitionSchema, experienceSchema],
}
