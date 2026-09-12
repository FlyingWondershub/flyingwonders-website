import { defineField, defineType } from 'sanity'

export const readyPackageTemplateSchema = defineType({
  name: 'readyPackageTemplate',
  title: 'Ready-Made Land Package Templates (B2B)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Package Title',
      type: 'string',
      placeholder: 'e.g. 3N/4D Singapore Highlights & City Essentials',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
    }),
    defineField({
      name: 'nightsCount',
      title: 'Number of Nights',
      type: 'number',
      initialValue: 3,
      validation: (Rule) => Rule.required().min(1).max(30),
      description: 'e.g. 3 nights = 4 days package',
    }),
    defineField({
      name: 'category',
      title: 'Package Category',
      type: 'string',
      options: {
        list: [
          { title: 'Popular / Best Value', value: 'popular' },
          { title: 'Family Special', value: 'family' },
          { title: 'Luxury & Private', value: 'luxury' },
          { title: 'Budget Saver', value: 'budget' },
          { title: 'MICE / Corporate', value: 'mice' },
        ],
      },
      initialValue: 'popular',
    }),
    defineField({
      name: 'badgeText',
      title: 'Badge Ribbon Text (Optional)',
      type: 'string',
      placeholder: 'e.g. BESTSELLER, FAMILY FAVORITE',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'summary',
      title: 'Highlights Summary',
      type: 'text',
      rows: 2,
      placeholder: 'Private Airport Transfers + City Tour + Gardens by the Bay + Universal Studios Singapore',
    }),
    defineField({
      name: 'startingPriceSGD',
      title: 'Estimated Starting Net Cost / Pax (SGD)',
      type: 'number',
    }),
    defineField({
      name: 'hideTemplate',
      title: '🙈 Hide This Template from B2B Portal',
      type: 'boolean',
      initialValue: false,
    }),

    // DAYWISE ITINERARY STRUCTURE (NO MEALS, NO GUIDES)
    defineField({
      name: 'itinerary',
      title: 'Daywise Itinerary (Prefilled for Agents)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'dayPlan',
          title: 'Day Plan',
          fields: [
            defineField({
              name: 'dayNumber',
              title: 'Day Number',
              type: 'number',
              initialValue: 1,
            }),
            defineField({
              name: 'dayTitle',
              title: 'Day Focus / Title',
              type: 'string',
              placeholder: 'e.g. Arrival & Changi Jewel Tour',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'dayDescription',
              title: 'Day Overview / Client Narrative (Optional)',
              type: 'text',
              rows: 2,
              placeholder: 'Arrive at Changi Airport, private transfer to hotel, leisure evening...',
            }),

            // 1. TRANSFERS ON THIS DAY
            defineField({
              name: 'transfers',
              title: 'Transfers',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'transferItem',
                  title: 'Transfer',
                  fields: [
                    defineField({
                      name: 'serviceType',
                      title: 'Transfer Type',
                      type: 'string',
                      options: {
                        list: [
                          { title: '🛬 Airport Arrival (Always Private 13-Seater)', value: 'arrival' },
                          { title: '🛫 Airport Departure (Always Private 13-Seater)', value: 'departure' },
                          { title: '🏙️ Half-Day City Tour (3 Hours)', value: 'cityTour' },
                          { title: '📍 Inter-Attraction / Point-to-Point Transfer', value: 'interAttraction' },
                        ],
                      },
                      initialValue: 'arrival',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'routeDescription',
                      title: 'Route / Details',
                      type: 'string',
                      placeholder: 'e.g. Changi Airport T3 to City Hotel',
                    }),
                    defineField({
                      name: 'time',
                      title: 'Pickup Time',
                      type: 'string',
                      initialValue: '10:00',
                    }),
                  ],
                  preview: {
                    select: {
                      serviceType: 'serviceType',
                      route: 'routeDescription',
                      time: 'time',
                    },
                    prepare({ serviceType, route, time }) {
                      const icons: Record<string, string> = {
                        arrival: '🛬',
                        departure: '🛫',
                        cityTour: '🏙️',
                        interAttraction: '📍',
                      }
                      return {
                        title: route || serviceType,
                        subtitle: `${icons[serviceType] || '🚗'} ${serviceType} @ ${time || 'TBA'}`,
                      }
                    },
                  },
                },
              ],
            }),

            // 2. ATTRACTIONS ON THIS DAY
            defineField({
              name: 'attractions',
              title: 'Prefilled Attractions & Tickets',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'attractionItem',
                  title: 'Attraction Ticket',
                  fields: [
                    defineField({
                      name: 'attractionName',
                      title: 'Attraction Name',
                      type: 'string',
                      description: 'Exact name matching Google Sheet Attractions tab',
                      placeholder: 'e.g. Universal Studios Singapore',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'time',
                      title: 'Visiting Time / Slot',
                      type: 'string',
                      initialValue: '10:00',
                    }),
                    defineField({
                      name: 'inclusionsNotes',
                      title: 'Ticket Notes / Inclusions',
                      type: 'string',
                      placeholder: 'e.g. Includes 2 Domes Admission or Tram Ride',
                    }),
                  ],
                  preview: {
                    select: {
                      name: 'attractionName',
                      time: 'time',
                    },
                    prepare({ name, time }) {
                      return {
                        title: name || 'Attraction Ticket',
                        subtitle: `🎟️ Ticket @ ${time || 'Anytime'}`,
                      }
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: {
              dayNumber: 'dayNumber',
              title: 'dayTitle',
              transfers: 'transfers',
              attractions: 'attractions',
            },
            prepare({ dayNumber, title, transfers, attractions }) {
              const tCount = transfers?.length || 0
              const aCount = attractions?.length || 0
              return {
                title: `Day ${dayNumber || '?'}: ${title || 'Untitled'}`,
                subtitle: `🚗 ${tCount} Transfer${tCount === 1 ? '' : 's'} • 🎟️ ${aCount} Attraction${aCount === 1 ? '' : 's'}`,
              }
            },
          },
        },
      ],
    }),

    // CUSTOMIZABLE PROPOSAL FOOTER / TERMS & INCLUSIONS
    defineField({
      name: 'termsAndInclusions',
      title: 'Proposal Footer (Terms & Inclusions)',
      type: 'text',
      rows: 6,
      description: 'Leave blank to use the global default message, or customize specifically for this template.',
      initialValue: `Terms & Inclusions:\n\n📌 Land Package Only: Hotel accommodation is not included.\n🚐 Transfers: Airport arrival & departure transfers are provided by Private 13-Seater Minibus. Sightseeing transfers are as selected (SIC / Private 13-Seater). Surcharges applicable for flights between 22:00 - 07:00 hours.\nℹ️ Customizations: For hotel room bookings, meal plans, licensed English/Hindi guides, or coach upgrades for groups >12 Pax, please contact DMC.`,
    }),
  ],
})
