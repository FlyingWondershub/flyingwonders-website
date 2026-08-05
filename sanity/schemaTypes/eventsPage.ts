import { defineField, defineType } from 'sanity'

export const eventsPageSchema = defineType({
  name: 'eventsPage',
  title: 'Trade Shows & B2B Events Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      initialValue: 'Driving Global Travel Connections: Flying Wonders on the Road',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      initialValue: 'Meet our executive DMC team at leading international travel trade shows, B2B conventions, and industry expos across Singapore, India, and Southeast Asia.',
    }),

    // PAGE HIDE TOGGLES
    defineField({
      name: 'hidePage',
      title: '🙈 Hide Entire Events Page',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hideHero',
      title: '🙈 Hide Hero Section',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hideUpcomingEvents',
      title: '🙈 Hide Upcoming Events Section',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hidePastHighlights',
      title: '🙈 Hide Past Event Highlights & Media Recaps Section',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hideLeadMagnet',
      title: '🙈 Hide Knowledge Hub & Benchmark Report Download Section',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hideFooterCTA',
      title: '🙈 Hide Footer B2B Contact Banner',
      type: 'boolean',
      initialValue: false,
    }),

    // EVENTS ARRAY
    defineField({
      name: 'events',
      title: 'Trade Shows & Expo Events List',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Event Record',
          fields: [
            defineField({
              name: 'title',
              title: 'Event Name / Expo Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'status',
              title: 'Event Status',
              type: 'string',
              options: {
                list: [
                  { title: 'Upcoming Event (Show Booking Button)', value: 'upcoming' },
                  { title: 'Past Event (Show Highlights & Recaps)', value: 'past' },
                ],
                layout: 'radio',
              },
              initialValue: 'upcoming',
            }),
            defineField({
              name: 'startDate',
              title: 'Event Start Date',
              type: 'date',
            }),
            defineField({
              name: 'endDate',
              title: 'Event End Date',
              type: 'date',
            }),
            defineField({
              name: 'city',
              title: 'City & Country',
              type: 'string',
              placeholder: 'e.g. Bengaluru, India | Singapore',
            }),
            defineField({
              name: 'venue',
              title: 'Venue Name',
              type: 'string',
              placeholder: 'e.g. BIEC Convention Center | Marina Bay Sands Expo',
            }),
            defineField({
              name: 'boothNumber',
              title: 'Booth / Stand / Table Number',
              type: 'string',
              placeholder: 'e.g. Hall 3, Stand B-142',
            }),
            defineField({
              name: 'summary',
              title: 'Brief Focus Description / Summary',
              type: 'text',
            }),
            defineField({
              name: 'meetingBookingUrl',
              title: '15-Min Meeting Booking URL (Calendly or Custom Link)',
              type: 'url',
            }),
            defineField({
              name: 'logo',
              title: 'Event / Expo Logo',
              type: 'image',
              options: { hotspot: true },
            }),
            defineField({
              name: 'coverImage',
              title: 'Event Cover Photo',
              type: 'image',
              options: { hotspot: true },
            }),
            defineField({
              name: 'videoUrl',
              title: 'Highlight Video Embed URL (YouTube / Vimeo / MP4 Link)',
              type: 'url',
            }),
            defineField({
              name: 'gallery',
              title: 'Photo Gallery (Recap Photos)',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }],
            }),
            defineField({
              name: 'takeaways',
              title: 'Key Industry Takeaways / Highlights Bullet Points',
              type: 'array',
              of: [{ type: 'string' }],
            }),
            // DOWNLOADABLE FILES & COLLATERAL
            defineField({
              name: 'downloadableFiles',
              title: 'Downloadable Collateral & Minutes',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'title',
                      title: 'File Title',
                      type: 'string',
                      placeholder: 'e.g. TAAI 2026 Meeting Minutes & B2B Tariff',
                    }),
                    defineField({
                      name: 'category',
                      title: 'File Category',
                      type: 'string',
                      options: {
                        list: [
                          { title: 'Meeting Minutes', value: 'minutes' },
                          { title: 'Key Highlights', value: 'highlights' },
                          { title: 'Industry Insights', value: 'insights' },
                          { title: 'B2B Tariff Rate Card', value: 'tariff' },
                          { title: 'Presentation Deck', value: 'presentation' },
                        ],
                      },
                    }),
                    defineField({
                      name: 'file',
                      title: 'Upload Document File (PDF / DOCX / PPTX)',
                      type: 'file',
                    }),
                    defineField({
                      name: 'externalUrl',
                      title: 'External Download URL (Alternative)',
                      type: 'url',
                    }),
                  ],
                },
              ],
            }),
            // AT THE BOOTH TEAM MEMBERS
            defineField({
              name: 'teamMembers',
              title: 'Attending DMC Team Members',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'name', title: 'Member Name', type: 'string' }),
                    defineField({ name: 'role', title: 'Designation / Role', type: 'string' }),
                    defineField({ name: 'photo', title: 'Profile Photo', type: 'image', options: { hotspot: true } }),
                    defineField({ name: 'phone', title: 'WhatsApp Contact', type: 'string' }),
                  ],
                },
              ],
            }),
            defineField({
              name: 'hideEvent',
              title: '🙈 Hide This Event',
              type: 'boolean',
              initialValue: false,
            }),
          ],
        },
      ],
    }),
  ],
})
