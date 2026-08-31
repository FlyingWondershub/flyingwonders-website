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

    // ─── FEATURED INSTITUTIONS & HUBS ───
    defineField({
      name: 'institutions',
      title: 'Featured Institutions & Hubs (All 7 Cards)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', title: 'Identifier (e.g. science-centre)', type: 'string' },
            { name: 'name', title: 'Full Institution Name', type: 'string' },
            { name: 'shortName', title: 'Short Name', type: 'string' },
            { name: 'globalRank', title: 'Global Rank / Accolade (e.g. #8 Global (QS World Rankings))', type: 'string' },
            { name: 'establishedYear', title: 'Established Year / History (e.g. Est. 1905 / 1977)', type: 'string' },
            { name: 'badge', title: 'Badge Label (e.g. Interactive STEM)', type: 'string' },
            { name: 'badgeBg', title: 'Badge Color (Hex e.g. #2563EB)', type: 'string' },
            { name: 'category', title: 'Category (e.g. Science & STEM, Higher Education, Defense)', type: 'string' },
            {
              name: 'cohorts',
              title: 'Eligible Student Cohorts',
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
            { name: 'image', title: 'Primary Photo Upload', type: 'image', options: { hotspot: true } },
            { name: 'imageUrl', title: 'Fallback Image URL', type: 'string' },
            
            // Rich Media: Gallery & Videos
            {
              name: 'galleryPhotos',
              title: 'Photo Gallery',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true } },
                    { name: 'photoUrl', title: 'Photo URL', type: 'string' },
                    { name: 'caption', title: 'Caption / Room Name', type: 'string' },
                  ],
                },
              ],
            },
            {
              name: 'videoUrl',
              title: 'Video / Virtual Campus Tour URL (YouTube, Vimeo, MP4)',
              type: 'string',
              description: 'e.g. https://www.youtube.com/watch?v=... or direct MP4 link',
            },

            // Downloadable Documents
            {
              name: 'brochureFile',
              title: 'Curriculum & Tour Syllabus Document (PDF / DOCX Upload)',
              type: 'file',
            },
            {
              name: 'brochureUrl',
              title: 'External Document / PDF URL',
              type: 'string',
            },

            { name: 'visitDuration', title: 'Recommended Duration (e.g. 4 Hours / Half-Day)', type: 'string' },
            { name: 'tagline', title: 'Tagline / Summary Sentence', type: 'string' },
            { name: 'description', title: 'Detailed Overview', type: 'text', rows: 3 },
            
            {
              name: 'targetDepartments',
              title: 'Target Academic Departments',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'e.g. Computer Science, AI & Robotics, Civil Engineering, Business, Biotechnology',
            },
            {
              name: 'keyHighlights',
              title: 'Key Facilities & Tour Highlights',
              type: 'array',
              of: [{ type: 'string' }],
            },
            {
              name: 'learningOutcomes',
              title: 'Academic Learning Outcomes',
              type: 'array',
              of: [{ type: 'string' }],
            },
            {
              name: 'specialWorkshops',
              title: 'Accredited Hands-on Workshops & Masterclasses',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'title', title: 'Workshop Title', type: 'string' },
                    { name: 'duration', title: 'Duration (e.g. 90 mins)', type: 'string' },
                    { name: 'focus', title: 'Focus Area & Lab Requirements', type: 'string' },
                  ],
                },
              ],
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

    // ─── CURATED ITINERARIES & CIRCUITS ───
    defineField({
      name: 'itineraries',
      title: 'Curated Study Circuits (Fully Updatable)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', title: 'Circuit Identifier (e.g. school-stem, college-tech, mba-business)', type: 'string' },
            { name: 'title', title: 'Circuit Full Title', type: 'string' },
            { name: 'targetCohort', title: 'Target Cohort (e.g. School (Grades 6–12), College & Engineering, MBA & Business)', type: 'string' },
            { name: 'duration', title: 'Duration (e.g. 4 Days / 3 Nights, 5 Days / 4 Nights)', type: 'string' },
            { name: 'badge', title: 'Badge Label (e.g. Best for K-12 Schools)', type: 'string' },
            { name: 'circuitPdfFile', title: 'Circuit Syllabus PDF Document Upload', type: 'file' },
            { name: 'circuitPdfUrl', title: 'Circuit PDF Download URL', type: 'string' },
            { name: 'estimatedPriceSgd', title: 'Estimated Base Price (SGD / student)', type: 'number' },
            {
              name: 'highlights',
              title: 'Circuit Inclusions / Highlight Badges',
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
                    { name: 'day', title: 'Day Number (1, 2, 3...)', type: 'number' },
                    { name: 'title', title: 'Day Title / Focus Theme', type: 'string' },
                    { name: 'morning', title: 'Morning Schedule & Lab Workshop', type: 'text', rows: 2 },
                    { name: 'afternoon', title: 'Afternoon Immersion & Guided Site Visit', type: 'text', rows: 2 },
                    { name: 'evening', title: 'Evening Debrief, Cultural Tour & Dinner', type: 'text', rows: 2 },
                    { name: 'learningOutcome', title: 'Core Academic Learning Outcome', type: 'string' },
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
      title: 'Education Tours FAQs (Updatable)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'q', title: 'Question', type: 'string' },
            { name: 'a', title: 'Answer', type: 'text', rows: 3 },
            { name: 'category', title: 'Category (e.g. Safety, Curriculum, Logistics, Booking)', type: 'string' },
          ],
        },
      ],
    }),

    // ─── NOTIFICATION EMAIL SETTINGS ───
    defineField({
      name: 'notificationEmails',
      title: '📧 Proposal & Inquiry Notification Recipient Emails',
      type: 'string',
      description: 'Comma-separated email addresses to receive instant proposals and inquiry alerts (e.g. tours@flyingwonders.net, info.flyingwonders@gmail.com). If left blank, defaults to the global notification email in Site Settings.',
      initialValue: 'info.flyingwonders@gmail.com',
    }),
  ],
})
