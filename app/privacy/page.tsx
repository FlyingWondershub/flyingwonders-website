import LegalPageClient from '../../components/LegalPageClient'
import { client } from '../../sanity/lib/client'

const FALLBACK_SECTIONS = [
  {
    id: 'intro',
    title: '1. Introduction & Overview',
    content: `Welcome to Flying Wonders Pvt Ltd ("Company", "We", "Us", or "Our"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at info.flyingwonders@gmail.com.

When you visit our website (flyingwonders.net), use our B2B Custom Package builder, or reserve travel packages, you trust us with your personal information. We take your privacy very seriously. In this privacy notice, we describe our privacy policy. We seek to explain to you in the clearest way possible what information we collect, how we use it, and what rights you have in relation to it.

Please read this privacy policy carefully as it will help you make informed decisions about sharing your personal information with us. If there are any terms in this privacy policy that you do not agree with, please discontinue use of our site and our services immediately.`
  },
  {
    id: 'collection',
    title: '2. Information We Collect',
    content: `We collect personal information that you voluntarily provide to us when expressing an interest in obtaining information about us or our products and services, when participating in activities on the website, or otherwise contacting us.

The personal information we collect depends on the context of your interactions with us, the choices you make, and the products and features you use. The personal information we collect can include the following:
• Name and Contact Data: We collect your first and last name, email address, postal address, phone number, WhatsApp number, and other similar contact data.
• B2B Credentials: For registered travel agencies, we collect business registration numbers, company names, authorized agent names, and secure verification history.
• Travel Specifications: We collect details of traveler counts (adults/children), preferred travel dates, hotel selections, flight preferences, dietary requirements, and custom attraction itineraries.
• Log and Usage Data: When you access our site, our servers automatically collect standard web browser log data, such as your IP address, browser type, operating system, referring URLs, device information, and pages visited.`
  },
  {
    id: 'usage',
    title: '3. How We Use Your Data',
    content: `We use personal information collected via our website for a variety of business purposes described below:
• To Facilitate Account Creation and Logon Process: If you choose to register as a B2B travel agency, we use your contact details to verify your organization and facilitate secure OTP sign-in.
• To Fulfill and Manage Bookings: We use your data to book hotel accommodations, secure sightseeing entry tickets (such as Universal Studios Singapore or Gardens by the Bay), assign professional guides, and coordinate private transfers.
• To Deliver Newsletter Campaigns: We process admin-dispatched marketing campaigns and newsletters to registered travelers and agents who have explicitly opted in.
• To Enforce Terms and Conditions: We monitor usage logs to protect our system against automated price scraping, unauthorized API calls, and malicious registration attempts.`
  },
  {
    id: 'adsense',
    title: '4. Google AdSense & Personalized Ads',
    content: `We partner with Google AdSense to serve advertisements on our platform to support our digital services. Google, as a third-party vendor, uses cookies to serve ads on our website.

Google’s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
• Personalized Advertising: AdSense may personalize advertisements based on your interests, demographic profiles, and past web browsing behavior.
• Opting Out: Users may opt out of personalized advertising by visiting Google's ad settings desk at https://www.google.com/settings/ads.
• Cookie Consent: In compliance with ePrivacy (GDPR) and California Consumer Privacy Act (CCPA) regulations, we implement Google-certified consent management protocols. You can customize your consent preferences at any time through our cookie settings banner.`
  },
  {
    id: 'sharing',
    title: '5. Data Sharing & Third Parties',
    content: `We only share information with your consent, to comply with laws, to provide you with services, or to fulfill business obligations. We may process or share data based on the following legal bases:
• Travel Operators & Suppliers: We share names, dates, and specifications with hotels in Singapore (e.g., Boss Hotel, Orchard Rendezvous Hotel) and transfer operators to confirm your reservations.
• Legal Obligations: We may disclose your information where we are legally required to do so to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.
• Business Transfers: We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.`
  },
  {
    id: 'rights',
    title: '6. Your Privacy Rights',
    content: `Depending on your location (such as the European Economic Area, United Kingdom, or California), you have certain rights under applicable data protection laws. These may include the right:
• To request access and obtain a copy of your personal information.
• To request rectification of inaccurate details or erasure of your data profile.
• To request restrict or object to the processing of your personal details.
• To request data portability.

If we are relying on your consent to process your personal information, you have the right to withdraw your consent at any time. To make such requests, please contact us at info.flyingwonders@gmail.com.`
  }
]

export default async function PrivacyPolicy() {
  let title = 'Privacy Policy'
  let subtitle = 'Understand how we handle, secure, and protect your travel data.'
  let sections = FALLBACK_SECTIONS

  try {
    const fetchedPage = await client.fetch(`*[_type == "legalPage" && slug.current == "privacy-policy"][0]{
      title,
      subtitle,
      sections[]{
        id,
        title,
        content
      }
    }`)
    if (fetchedPage) {
      title = fetchedPage.title || title
      subtitle = fetchedPage.subtitle || subtitle
      if (fetchedPage.sections && fetchedPage.sections.length > 0) {
        sections = fetchedPage.sections
      }
    }
  } catch (err) {
    console.error('Error fetching Privacy Policy from Sanity, using defaults:', err)
  }

  return (
    <LegalPageClient 
      title={title}
      subtitle={subtitle}
      sections={sections}
    />
  )
}
