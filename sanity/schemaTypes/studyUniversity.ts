import { defineField, defineType } from 'sanity'

export const studyUniversitySchema = defineType({
  name: 'studyUniversity',
  title: 'Study - Singapore University',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'University Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'University Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'popularFor',
      title: 'Popular For',
      type: 'string',
      description: 'e.g., Petroleum Engineering, Computer Science',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'qsRanking',
      title: 'QS World Ranking',
      type: 'number',
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Official Website URL',
      type: 'url',
    }),
    defineField({
      name: 'description',
      title: 'Brief Description',
      type: 'text',
    }),
  ],
})
