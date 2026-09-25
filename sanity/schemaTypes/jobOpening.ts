import { defineField, defineType } from 'sanity'

export const jobOpeningSchema = defineType({
  name: 'jobOpening',
  title: 'Job Openings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Job Title / Position',
      type: 'string',
      validation: (rule) => rule.required().min(3).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'department',
      title: 'Department',
      type: 'string',
      options: {
        list: [
          { title: 'Operations & Tour Logistics', value: 'Operations & Tour Logistics' },
          { title: 'Sales & Business Development', value: 'Sales & Business Development' },
          { title: 'Software Engineering & Tech', value: 'Software Engineering & Tech' },
          { title: 'Ticketing & Attractions Operations', value: 'Ticketing & Attractions Operations' },
          { title: 'Marketing, Content & SEO', value: 'Marketing, Content & SEO' },
          { title: 'Customer Experience & Concierge', value: 'Customer Experience & Concierge' },
          { title: 'Finance, Accounts & Compliance', value: 'Finance, Accounts & Compliance' },
          { title: 'Human Resources & Talent', value: 'Human Resources & Talent' },
          { title: 'Corporate & MICE Travel', value: 'Corporate & MICE Travel' },
          { title: 'General & Management', value: 'General & Management' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Job Location',
      type: 'string',
      description: 'e.g. Singapore (HQ), Bangalore (India), Kuala Lumpur, or Worldwide',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'workplaceType',
      title: 'Workplace Type',
      type: 'string',
      options: {
        list: [
          { title: 'On-site / In Office', value: 'On-site' },
          { title: 'Hybrid (Office + Remote)', value: 'Hybrid' },
          { title: 'Fully Remote', value: 'Remote' },
        ],
      },
      initialValue: 'Hybrid',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'employmentType',
      title: 'Employment Type',
      type: 'string',
      options: {
        list: [
          { title: 'Full-time', value: 'Full-time' },
          { title: 'Part-time', value: 'Part-time' },
          { title: 'Contract', value: 'Contract' },
          { title: 'Internship', value: 'Internship' },
          { title: 'Freelance / Consultant', value: 'Freelance' },
        ],
      },
      initialValue: 'Full-time',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'experienceLevel',
      title: 'Experience Level',
      type: 'string',
      options: {
        list: [
          { title: 'Entry Level (0-2 years)', value: 'Entry-level' },
          { title: 'Mid Level (2-5 years)', value: 'Mid-level' },
          { title: 'Senior Level (5-8 years)', value: 'Senior' },
          { title: 'Lead / Principal (8+ years)', value: 'Lead' },
          { title: 'Director / Executive', value: 'Executive' },
        ],
      },
      initialValue: 'Mid-level',
    }),
    defineField({
      name: 'salaryRange',
      title: 'Salary Range / Compensation',
      type: 'string',
      description: 'e.g. SGD 3,800 - 5,200 / month, INR 6 - 9 LPA, or Competitive',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Summary / Card Pitch',
      type: 'text',
      rows: 3,
      description: 'Concise 2-3 sentence overview displayed on job listing cards and search snippets.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'responsibilities',
      title: 'Key Responsibilities',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Bullet points outlining daily duties and deliverables.',
    }),
    defineField({
      name: 'requirements',
      title: 'Qualifications & Requirements',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Core skills, certifications, and experience needed.',
    }),
    defineField({
      name: 'benefits',
      title: 'Perks & Benefits',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Health insurance, annual travel pass, flexible work, performance bonuses, etc.',
    }),
    defineField({
      name: 'status',
      title: 'Listing Status',
      type: 'string',
      options: {
        list: [
          { title: '🟢 Active (Accepting Applications)', value: 'active' },
          { title: '🟡 Draft (Hidden from Public)', value: 'draft' },
          { title: '🔴 Closed (Position Filled / Paused)', value: 'closed' },
          { title: '⚪ Archived', value: 'archived' },
        ],
      },
      initialValue: 'active',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured Opportunity',
      type: 'boolean',
      initialValue: false,
      description: 'Highlight with special badge on careers page.',
    }),
    defineField({
      name: 'urgent',
      title: 'Urgent Hiring',
      type: 'boolean',
      initialValue: false,
      description: 'Shows "Urgent Hiring" badge.',
    }),
    defineField({
      name: 'deadline',
      title: 'Application Deadline',
      type: 'date',
    }),
    defineField({
      name: 'order',
      title: 'Display Sequence Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      department: 'department',
      location: 'location',
      type: 'employmentType',
      status: 'status',
    },
    prepare({ title, department, location, type, status }) {
      const statusIcon = status === 'active' ? '🟢' : status === 'draft' ? '🟡' : '🔴'
      return {
        title: `${statusIcon} ${title}`,
        subtitle: `${department || 'General'} • ${location || 'Global'} (${type || 'Full-time'})`,
      }
    },
  },
})
