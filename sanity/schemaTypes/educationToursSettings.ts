import { defineField, defineType } from 'sanity'

export const educationToursSettingsSchema = defineType({
  name: 'educationToursSettings',
  title: '🎓 Education Tours Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'pageTitle',
      title: 'Page Title (SEO)',
      type: 'string',
      initialValue: 'Singapore Educational Tours for Schools, Colleges & MBA | Flying Wonders',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description (SEO)',
      type: 'text',
      rows: 3,
      initialValue: 'Curated Singapore educational tours for K-12 schools, Engineering colleges, and MBA business schools with visits to Science Centre, Discovery Centre, Marina Barrage, SUTD, SMU, NTU, and NUS.',
    }),

    // ─── HERO SECTION ───
    defineField({
      name: 'heroBadge',
      title: 'Hero Badge Text',
      type: 'string',
      initialValue: 'Singapore: The World’s Safest Live Classroom • K-12, College & MBA',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Main Title',
      type: 'string',
      initialValue: 'Singapore Educational Tours & Academic Immersions',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      rows: 3,
      initialValue: 'Experiential study circuits curated for Schools (K–12), Engineering Colleges, and MBA Business Schools. Explore world-class innovation labs, sustainable engineering marvels, and top global university campuses.',
    }),

    // ─── KEY STATS ───
    defineField({
      name: 'statsList',
      title: 'Key Statistics Bar',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', title: 'Stat Value (e.g. 75+ Cohorts)', type: 'string' },
            { name: 'label', title: 'Stat Label (e.g. Facilitated since 2018)', type: 'string' },
          ],
        },
      ],
    }),

    // ─── FEATURED INSTITUTIONS ───
    defineField({
      name: 'institutions',
      title: 'Featured Institutions & Hubs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', title: 'Identifier (e.g. science-centre)', type: 'string' },
            { name: 'name', title: 'Full Institution Name', type: 'string' },
            { name: 'shortName', title: 'Short Name', type: 'string' },
            { name: 'badge', title: 'Badge Label (e.g. Interactive STEM)', type: 'string' },
            { name: 'badgeBg', title: 'Badge Color (Hex)', type: 'string' },
            { name: 'category', title: 'Category', type: 'string' },
            {
              name: 'cohorts',
              title: 'Eligible Cohorts',
              type: 'array',
              of: [{ type: 'string' }],
              options: {
                list: [
                  { title: 'School (K-12)', value: 'School' },
                  { title: 'College & Tech', value: 'College' },
                  { title: 'MBA & Business', value: 'MBA' },
                ],
              },
            },
            { name: 'location', title: 'Location in Singapore', type: 'string' },
            { name: 'imageUrl', title: 'Image URL or Upload', type: 'string' },
            { name: 'tagline', title: 'Tagline', type: 'string' },
            { name: 'description', title: 'Description', type: 'text', rows: 3 },
            {
              name: 'keyHighlights',
              title: 'Key Highlights',
              type: 'array',
              of: [{ type: 'string' }],
            },
            {
              name: 'learningOutcomes',
              title: 'Learning Outcomes',
              type: 'array',
              of: [{ type: 'string' }],
            },
          ],
        },
      ],
    }),

    // ─── LEARNING PILLARS ───
    defineField({
      name: 'learningPillars',
      title: 'Learning Pillars',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Pillar Title', type: 'string' },
            { name: 'description', title: 'Description', type: 'text', rows: 2 },
          ],
        },
      ],
    }),

    // ─── CURATED ITINERARIES ───
    defineField({
      name: 'itineraries',
      title: 'Curated Itineraries',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', title: 'Identifier (e.g. school-stem)', type: 'string' },
            { name: 'title', title: 'Circuit Title', type: 'string' },
            { name: 'targetCohort', title: 'Target Cohort', type: 'string' },
            { name: 'duration', title: 'Duration (e.g. 4 Days / 3 Nights)', type: 'string' },
            { name: 'badge', title: 'Badge (e.g. Best for K-12 Schools)', type: 'string' },
            {
              name: 'highlights',
              title: 'Highlights List',
              type: 'array',
              of: [{ type: 'string' }],
            },
            {
              name: 'days',
              title: 'Day-by-Day Schedule',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'day', title: 'Day Number (e.g. 1)', type: 'number' },
                    { name: 'title', title: 'Day Title', type: 'string' },
                    { name: 'morning', title: 'Morning Activity', type: 'text', rows: 2 },
                    { name: 'afternoon', title: 'Afternoon Activity', type: 'text', rows: 2 },
                    { name: 'evening', title: 'Evening Activity', type: 'text', rows: 2 },
                    { name: 'learningOutcome', title: 'Learning Outcome', type: 'string' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),

    // ─── ESTIMATOR PRICING DEFAULTS ───
    defineField({
      name: 'estimatorBudgetRatePerDay',
      title: 'Estimator: Youth Hostel Daily Rate (SGD)',
      type: 'number',
      initialValue: 115,
    }),
    defineField({
      name: 'estimatorStandardRatePerDay',
      title: 'Estimator: 3-Star Hotel Daily Rate (SGD)',
      type: 'number',
      initialValue: 145,
    }),
    defineField({
      name: 'estimatorPremiumRatePerDay',
      title: 'Estimator: 4-Star Hotel Daily Rate (SGD)',
      type: 'number',
      initialValue: 185,
    }),

    // ─── FAQS ───
    defineField({
      name: 'faqs',
      title: 'Education Tours FAQs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'q', title: 'Question', type: 'string' },
            { name: 'a', title: 'Answer', type: 'text', rows: 3 },
          ],
        },
      ],
    }),
  ],
})
