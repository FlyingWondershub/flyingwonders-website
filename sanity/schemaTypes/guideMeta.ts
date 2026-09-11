import { defineField, defineType } from 'sanity'
import { LiveGuideNameInput } from '../components/LiveGuideNameInput'

export const guideMetaSchema = defineType({
  name: 'guideMeta',
  title: 'Guide Service Details',
  type: 'document',
  icon: () => '👤',
  description: 'Upload credentials, photos, and descriptions for tour guide configurations.',
  fields: [
    defineField({
      name: 'name',
      title: 'Guide Option (Transfer Description)',
      type: 'string',
      description: 'Select dynamically from the live Google Sheet Guide catalog or type manually.',
      components: {
        input: LiveGuideNameInput,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'photo',
      title: 'Guide Badge / Service Photo',
      type: 'image',
      description: 'Photo of the licensed guide, emblem, or service avatar (recommended: 600×600px square or 800×600px landscape).',
      options: { hotspot: true }
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      description: '1-2 sentences used in PDF timeline rows. e.g. "Singapore Tourism Board (STB) certified professional tour guide providing live commentary and heritage stories."'
    }),
    defineField({
      name: 'longDescription',
      title: 'Full Description & Guide Scope',
      type: 'text',
      rows: 4,
      description: 'Comprehensive overview of guide commentary, languages, priority admission assistance, and sightseeing coordination.'
    }),
    defineField({
      name: 'duration',
      title: 'Standard Service Duration',
      type: 'string',
      description: 'e.g. "Up to 4 Hours (Half Day)" or "Up to 8 Hours (Full Day)"'
    }),
    defineField({
      name: 'languages',
      title: 'Available Languages',
      type: 'array',
      description: 'e.g. "English", "Hindi", "Mandarin", "Tamil", "Spanish"',
      of: [{ type: 'string' }],
      options: { layout: 'tags' }
    }),
    defineField({
      name: 'certifications',
      title: 'Badges & Certifications',
      type: 'array',
      description: 'e.g. "STB Licensed Tour Guide", "First-Aid Certified", "Heritage Specialist"',
      of: [{ type: 'string' }],
      options: { layout: 'tags' }
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'duration',
      media: 'photo'
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Untitled Guide Option',
        subtitle: subtitle || 'Guide Service',
        media
      }
    }
  }
})
