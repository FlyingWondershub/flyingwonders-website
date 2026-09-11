import type { StructureResolver } from 'sanity/structure'

const HANDLED_SCHEMAS = new Set([
  // Custom Package & Logistics
  'transferMeta',
  'guideMeta',
  'hotelMeta',
  'mealMeta',
  'attractionMeta',
  'readyPackageTemplate',
  'attractionBundle',
  'proposal',

  // B2B Agents & Directory
  'b2bAgent',
  'b2bDirectorySettings',
  'b2bCatalogProfile',
  'b2bServiceCatalogSettings',
  'b2bServiceMedia',
  'b2bLeadInquiry',
  'b2bLeadsSettings',
  'b2bLeadSubscriber',
  'b2bLeadAuditLog',
  'b2bTravelToolComment',

  // Tour Packages & Bookings
  'travelPackage',
  'bookingRequest',
  'promotion',
  'promotionInquiry',
  'corporateTravelSettings',
  'eventsPage',
  'competitorPrice',

  // Education & Regional
  'studyInSingaporeSettings',
  'studyUniversity',
  'studyCourseCategory',
  'educationToursSettings',
  'karnatakaPackage',
  'karnatakaSettings',

  // Travel Consulting & Payments
  'travelConsultant',
  'travelConsultingPackage',
  'travelConsultingBooking',
  'travelConsultingSettings',
  'businessCard',
  'manualPayment',

  // Marketing & Media
  'blogPost',
  'newsletterCampaign',
  'newsletterSubscriber',
  'review',
  'recognition',
  'experience',
  'faqItem',
  'attractionsUser',
  'travelTools',

  // Global Settings & Administration
  'siteSettings',
  'globalContact',
  'adminUser',
  'legalPage',
  'contactSubmission',
  'auditLog'
])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Flying Wonders Backoffice')
    .items([
      // ─────────────────────────────────────────────────────────────
      // 1. CUSTOM PACKAGE BUILDER & LOGISTICS METADATA
      // ─────────────────────────────────────────────────────────────
      S.listItem()
        .title('Custom Package Builder')
        .icon(() => '🧳')
        .child(
          S.list()
            .title('Custom Package & Sheet Metadata')
            .items([
              S.documentTypeListItem('transferMeta').title('🚗 Transfer & Fleet Details'),
              S.documentTypeListItem('guideMeta').title('👤 Guide Service Details'),
              S.documentTypeListItem('hotelMeta').title('🏨 Hotel Property Details'),
              S.documentTypeListItem('mealMeta').title('🍽️ Meals & Dining Details'),
              S.divider(),
              S.documentTypeListItem('attractionMeta').title('🎡 Attraction Details'),
              S.documentTypeListItem('attractionBundle').title('🎟️ Attraction Bundles'),
              S.documentTypeListItem('readyPackageTemplate').title('📋 Ready Package Templates'),
              S.documentTypeListItem('proposal').title('📑 Saved Client Proposals'),
            ])
        ),

      S.divider(),

      // ─────────────────────────────────────────────────────────────
      // 2. B2B AGENT NETWORK & DIRECTORY
      // ─────────────────────────────────────────────────────────────
      S.listItem()
        .title('B2B Agents & Directory')
        .icon(() => '💼')
        .child(
          S.list()
            .title('B2B Operations')
            .items([
              S.documentTypeListItem('b2bAgent').title('🏢 B2B Verified Agents'),
              S.documentTypeListItem('b2bLeadInquiry').title('📥 Agent Lead Inquiries'),
              S.documentTypeListItem('b2bLeadSubscriber').title('👥 Lead Subscribers'),
              S.documentTypeListItem('b2bCatalogProfile').title('📋 B2B Catalog Profiles'),
              S.documentTypeListItem('b2bServiceMedia').title('🖼️ Service Media Library'),
              S.documentTypeListItem('b2bTravelToolComment').title('💬 Travel Tool Comments'),
              S.divider(),
              // Singletons
              S.listItem()
                .title('⚙️ B2B Directory Settings')
                .icon(() => '⚙️')
                .child(S.document().schemaType('b2bDirectorySettings').documentId('b2bDirectorySettings')),
              S.listItem()
                .title('⚙️ B2B Service Catalog Settings')
                .icon(() => '⚙️')
                .child(S.document().schemaType('b2bServiceCatalogSettings').documentId('b2bServiceCatalogSettings')),
              S.listItem()
                .title('⚙️ B2B Leads Settings')
                .icon(() => '⚙️')
                .child(S.document().schemaType('b2bLeadsSettings').documentId('b2bLeadsSettings')),
              S.documentTypeListItem('b2bLeadAuditLog').title('📜 B2B Lead Audit Logs'),
            ])
        ),

      // ─────────────────────────────────────────────────────────────
      // 3. TOUR PACKAGES & BOOKINGS
      // ─────────────────────────────────────────────────────────────
      S.listItem()
        .title('Tour Packages & Bookings')
        .icon(() => '🌴')
        .child(
          S.list()
            .title('Packages & Bookings')
            .items([
              S.documentTypeListItem('travelPackage').title('✈️ Fixed Tour Packages'),
              S.documentTypeListItem('bookingRequest').title('🛎️ Booking Reservations'),
              S.documentTypeListItem('promotion').title('🏷️ Special Promotions & Deals'),
              S.documentTypeListItem('promotionInquiry').title('💬 Promotion Inquiries'),
              S.documentTypeListItem('corporateTravelSettings').title('🏢 Corporate MICE Travel'),
              S.documentTypeListItem('eventsPage').title('🎪 Events & Groups'),
              S.documentTypeListItem('competitorPrice').title('🏷️ Market Price Benchmarks'),
            ])
        ),

      // ─────────────────────────────────────────────────────────────
      // 4. EDUCATION & REGIONAL TOURS
      // ─────────────────────────────────────────────────────────────
      S.listItem()
        .title('Education & Regional Tours')
        .icon(() => '🎓')
        .child(
          S.list()
            .title('Education & Regional')
            .items([
              S.documentTypeListItem('studyUniversity').title('🏛️ Study Universities'),
              S.documentTypeListItem('studyCourseCategory').title('📚 Course Categories'),
              S.listItem()
                .title('⚙️ Study in Singapore Settings')
                .icon(() => '🇸🇬')
                .child(S.document().schemaType('studyInSingaporeSettings').documentId('studyInSingaporeSettings')),
              S.listItem()
                .title('⚙️ Education Tours Settings')
                .icon(() => '🎒')
                .child(S.document().schemaType('educationToursSettings').documentId('educationToursSettings')),
              S.divider(),
              S.documentTypeListItem('karnatakaPackage').title('🌴 Karnataka Packages'),
              S.listItem()
                .title('⚙️ Karnataka Settings')
                .icon(() => '⚙️')
                .child(S.document().schemaType('karnatakaSettings').documentId('karnatakaSettings')),
            ])
        ),

      // ─────────────────────────────────────────────────────────────
      // 5. TRAVEL CONSULTING & PAYMENTS
      // ─────────────────────────────────────────────────────────────
      S.listItem()
        .title('Travel Consulting & Payments')
        .icon(() => '🧭')
        .child(
          S.list()
            .title('Consulting & Payments')
            .items([
              S.documentTypeListItem('travelConsultant').title('🧑‍💼 Travel Consultants'),
              S.documentTypeListItem('travelConsultingPackage').title('💼 Consulting Packages'),
              S.documentTypeListItem('travelConsultingBooking').title('📅 Consulting Bookings'),
              S.listItem()
                .title('⚙️ Consulting Settings')
                .icon(() => '⚙️')
                .child(S.document().schemaType('travelConsultingSettings').documentId('travelConsultingSettings')),
              S.divider(),
              S.documentTypeListItem('businessCard').title('📇 Scanned Business Cards'),
              S.documentTypeListItem('manualPayment').title('💳 Manual UPI & Bank Payments'),
            ])
        ),

      // ─────────────────────────────────────────────────────────────
      // 6. MARKETING & CONTENT
      // ─────────────────────────────────────────────────────────────
      S.listItem()
        .title('Marketing & Media')
        .icon(() => '📰')
        .child(
          S.list()
            .title('Marketing & Content')
            .items([
              S.documentTypeListItem('blogPost').title('✍️ Blog Articles'),
              S.documentTypeListItem('newsletterCampaign').title('✉️ Newsletter Campaigns'),
              S.documentTypeListItem('newsletterSubscriber').title('📬 Newsletter Subscribers'),
              S.documentTypeListItem('review').title('⭐ Customer Reviews'),
              S.documentTypeListItem('recognition').title('🏆 Recognition & Awards'),
              S.documentTypeListItem('experience').title('✨ Travel Experiences'),
              S.documentTypeListItem('faqItem').title('❓ Frequently Asked Questions'),
              S.documentTypeListItem('attractionsUser').title('👥 Registered Guest Accounts'),
              S.documentTypeListItem('travelTools').title('🧰 Travel Utility Tools'),
            ])
        ),

      S.divider(),

      // ─────────────────────────────────────────────────────────────
      // 7. GLOBAL SITE SETTINGS & ADMINISTRATION
      // ─────────────────────────────────────────────────────────────
      S.listItem()
        .title('Site Settings & Admin')
        .icon(() => '⚙️')
        .child(
          S.list()
            .title('Site Settings & Admin')
            .items([
              // Singletons opening directly with 1 click
              S.listItem()
                .title('🌐 General Site Settings')
                .icon(() => '🌐')
                .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
              S.listItem()
                .title('📞 Global Contact Information')
                .icon(() => '📞')
                .child(S.document().schemaType('globalContact').documentId('globalContact')),
              S.divider(),
              S.documentTypeListItem('adminUser').title('🛡️ Admin Users & Roles'),
              S.documentTypeListItem('legalPage').title('⚖️ Legal & Policy Pages'),
              S.documentTypeListItem('contactSubmission').title('✉️ Contact Form Submissions'),
              S.documentTypeListItem('auditLog').title('📜 System Audit Logs'),
            ])
        ),

      // ─────────────────────────────────────────────────────────────
      // 8. CATCH-ALL FOR ANY UNLISTED SCHEMAS (GUARANTEES NOTHING IS HIDDEN)
      // ─────────────────────────────────────────────────────────────
      ...S.documentTypeListItems().filter(
        (listItem) => !HANDLED_SCHEMAS.has(listItem.getId() || '')
      )
    ])
