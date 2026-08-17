import { defineField, defineType } from 'sanity'

export const studyInSingaporeSettingsSchema = defineType({
  name: 'studyInSingaporeSettings',
  title: 'Study - Singapore Page Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'pageTitle',
      title: 'Page Title (SEO)',
      type: 'string',
      initialValue: 'Study in Singapore for Indian Students | Flying Wonders',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      initialValue: 'Study in Singapore for Indian Students: Unlock Success in the Education Hub',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'brochureUrl',
      title: 'Brochure PDF URL or File',
      type: 'string',
      description: 'e.g. /brochure/Singapore.pdf or direct path',
    }),
    defineField({
      name: 'statsList',
      title: 'Key Statistics',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', title: 'Value (e.g. 25+, S$10k-S$20k)', type: 'string' },
            { name: 'label', title: 'Label (e.g. Institutions, Annual fees)', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'whyStudyTitle',
      title: 'Why Study Section Title',
      type: 'string',
      initialValue: 'Why Study in Singapore?',
    }),
    defineField({
      name: 'whyStudyPoints',
      title: 'Why Study Points',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'description', title: 'Description', type: 'text' },
          ],
        },
      ],
    }),
    defineField({
      name: 'costTuitionTitle',
      title: 'Tuition Cost Section Title',
      type: 'string',
      initialValue: 'Tuition Fees (Average per annum)',
    }),
    defineField({
      name: 'costTuitionList',
      title: 'Tuition Cost List',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'level', title: 'Degree Level (e.g., Bachelor’s)', type: 'string' },
            { name: 'range', title: 'Fee Range (e.g., SGD 7,000 – 30,000)', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'costLivingTitle',
      title: 'Living Cost Section Title',
      type: 'string',
      initialValue: 'Living Expenses (Average per annum)',
    }),
    defineField({
      name: 'costLivingValue',
      title: 'Living Cost Value',
      type: 'string',
      initialValue: 'Approx. SGD 18,000',
    }),
    defineField({
      name: 'costAccommodationTitle',
      title: 'Accommodation Section Title',
      type: 'string',
      initialValue: 'Accommodation (Average per month)',
    }),
    defineField({
      name: 'costAccommodationList',
      title: 'Accommodation Costs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'type', title: 'Type (e.g., On-Campus)', type: 'string' },
            { name: 'range', title: 'Price Range (e.g., SGD 750 – 2,000)', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'scholarshipTitle',
      title: 'Scholarship Section Title',
      type: 'string',
      initialValue: 'Scholarships in Singapore',
    }),
    defineField({
      name: 'scholarshipDescription',
      title: 'Scholarship Description',
      type: 'text',
    }),
    defineField({
      name: 'scholarshipImage',
      title: 'Scholarship Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'documentsTitle',
      title: 'Documents Section Title',
      type: 'string',
      initialValue: 'Documents required to study in Singapore',
    }),
    defineField({
      name: 'documentsList',
      title: 'Required Documents List',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'visaTitle',
      title: 'Visa Process Section Title',
      type: 'string',
      initialValue: 'Singapore study visa process',
    }),
    defineField({
      name: 'visaStepsList',
      title: 'Visa Steps List',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
})
