import { defineField, defineType } from 'sanity'

export const corporateTravelSchema = defineType({
  name: 'corporateTravelSettings',
  title: 'Corporate Travel Desk Settings',
  type: 'document',
  fields: [
    // 1. Hero Section
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle Tag',
      type: 'string',
      initialValue: 'Your Strategic Outsourced Corporate Travel Desk',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Main Title',
      type: 'string',
      initialValue: 'Engineering Corporate Travel for India’s Growing Enterprises',
    }),
    defineField({
      name: 'heroDescription',
      title: 'Hero Description / Quote',
      type: 'text',
      rows: 3,
      initialValue: 'Specialized business travel management for SMEs, IT/ITeS firms, and High-Growth Startups. "Let us handle the journey, so you can focus on the destination."',
    }),
    defineField({
      name: 'targetAudienceBadges',
      title: 'Target Audience Badges',
      type: 'array',
      of: [{ type: 'string' }],
      initialValue: ['SMEs', 'IT / ITeS', 'High-Growth Startups'],
    }),
    defineField({
      name: 'yearsExpertise',
      title: 'Years of Expertise Stat',
      type: 'string',
      initialValue: '20+',
    }),
    defineField({
      name: 'flexibleTiersCount',
      title: 'Flexible Tiers Stat',
      type: 'string',
      initialValue: '3',
    }),
    defineField({
      name: 'policyComplianceStat',
      title: 'Policy Compliance Stat',
      type: 'string',
      initialValue: '100%',
    }),

    // 2. Challenges Section Headings & Items
    defineField({
      name: 'challengesSectionTitle',
      title: 'Challenges Section Title',
      type: 'string',
      initialValue: 'The Corporate Travel Challenge',
    }),
    defineField({
      name: 'challengesSectionSubtitle',
      title: 'Challenges Section Subtitle',
      type: 'string',
      initialValue: 'Traditional TMCs and self-service OTAs fail growing Indian enterprises. Here is why:',
    }),
    defineField({
      name: 'challenges',
      title: 'Corporate Travel Challenges',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'icon', title: 'Icon Emoji', type: 'string' }),
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
            defineField({ name: 'accentColor', title: 'Top Accent Color Code', type: 'string' }),
          ],
        },
      ],
      initialValue: [
        {
          icon: '🚫',
          title: 'Impersonal OTA Tools',
          description: 'Online booking platforms lack policy enforcement and offer zero personalization for frequent business travelers.',
          accentColor: '#E53E3E',
        },
        {
          icon: '💰',
          title: 'TMC Cost Overload',
          description: 'Large Travel Management Companies charge prohibitive retainers, designed for massive conglomerates — not SMEs or IT firms.',
          accentColor: '#805AD5',
        },
        {
          icon: '⚠️',
          title: 'Compliance Gaps',
          description: 'Without a dedicated desk, travel policy violations slip through, leading to uncontrolled spend and audit risks.',
          accentColor: '#DD6B20',
        },
        {
          icon: '🌙',
          title: 'No After-Hours Support',
          description: 'Travelers stranded after 7 PM face no escalation path — missed flights mean lost revenue and employee distress.',
          accentColor: '#3182CE',
        },
      ],
    }),
    defineField({
      name: 'solutionBannerText',
      title: 'Solution Banner Highlight Text',
      type: 'string',
      initialValue: '💡 Flying Wonders fills this gap: Expert-led, tech-enabled, policy-compliant travel — at SME-friendly pricing.',
    }),

    // 3. Four Pillars Headings & Items
    defineField({
      name: 'pillarsSectionTag',
      title: 'Pillars Section Tagline',
      type: 'string',
      initialValue: 'Why Choose Us',
    }),
    defineField({
      name: 'pillarsSectionTitle',
      title: 'Pillars Section Title',
      type: 'string',
      initialValue: 'The Flying Wonders Difference',
    }),
    defineField({
      name: 'pillarsSectionSubtitle',
      title: 'Pillars Section Subtitle',
      type: 'string',
      initialValue: 'Four pillars that redefine corporate travel for Indian enterprises',
    }),
    defineField({
      name: 'pillars',
      title: 'Four Pillars',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'icon', title: 'Icon Emoji', type: 'string' }),
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'points', title: 'Key Features / Points', type: 'array', of: [{ type: 'string' }] }),
            defineField({ name: 'bgColor', title: 'Icon Bg Color', type: 'string' }),
            defineField({ name: 'iconColor', title: 'Icon Color', type: 'string' }),
          ],
        },
      ],
      initialValue: [
        {
          icon: '👤',
          title: 'Personalized Concierge',
          points: ['Dedicated desk manager', 'VIP seat & hotel preferences', 'Frequent flyer integration', 'Consistent executive experience'],
          bgColor: '#FEEBC8',
          iconColor: '#C05621',
        },
        {
          icon: '⚡',
          title: 'Specialized Project Logistics',
          points: ['Group mobilization 9+ pax', 'Complex multi-city circuits', 'Visa & work permit handling', 'High-speed regional tours'],
          bgColor: '#C6F6D5',
          iconColor: '#22543D',
        },
        {
          icon: '📊',
          title: 'Financial Stewardship',
          points: ['100% policy enforcement', 'Cost & rate optimization', 'Credit note recovery', 'Audit-ready analytics'],
          bgColor: '#E9D8FD',
          iconColor: '#553C9A',
        },
        {
          icon: '🛡️',
          title: 'Duty of Care & Safety',
          points: ['Real-time traveler tracking', '24/7 emergency support', 'Global safety protocols', 'Leadership peace of mind'],
          bgColor: '#FED7D7',
          iconColor: '#9B2C2C',
        },
      ],
    }),

    // 4. Service Tiers Headings & Items
    defineField({
      name: 'tiersSectionTag',
      title: 'Tiers Section Tagline',
      type: 'string',
      initialValue: 'Transparent Plans',
    }),
    defineField({
      name: 'tiersSectionTitle',
      title: 'Tiers Section Title',
      type: 'string',
      initialValue: 'Service Tier Overview',
    }),
    defineField({
      name: 'tiersSectionSubtitle',
      title: 'Tiers Section Subtitle',
      type: 'string',
      initialValue: 'Flexible tiers designed to scale as your enterprise grows',
    }),
    defineField({
      name: 'serviceTiers',
      title: 'Service Tiers Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'badge', title: 'Tier Badge Label', type: 'string' }),
            defineField({ name: 'title', title: 'Tier Title', type: 'string' }),
            defineField({ name: 'subtitle', title: 'Tier Target Audience', type: 'string' }),
            defineField({ name: 'price', title: 'Pricing Display Text', type: 'string' }),
            defineField({ name: 'isPopular', title: 'Is Most Popular (Highlighted)?', type: 'boolean' }),
            defineField({ name: 'features', title: 'Features List', type: 'array', of: [{ type: 'string' }] }),
            defineField({ name: 'ctaText', title: 'Button Text', type: 'string' }),
          ],
        },
      ],
      initialValue: [
        {
          badge: 'STARTER',
          title: 'T1: Standard Booking Desk',
          subtitle: 'Domestic-heavy or sporadic travel',
          price: 'INR 500 / domestic trip',
          isPopular: false,
          features: ['Flight, hotel & transport bookings', 'Policy compliance verification', 'Business hours support (9 AM – 6 PM)', 'Pay-as-you-go flexibility'],
          ctaText: 'Get Started',
        },
        {
          badge: 'POPULAR',
          title: 'T2: Full Travel Management',
          subtitle: 'IT/ITeS firms & frequent international travel',
          price: '$500 – $1,200 / month',
          isPopular: true,
          features: ['All Tier 1 Services Included', 'Visa & work permit filing ($75/app)', '24/7 emergency support line', 'Monthly expense reporting & analytics'],
          ctaText: 'Choose Tier 2',
        },
        {
          badge: 'ENTERPRISE',
          title: 'T3: Strategic Partnership',
          subtitle: 'Scaling enterprises treating travel as strategic asset',
          price: '$2,000+ / month (custom)',
          isPopular: false,
          features: ['Zero transaction fees on domestic/intl', 'Direct airline rate negotiation (10-15% savings)', 'Duty of Care tech integration', 'Quarterly budget audits & executive reviews'],
          ctaText: 'Contact Sales',
        },
      ],
    }),

    // 5. Pricing Matrix Headings & Table Rows
    defineField({
      name: 'matrixSectionTitle',
      title: 'Pricing Matrix Section Title',
      type: 'string',
      initialValue: 'Detailed Pricing Matrix',
    }),
    defineField({
      name: 'matrixSectionSubtitle',
      title: 'Pricing Matrix Section Subtitle',
      type: 'string',
      initialValue: 'High-Touch, Low-Overhead — pay only for what you truly need',
    }),
    defineField({
      name: 'pricingMatrixRows',
      title: 'Pricing Matrix Table Rows',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'component', title: 'Service Component', type: 'string' }),
            defineField({ name: 'model', title: 'Billing Model', type: 'string' }),
            defineField({ name: 'tier1', title: 'Tier 1 Value', type: 'string' }),
            defineField({ name: 'tier2', title: 'Tier 2 Value', type: 'string' }),
            defineField({ name: 'tier3', title: 'Tier 3 Value', type: 'string' }),
          ],
        },
      ],
      initialValue: [
        { component: 'Air Booking (Domestic)', model: 'Per Transaction', tier1: 'INR 500', tier2: 'INR 300', tier3: 'Included' },
        { component: 'Air Booking (Intl)', model: 'Per Transaction', tier1: 'INR 1,000', tier2: 'INR 800', tier3: 'Included' },
        { component: 'Policy Enforcement', model: 'Bundled', tier1: 'Included', tier2: 'Included', tier3: 'Included' },
        { component: 'Management Retainer', model: 'Monthly', tier1: '—', tier2: '$500–$1,200', tier3: '$2,000+' },
        { component: 'Visa & Permit Filing', model: 'Per Application', tier1: '—', tier2: '$75 + Govt Fees', tier3: 'Priority' },
        { component: '24/7 Emergency Support', model: 'Always-On', tier1: 'Extra fees', tier2: 'Included', tier3: 'Included' },
        { component: 'Expense Reporting', model: 'Monthly', tier1: '—', tier2: 'Included', tier3: 'Included' },
        { component: 'Carrier Negotiations', model: 'Result-Based', tier1: '—', tier2: '—', tier3: '10–15% savings' },
        { component: 'Duty of Care Tech', model: 'Per Traveler', tier1: '—', tier2: '—', tier3: 'Included' },
      ],
    }),

    // 6. Support Windows Headings & Items
    defineField({
      name: 'supportSectionTag',
      title: 'Support Section Tagline',
      type: 'string',
      initialValue: '24/7 Always-On Support',
    }),
    defineField({
      name: 'supportSectionTitle',
      title: 'Support Section Title',
      type: 'string',
      initialValue: 'After-Hours & Emergency Support Line',
    }),
    defineField({
      name: 'supportSectionSubtitle',
      title: 'Support Section Subtitle',
      type: 'string',
      initialValue: 'Your travelers are never stranded. We differentiate clearly between scheduled service and emergency intervention.',
    }),
    defineField({
      name: 'supportWindows',
      title: '24/7 Support Time Windows',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'timeRange', title: 'Time Range (e.g. 9 AM - 6 PM)', type: 'string' }),
            defineField({ name: 'title', title: 'Window Name', type: 'string' }),
            defineField({ name: 'description', title: 'Details', type: 'string' }),
            defineField({ name: 'borderColor', title: 'Border Color Code', type: 'string' }),
            defineField({ name: 'bgColor', title: 'Bg Color Code', type: 'string' }),
          ],
        },
      ],
      initialValue: [
        { timeRange: '9 AM – 6 PM', title: 'Business Hours', description: 'Full desk access across all tiers', borderColor: '#BBF7D0', bgColor: '#F0FDF4' },
        { timeRange: '6 PM – 7 PM', title: 'Overlap Window', description: 'Handoff & briefing window', borderColor: '#FEEBC8', bgColor: '#FFFAF0' },
        { timeRange: '7 PM – 11 PM', title: 'Evening Emergency', description: 'Tiers 2 & 3 included; Tier 1 INR 500/incident', borderColor: '#BEE3F8', bgColor: '#EBF8FF' },
        { timeRange: '11 PM – 9 AM', title: 'Night Watch', description: 'Critical emergencies only (Tiers 2 & 3 included)', borderColor: '#FEB2B2', bgColor: '#FFF5F5' },
      ],
    }),

    // 7. Value Addons & Onboarding Timeline Headings
    defineField({
      name: 'addonsSectionTitle',
      title: 'Addons Section Title',
      type: 'string',
      initialValue: 'Optional Value Add-Ons',
    }),
    defineField({
      name: 'valueAddons',
      title: 'Optional Value Add-Ons',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Addon Name', type: 'string' }),
            defineField({ name: 'price', title: 'Price / Fee', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
          ],
        },
      ],
      initialValue: [
        { title: 'Group Mobilization (9+ Pax)', price: '3–5% of trip cost', description: 'Handles logistics, manifests, seat blocks, and group check-ins for project teams.' },
        { title: 'Complex Circuit Planning', price: 'INR 1,000 / itinerary', description: 'Multi-city tours (e.g. 5 cities in 10 days) planned to maximize productivity and minimize fatigue.' },
        { title: 'Credit Note Recovery', price: '10% of recovered funds', description: 'We track and reclaim expired or unclaimed credit notes — often missed in large TMC systems.' },
      ],
    }),

    defineField({
      name: 'onboardingSectionTitle',
      title: 'Onboarding Section Title',
      type: 'string',
      initialValue: '4-Week Onboarding Timeline',
    }),
    defineField({
      name: 'onboardingSteps',
      title: '4-Week Onboarding Steps',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'week', title: 'Week Number', type: 'number' }),
            defineField({ name: 'title', title: 'Step Title', type: 'string' }),
            defineField({ name: 'description', title: 'Details', type: 'string' }),
          ],
        },
      ],
      initialValue: [
        { week: 1, title: 'Week 1: Discovery & Setup', description: 'Policy integration, traveler profiles setup, ghost card configuration.' },
        { week: 2, title: 'Week 2: Platform Config', description: 'Booking systems setup, approval workflows, reporting dashboards.' },
        { week: 3, title: 'Week 3: Desk Go-Live', description: 'Dedicated desk manager assigned, first bookings processed.' },
        { week: 4, title: 'Week 4: Review & Optimize', description: 'First-month report review, rate negotiations begin.' },
      ],
    }),

    // 8. ROI Case Headings
    defineField({
      name: 'roiSectionTag',
      title: 'ROI Section Tagline',
      type: 'string',
      initialValue: 'Proven Impact',
    }),
    defineField({
      name: 'roiSectionTitle',
      title: 'ROI Section Title',
      type: 'string',
      initialValue: 'Why Flying Wonders: The ROI Case',
    }),
    defineField({
      name: 'roiStats',
      title: 'ROI Case Highlight Stats',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'stat', title: 'Stat Figure (e.g. ₹1.4L)', type: 'string' }),
            defineField({ name: 'label', title: 'Stat Label / Description', type: 'string' }),
            defineField({ name: 'bgColor', title: 'Card Bg Color', type: 'string' }),
            defineField({ name: 'textColor', title: 'Text Accent Color', type: 'string' }),
          ],
        },
      ],
      initialValue: [
        { stat: '₹1.4L', label: 'avg. annual savings per 50-traveler org', bgColor: '#14532D', textColor: '#4ADE80' },
        { stat: '23%', label: 'recovered from expired credit notes', bgColor: '#DD6B20', textColor: '#FFFAF0' },
        { stat: '10–15%', label: 'corporate rate discount on carriers', bgColor: '#553C9A', textColor: '#E9D8FD' },
        { stat: '4 hrs', label: 'saved per trip on planning & coordination', bgColor: '#1A365D', textColor: '#90CDF4' },
      ],
    }),
    defineField({
      name: 'comparisonRows',
      title: 'TMC / OTA Competitor Comparison Table',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'feature', title: 'Feature', type: 'string' }),
            defineField({ name: 'ota', title: 'OTA / MakeMyTrip', type: 'string' }),
            defineField({ name: 'tmc', title: 'Large TMC', type: 'string' }),
            defineField({ name: 'flyingWonders', title: 'Flying Wonders', type: 'string' }),
          ],
        },
      ],
      initialValue: [
        { feature: 'Policy Enforcement', ota: '✗', tmc: '✓', flyingWonders: '✓' },
        { feature: 'Dedicated Manager', ota: '✗', tmc: '✗', flyingWonders: '✓' },
        { feature: 'SME-Friendly Pricing', ota: '✓', tmc: '✗', flyingWonders: '✓' },
        { feature: 'Visa & Compliance', ota: '✗', tmc: '✓', flyingWonders: '✓' },
        { feature: '24/7 Emergency Support', ota: '✗', tmc: '✓', flyingWonders: '✓' },
        { feature: 'Credit Note Recovery', ota: '✗', tmc: '✓', flyingWonders: '✓' },
        { feature: 'Duty of Care Tech', ota: '✗', tmc: 'Partial', flyingWonders: '✓' },
      ],
    }),

    // 9. CTA & Contact Details
    defineField({
      name: 'ctaSectionTag',
      title: 'CTA Section Tagline',
      type: 'string',
      initialValue: 'Get Started Today',
    }),
    defineField({
      name: 'ctaSectionTitle',
      title: 'CTA Section Title',
      type: 'string',
      initialValue: 'Ready to Transform Your Corporate Travel?',
    }),
    defineField({
      name: 'ctaSectionSubtitle',
      title: 'CTA Section Subtitle',
      type: 'string',
      initialValue: 'Choose your tier, schedule a demo, and let us integrate with your HR & Finance workflow within 2 weeks.',
    }),
    defineField({
      name: 'ctaSteps',
      title: 'CTA Process Steps',
      type: 'array',
      of: [{ type: 'string' }],
      initialValue: [
        'Schedule a 30-min discovery call',
        'Share your travel policy & team size',
        'Choose a service tier that fits',
        'Go live within 2 weeks',
      ],
    }),
    defineField({
      name: 'primaryEmail',
      title: 'Primary Contact Email',
      type: 'string',
      initialValue: 'contact@flyingwonders.net',
    }),
    defineField({
      name: 'generalEmail',
      title: 'General Info Email',
      type: 'string',
      initialValue: 'info.flyingwonders@gmail.com',
    }),
    defineField({
      name: 'indiaPhone',
      title: 'India Office Phone',
      type: 'string',
      initialValue: '+91 98861 71251',
    }),
    defineField({
      name: 'singaporePhone',
      title: 'Singapore Office Phone',
      type: 'string',
      initialValue: '+65 9472 2830',
    }),
    defineField({
      name: 'indiaAddress',
      title: 'India Office Address',
      type: 'string',
      initialValue: '#74, 4th Cross, SBM, BSK 1ST, Bangalore, India - 560050',
    }),
    defineField({
      name: 'singaporeAddress',
      title: 'Singapore Office Address',
      type: 'string',
      initialValue: '#12-07, Suntec Tower One, Singapore - 038987',
    }),
  ],
})
