import { client } from '../../sanity/lib/client'

export const revalidate = 60 // Revalidate page every minute

export const metadata = {
  title: 'Corporate Travel Desk | Flying Wonders',
  description: 'Your Strategic Outsourced Corporate Travel Desk. Specialized business travel management for SMEs, IT/ITeS firms, and high-growth Indian enterprises.',
}

export default async function CorporateTravelPage() {
  // Comprehensive default data structure for 100% controllability
  let cms = {
    heroSubtitle: 'Your Strategic Outsourced Corporate Travel Desk',
    heroTitle: 'Engineering Corporate Travel for India’s Growing Enterprises',
    heroDescription: 'Specialized business travel management for SMEs, IT/ITeS firms, and High-Growth Startups. "Let us handle the journey, so you can focus on the destination."',
    targetAudienceBadges: ['SMEs', 'IT / ITeS', 'High-Growth Startups'],
    yearsExpertise: '20+',
    flexibleTiersCount: '3',
    policyComplianceStat: '100%',

    challengesSectionTitle: 'The Corporate Travel Challenge',
    challengesSectionSubtitle: 'Traditional TMCs and self-service OTAs fail growing Indian enterprises. Here is why:',
    challenges: [
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
    solutionBannerText: '💡 Flying Wonders fills this gap: Expert-led, tech-enabled, policy-compliant travel — at SME-friendly pricing.',

    pillarsSectionTag: 'Why Choose Us',
    pillarsSectionTitle: 'The Flying Wonders Difference',
    pillarsSectionSubtitle: 'Four pillars that redefine corporate travel for Indian enterprises',
    pillars: [
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

    tiersSectionTag: 'Transparent Plans',
    tiersSectionTitle: 'Service Tier Overview',
    tiersSectionSubtitle: 'Flexible tiers designed to scale as your enterprise grows',
    serviceTiers: [
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

    matrixSectionTitle: 'Detailed Pricing Matrix',
    matrixSectionSubtitle: 'High-Touch, Low-Overhead — pay only for what you truly need',
    pricingMatrixRows: [
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

    supportSectionTag: '24/7 Always-On Support',
    supportSectionTitle: 'After-Hours & Emergency Support Line',
    supportSectionSubtitle: 'Your travelers are never stranded. We differentiate clearly between scheduled service and emergency intervention.',
    supportWindows: [
      { timeRange: '9 AM – 6 PM', title: 'Business Hours', description: 'Full desk access across all tiers', borderColor: '#BBF7D0', bgColor: '#F0FDF4' },
      { timeRange: '6 PM – 7 PM', title: 'Overlap Window', description: 'Handoff & briefing window', borderColor: '#FEEBC8', bgColor: '#FFFAF0' },
      { timeRange: '7 PM – 11 PM', title: 'Evening Emergency', description: 'Tiers 2 & 3 included; Tier 1 INR 500/incident', borderColor: '#BEE3F8', bgColor: '#EBF8FF' },
      { timeRange: '11 PM – 9 AM', title: 'Night Watch', description: 'Critical emergencies only (Tiers 2 & 3 included)', borderColor: '#FEB2B2', bgColor: '#FFF5F5' },
    ],

    addonsSectionTitle: 'Optional Value Add-Ons',
    valueAddons: [
      { title: 'Group Mobilization (9+ Pax)', price: '3–5% of trip cost', description: 'Handles logistics, manifests, seat blocks, and group check-ins for project teams.' },
      { title: 'Complex Circuit Planning', price: 'INR 1,000 / itinerary', description: 'Multi-city tours (e.g. 5 cities in 10 days) planned to maximize productivity and minimize fatigue.' },
      { title: 'Credit Note Recovery', price: '10% of recovered funds', description: 'We track and reclaim expired or unclaimed credit notes — often missed in large TMC systems.' },
    ],

    onboardingSectionTitle: '4-Week Onboarding Timeline',
    onboardingSteps: [
      { week: 1, title: 'Week 1: Discovery & Setup', description: 'Policy integration, traveler profiles setup, ghost card configuration.' },
      { week: 2, title: 'Week 2: Platform Config', description: 'Booking systems setup, approval workflows, reporting dashboards.' },
      { week: 3, title: 'Week 3: Desk Go-Live', description: 'Dedicated desk manager assigned, first bookings processed.' },
      { week: 4, title: 'Week 4: Review & Optimize', description: 'First-month report review, rate negotiations begin.' },
    ],

    roiSectionTag: 'Proven Impact',
    roiSectionTitle: 'Why Flying Wonders: The ROI Case',
    roiStats: [
      { stat: '₹1.4L', label: 'avg. annual savings per 50-traveler org', bgColor: '#14532D', textColor: '#4ADE80' },
      { stat: '23%', label: 'recovered from expired credit notes', bgColor: '#DD6B20', textColor: '#FFFAF0' },
      { stat: '10–15%', label: 'corporate rate discount on carriers', bgColor: '#553C9A', textColor: '#E9D8FD' },
      { stat: '4 hrs', label: 'saved per trip on planning & coordination', bgColor: '#1A365D', textColor: '#90CDF4' },
    ],

    comparisonRows: [
      { feature: 'Policy Enforcement', ota: '✗', tmc: '✓', flyingWonders: '✓' },
      { feature: 'Dedicated Manager', ota: '✗', tmc: '✗', flyingWonders: '✓' },
      { feature: 'SME-Friendly Pricing', ota: '✓', tmc: '✗', flyingWonders: '✓' },
      { feature: 'Visa & Compliance', ota: '✗', tmc: '✓', flyingWonders: '✓' },
      { feature: '24/7 Emergency Support', ota: '✗', tmc: '✓', flyingWonders: '✓' },
      { feature: 'Credit Note Recovery', ota: '✗', tmc: '✓', flyingWonders: '✓' },
      { feature: 'Duty of Care Tech', ota: '✗', tmc: 'Partial', flyingWonders: '✓' },
    ],

    ctaSectionTag: 'Get Started Today',
    ctaSectionTitle: 'Ready to Transform Your Corporate Travel?',
    ctaSectionSubtitle: 'Choose your tier, schedule a demo, and let us integrate with your HR & Finance workflow within 2 weeks.',
    ctaSteps: [
      'Schedule a 30-min discovery call',
      'Share your travel policy & team size',
      'Choose a service tier that fits',
      'Go live within 2 weeks',
    ],

    primaryEmail: 'contact@flyingwonders.net',
    generalEmail: 'info.flyingwonders@gmail.com',
    indiaPhone: '+91 98861 71251',
    singaporePhone: '+65 9472 2830',
    indiaAddress: '#74, 4th Cross, SBM, BSK 1ST, Bangalore, India - 560050',
    singaporeAddress: '#12-07, Suntec Tower One, Singapore - 038987',
  }

  try {
    const fetched = await client.fetch(`*[_type == "corporateTravelSettings"][0]{
      heroSubtitle,
      heroTitle,
      heroDescription,
      targetAudienceBadges,
      yearsExpertise,
      flexibleTiersCount,
      policyComplianceStat,
      challengesSectionTitle,
      challengesSectionSubtitle,
      challenges,
      solutionBannerText,
      pillarsSectionTag,
      pillarsSectionTitle,
      pillarsSectionSubtitle,
      pillars,
      tiersSectionTag,
      tiersSectionTitle,
      tiersSectionSubtitle,
      serviceTiers,
      matrixSectionTitle,
      matrixSectionSubtitle,
      pricingMatrixRows,
      supportSectionTag,
      supportSectionTitle,
      supportSectionSubtitle,
      supportWindows,
      addonsSectionTitle,
      valueAddons,
      onboardingSectionTitle,
      onboardingSteps,
      roiSectionTag,
      roiSectionTitle,
      roiStats,
      comparisonRows,
      ctaSectionTag,
      ctaSectionTitle,
      ctaSectionSubtitle,
      ctaSteps,
      primaryEmail,
      generalEmail,
      indiaPhone,
      singaporePhone,
      indiaAddress,
      singaporeAddress
    }`)
    if (fetched) {
      cms = { ...cms, ...fetched }
    }
  } catch (err) {
    console.error('Error fetching corporate travel settings from Sanity, using defaults:', err)
  }

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '4rem', color: '#1A202C' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{
        background: 'linear-gradient(135deg, #1A365D 0%, #0F4C3A 100%)',
        color: '#FFFFFF',
        padding: '4.5rem 1.5rem 5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'center' }}>
          <div>
            <span style={{
              display: 'inline-block',
              background: 'rgba(212, 175, 55, 0.2)',
              color: '#D4AF37',
              border: '1px solid #D4AF37',
              padding: '0.35rem 1rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem'
            }}>
              {cms.heroSubtitle}
            </span>

            <h1 style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
              lineHeight: 1.15,
              fontWeight: 800,
              marginBottom: '1.25rem',
              color: '#FFFFFF'
            }}>
              {cms.heroTitle}
            </h1>

            <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '2rem', maxWidth: '640px' }}>
              {cms.heroDescription}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {cms.targetAudienceBadges?.map((badge: string, idx: number) => (
                <span key={idx} style={{ background: '#DD6B20', color: '#FFF', padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                  {badge}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="#discovery-call" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem', background: '#D4AF37', color: '#1A365D', fontWeight: 800, border: 'none' }}>
                Schedule 30-Min Call 📞
              </a>
              <a href="#tiers" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem', background: 'transparent', color: '#FFF', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', fontWeight: 700, textDecoration: 'none' }}>
                Explore Service Tiers ↓
              </a>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#D4AF37', lineHeight: 1 }}>{cms.yearsExpertise}</div>
              <div style={{ fontSize: '0.9rem', color: '#E2E8F0', marginTop: '0.35rem', fontWeight: 600 }}>Years of Travel Expertise</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#10B981', lineHeight: 1 }}>{cms.flexibleTiersCount}</div>
              <div style={{ fontSize: '0.9rem', color: '#E2E8F0', marginTop: '0.35rem', fontWeight: 600 }}>Flexible Service Tiers</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(221,107,32,0.4)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#DD6B20', lineHeight: 1 }}>{cms.policyComplianceStat}</div>
              <div style={{ fontSize: '0.9rem', color: '#E2E8F0', marginTop: '0.35rem', fontWeight: 600 }}>Policy Compliance Guaranteed</div>
            </div>
          </div>
        </div>
      </section>


      {/* 2. THE CORPORATE TRAVEL CHALLENGE */}
      <section style={{ maxWidth: '1200px', margin: '4rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.2rem', fontWeight: 800, color: '#1A365D' }}>
            {cms.challengesSectionTitle}
          </h2>
          <p style={{ color: '#4A5568', fontSize: '1.05rem', maxWidth: '650px', margin: '0.5rem auto 0' }}>
            {cms.challengesSectionSubtitle}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {cms.challenges?.map((item: any, idx: number) => (
            <div key={idx} style={{ background: '#FFF', borderRadius: '12px', padding: '1.75rem', borderTop: `4px solid ${item.accentColor || '#E53E3E'}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2D3748', marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#718096', lineHeight: 1.6, margin: 0 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '2.5rem',
          background: 'linear-gradient(90deg, #1A365D 0%, #2B6CB0 100%)',
          color: '#FFF',
          padding: '1.25rem 2rem',
          borderRadius: '12px',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '1.05rem',
          boxShadow: '0 8px 20px rgba(26,54,93,0.15)'
        }}>
          {cms.solutionBannerText}
        </div>
      </section>


      {/* 3. FOUR PILLARS / DIFFERENCE */}
      <section style={{ maxWidth: '1200px', margin: '5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ color: '#DD6B20', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cms.pillarsSectionTag}</span>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.3rem', fontWeight: 800, color: '#1A365D', marginTop: '0.25rem' }}>
            {cms.pillarsSectionTitle}
          </h2>
          <p style={{ color: '#4A5568', fontSize: '1.05rem' }}>{cms.pillarsSectionSubtitle}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {cms.pillars?.map((pillar: any, idx: number) => (
            <div key={idx} style={{ background: '#FFF', borderRadius: '16px', padding: '2rem 1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: pillar.bgColor || '#FEEBC8', color: pillar.iconColor || '#C05621', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: '1.25rem' }}>
                {pillar.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1A365D', marginBottom: '1rem' }}>{pillar.title}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: '#4A5568' }}>
                {pillar.points?.map((pt: string, pIdx: number) => (
                  <li key={pIdx} style={{ display: 'flex', gap: '0.5rem' }}><span>✓</span> {pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>


      {/* 4. SERVICE TIERS OVERVIEW */}
      <section id="tiers" style={{ maxWidth: '1200px', margin: '5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ color: '#319795', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cms.tiersSectionTag}</span>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.3rem', fontWeight: 800, color: '#1A365D', marginTop: '0.25rem' }}>
            {cms.tiersSectionTitle}
          </h2>
          <p style={{ color: '#4A5568', fontSize: '1.05rem' }}>{cms.tiersSectionSubtitle}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
          {cms.serviceTiers?.map((tier: any, idx: number) => {
            const isPopular = tier.isPopular
            return (
              <div
                key={idx}
                style={{
                  background: isPopular ? '#1A365D' : '#FFF',
                  color: isPopular ? '#FFF' : '#1A202C',
                  borderRadius: '16px',
                  border: isPopular ? '2px solid #D4AF37' : '2px solid #E2E8F0',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: isPopular ? '0 12px 30px rgba(26,54,93,0.25)' : 'none',
                }}
              >
                {isPopular && (
                  <div style={{ position: 'absolute', top: '-14px', right: '20px', background: '#D4AF37', color: '#1A365D', padding: '0.25rem 0.85rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>MOST POPULAR</div>
                )}
                <span style={{ background: isPopular ? 'rgba(255,255,255,0.15)' : '#E6FFFA', color: isPopular ? '#D4AF37' : '#234E52', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, alignSelf: 'flex-start', marginBottom: '1rem', textTransform: 'uppercase' }}>{tier.badge}</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: isPopular ? '#FFF' : '#1A365D', margin: 0 }}>{tier.title}</h3>
                <p style={{ fontSize: '0.85rem', color: isPopular ? '#CBD5E1' : '#718096', marginBottom: '1.5rem', marginTop: '0.25rem' }}>{tier.subtitle}</p>

                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isPopular ? '#D4AF37' : '#2B6CB0', marginBottom: '1.5rem' }}>
                  {tier.price}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', color: isPopular ? '#E2E8F0' : '#4A5568' }}>
                  {tier.features?.map((ft: string, fIdx: number) => (
                    <li key={fIdx}>✓ {ft}</li>
                  ))}
                </ul>

                <a href="#discovery-call" className="btn" style={{ marginTop: 'auto', textAlign: 'center', background: isPopular ? '#D4AF37' : '#EDF2F7', color: isPopular ? '#1A365D' : '#2D3748', padding: '0.75rem', borderRadius: '8px', fontWeight: 800, textDecoration: 'none', border: 'none' }}>{tier.ctaText || 'Choose Plan'}</a>
              </div>
            )
          })}
        </div>
      </section>


      {/* 5. PRICING STRUCTURE COMPARISON TABLE */}
      <section style={{ maxWidth: '1200px', margin: '5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.1rem', fontWeight: 800, color: '#1A365D' }}>
            {cms.matrixSectionTitle}
          </h2>
          <p style={{ color: '#718096', fontSize: '0.95rem' }}>{cms.matrixSectionSubtitle}</p>
        </div>

        <div style={{ overflowX: 'auto', background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#1A365D', color: '#FFF' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Service Component</th>
                <th style={{ padding: '1rem 1.25rem' }}>Model</th>
                <th style={{ padding: '1rem 1.25rem' }}>Tier 1</th>
                <th style={{ padding: '1rem 1.25rem' }}>Tier 2</th>
                <th style={{ padding: '1rem 1.25rem' }}>Tier 3</th>
              </tr>
            </thead>
            <tbody>
              {cms.pricingMatrixRows?.map((row: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid #EDF2F7', background: idx % 2 === 1 ? '#F8FAFC' : '#FFF' }}>
                  <td style={{ padding: '0.9rem 1.25rem', fontWeight: 700 }}>{row.component}</td>
                  <td style={{ padding: '0.9rem 1.25rem', color: '#718096' }}>{row.model}</td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>{row.tier1}</td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>{row.tier2}</td>
                  <td style={{ padding: '0.9rem 1.25rem', color: row.tier3 === 'Included' ? '#38A169' : 'inherit', fontWeight: row.tier3 === 'Included' ? 700 : 'normal' }}>{row.tier3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#718096', marginTop: '0.75rem', textAlign: 'center' }}>
          * One-time Onboarding (Tiers 1 & 2): $250 | Payment Terms: Net-15 / Net-30 | GST applicable as per Indian law.
        </p>
      </section>


      {/* 6. AFTER-HOURS & EMERGENCY SUPPORT */}
      <section style={{ maxWidth: '1200px', margin: '5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '2.5rem 2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ color: '#E53E3E', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cms.supportSectionTag}</span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.1rem', fontWeight: 800, color: '#1A365D', marginTop: '0.25rem' }}>
              {cms.supportSectionTitle}
            </h2>
            <p style={{ color: '#4A5568', fontSize: '0.95rem' }}>
              {cms.supportSectionSubtitle}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {cms.supportWindows?.map((win: any, idx: number) => (
              <div key={idx} style={{ background: win.bgColor || '#F0FDF4', border: `1px solid ${win.borderColor || '#BBF7D0'}`, padding: '1.25rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534' }}>{win.timeRange}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#14532D', marginTop: '0.25rem' }}>{win.title}</div>
                <p style={{ fontSize: '0.82rem', color: '#166534', margin: '0.5rem 0 0' }}>{win.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 7. VALUE ADD-ONS & IMPLEMENTATION TIMELINE */}
      <section style={{ maxWidth: '1200px', margin: '5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>

          <div>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.8rem', fontWeight: 800, color: '#1A365D', marginBottom: '1.5rem' }}>
              {cms.addonsSectionTitle}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cms.valueAddons?.map((addon: any, idx: number) => (
                <div key={idx} style={{ background: '#FFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1A365D', margin: 0 }}>{addon.title}</h4>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2B6CB0' }}>{addon.price}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#718096', margin: 0 }}>{addon.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.8rem', fontWeight: 800, color: '#1A365D', marginBottom: '1.5rem' }}>
              {cms.onboardingSectionTitle}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
              {cms.onboardingSteps?.map((step: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#DD6B20', color: '#FFF', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step.week || idx + 1}</div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1A365D', margin: 0 }}>{step.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#718096', margin: '0.25rem 0 0' }}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>


      {/* 8. THE ROI CASE / COMPARISON */}
      <section style={{ maxWidth: '1200px', margin: '5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: '#38A169', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cms.roiSectionTag}</span>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.2rem', fontWeight: 800, color: '#1A365D', marginTop: '0.25rem' }}>
            {cms.roiSectionTitle}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          {cms.roiStats?.map((statItem: any, idx: number) => (
            <div key={idx} style={{ background: statItem.bgColor || '#14532D', color: '#FFF', padding: '1.75rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: statItem.textColor || '#4ADE80' }}>{statItem.stat}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.25rem' }}>{statItem.label}</div>
            </div>
          ))}
        </div>

        <div style={{ overflowX: 'auto', background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'center' }}>
            <thead>
              <tr style={{ background: '#1A365D', color: '#FFF' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Feature</th>
                <th style={{ padding: '1rem' }}>OTA / MakeMyTrip</th>
                <th style={{ padding: '1rem' }}>Large TMC</th>
                <th style={{ padding: '1rem', background: '#0F4C3A', color: '#4ADE80' }}>Flying Wonders</th>
              </tr>
            </thead>
            <tbody>
              {cms.comparisonRows?.map((comp: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid #EDF2F7' }}>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 600 }}>{comp.feature}</td>
                  <td style={{ padding: '0.85rem 1rem', color: comp.ota === '✓' ? '#38A169' : '#E53E3E' }}>{comp.ota}</td>
                  <td style={{ padding: '0.85rem 1rem', color: comp.tmc === '✓' ? '#38A169' : (comp.tmc === 'Partial' ? '#DD6B20' : '#E53E3E') }}>{comp.tmc}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#38A169', fontWeight: 800, background: '#F0FDF4' }}>{comp.flyingWonders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>


      {/* 9. READY TO GET STARTED / CALL TO ACTION & CONTACT */}
      <section id="discovery-call" style={{ maxWidth: '1200px', margin: '5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1A365D 0%, #0F4C3A 100%)',
          color: '#FFF',
          borderRadius: '20px',
          padding: '3.5rem 2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
          boxShadow: '0 12px 35px rgba(0,0,0,0.15)'
        }}>
          <div>
            <span style={{ color: '#D4AF37', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cms.ctaSectionTag}</span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.4rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '1rem', color: '#FFF' }}>
              {cms.ctaSectionTitle}
            </h2>
            <p style={{ fontSize: '1.05rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '2rem' }}>
              {cms.ctaSectionSubtitle}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
              {cms.ctaSteps?.map((step: string, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ background: '#D4AF37', color: '#1A365D', width: '28px', height: '28px', borderRadius: '50%', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{idx + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '2rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D4AF37', marginBottom: '1.25rem' }}>Contact Information</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: '#E2E8F0' }}>
              <div>
                <strong style={{ color: '#FFF', display: 'block', marginBottom: '0.2rem' }}>Flying Wonders Pvt Ltd (India)</strong>
                {cms.indiaAddress}<br/>
                📞 {cms.indiaPhone}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1rem' }}>
                <strong style={{ color: '#FFF', display: 'block', marginBottom: '0.2rem' }}>Flying Wonders Pte Ltd (Singapore)</strong>
                {cms.singaporeAddress}<br/>
                📞 {cms.singaporePhone}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1rem' }}>
                <strong style={{ color: '#FFF', display: 'block', marginBottom: '0.2rem' }}>Email Us</strong>
                Primary: <a href={`mailto:${cms.primaryEmail}`} style={{ color: '#D4AF37' }}>{cms.primaryEmail}</a><br/>
                General: <a href={`mailto:${cms.generalEmail}`} style={{ color: '#D4AF37' }}>{cms.generalEmail}</a>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <a href={`mailto:${cms.primaryEmail}?subject=Corporate%20Travel%20Desk%20Inquiry`} className="btn btn-primary" style={{ display: 'block', textAlign: 'center', padding: '0.85rem', background: '#D4AF37', color: '#1A365D', fontWeight: 800, border: 'none', borderRadius: '8px', textDecoration: 'none' }}>
                Email Corporate Desk ✉️
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
