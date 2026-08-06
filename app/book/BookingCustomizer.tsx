'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from 'next-sanity'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Inline Sanity client
const client = createClient({
  projectId: '8xtd7yiv',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

interface Experience {
  _id: string
  title: string
  category: string
  priceINR: number
  description?: string
  duration?: string
  imageUrl?: string
}

const TIER_BASE_PRICES: Record<string, number> = {
  budget: 25000,
  premium: 55000,
  solo: 32000,
  groups: 22000,
}

const TIER_LABELS: Record<string, string> = {
  budget: 'Budget Explorer',
  premium: 'Premium Luxury',
  solo: 'Solo Adventurer',
  groups: 'Groups & Families',
}

const FALLBACK_EXPERIENCES: Experience[] = [
  { _id: 'f1', title: 'Universal Studios Singapore', category: 'theme_park', priceINR: 5500, duration: 'Full Day Ticket', imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a52b?auto=format&fit=crop&w=400&q=80' },
  { _id: 'f2', title: 'Gardens by the Bay (Flower Dome & Cloud Forest)', category: 'nature', priceINR: 2800, duration: 'Half Day', imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=400&q=80' },
  { _id: 'f3', title: 'Marina Bay Sands SkyPark & Observation Deck', category: 'luxury', priceINR: 3200, duration: '2 Hours Access', imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80' },
  { _id: 'f4', title: 'Luxury Sentosa Island Yacht & Beach Club Day', category: 'adventure', priceINR: 9500, duration: 'Full Day', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' },
  { _id: 'f5', title: 'Night Safari Private Tram Expedition', category: 'nature', priceINR: 4800, duration: 'Evening Ticket', imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=400&q=80' },
  { _id: 'f6', title: 'Private Heritage Hawker Food Tasting Tour', category: 'food', priceINR: 3500, duration: '3 Hours', imageUrl: 'https://images.unsplash.com/photo-1626804475315-992d9d1ef035?auto=format&fit=crop&w=400&q=80' },
  { _id: 'f7', title: 'Jewel Changi Canopy Park & Changi Experience', category: 'luxury', priceINR: 2200, duration: 'Flexible Entry', imageUrl: 'https://images.unsplash.com/photo-1570533317769-cf722b512c1d?auto=format&fit=crop&w=400&q=80' },
  { _id: 'f8', title: 'Science Centre & Omni-Theatre Experience', category: 'cultural', priceINR: 1800, duration: 'Half Day', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80' },
]

const RECOGNIZED_PACKAGES = {
  exotic_4d3n: {
    title: 'Exotic 4Days - 3Nights',
    price: 600,
    hotel: '3* / Hotel Chancellor Orchard Road / Hotel Boss / Hotel V Lavender',
    tier: 'budget',
    desc: 'Explore the best of Singapore in this compact, action-packed 4 Days, 3 Nights budget-friendly tour.',
    itinerary: [
      {
        day: 1,
        title: "Arrival, City Tour & Night Safari",
        activities: [
          { time: "08:00 - 09:00", desc: "Pickup From Airport & Drop at Indian Restaurant for Breakfast" },
          { time: "10:00 - 12:45", desc: "Half Day City Tour Covering Merlion, Buddha Temple & Nearby Places" },
          { time: "19:00 - 21:00", desc: "Night Safari With Tram Ride - Entry Ticket Provided" }
        ]
      },
      {
        day: 2,
        title: "Gardens by the Bay & Sentosa Island",
        activities: [
          { time: "09:30 - 12:30", desc: "Cloud Forest & Flower Dome - Entry Tickets Provided, Visit Sky Tree" },
          { time: "15:15 - 20:00", desc: "Madame Tussauds 4 in 1, Cable Car, Wings of Time (7:40PM Slot)" }
        ]
      },
      {
        day: 3,
        title: "Universal Studios Thrills",
        activities: [
          { time: "10:30", desc: "Universal Studios - Entry Tickets provided" }
        ]
      },
      {
        day: 4,
        title: "Shopping, Checkout & Departure",
        activities: [
          { time: "12:00", desc: "Hotel Checkout & Transfer to Airport / Explore Jewel Changi" }
        ]
      }
    ]
  },
  classic_5d4n: {
    title: 'Singapore Explorer Classic 5D4N',
    price: 850,
    hotel: '4* / Orchard Rendezvous Hotel / Grand Copthorne Waterfront',
    tier: 'premium',
    desc: 'Experience Singapore in style. Includes premium 4* hotel stays, major entry tickets and guides.',
    itinerary: [
      {
        day: 1,
        title: "Arrival & Marina Bay Sands Light Show",
        activities: [
          { time: "10:00", desc: "Airport pickup and drop to 4* luxury hotel" },
          { time: "18:00", desc: "Visit Marina Bay Sands SkyPark Observation Deck" },
          { time: "20:00", desc: "Watch the Spectra Light & Water Show" }
        ]
      },
      {
        day: 2,
        title: "Gardens by the Bay & Night Safari",
        activities: [
          { time: "09:00", desc: "Explore Gardens by the Bay Flower Dome & Cloud Forest" },
          { time: "18:00", desc: "Night Safari guided tram tour & Creatures of the Night show" }
        ]
      },
      {
        day: 3,
        title: "Universal Studios & Sentosa Skyhelix",
        activities: [
          { time: "10:00", desc: "Full day Universal Studios Singapore with express passes" },
          { time: "18:00", desc: "Ride the open-air Sentosa Skyhelix ride at Sunset" }
        ]
      },
      {
        day: 4,
        title: "Singapore Zoo & River Wonders",
        activities: [
          { time: "09:00", desc: "Explore the Singapore Zoo and River Wonders Amazon Quest boat ride" }
        ]
      },
      {
        day: 5,
        title: "Jewel Changi Canopy & Departure",
        activities: [
          { time: "10:00", desc: "Visit Jewel Changi Canopy Park & Airport drop for outbound departure" }
        ]
      }
    ]
  },
  solo_exploration_4d3n: {
    title: 'Solo Exploration 4Days - 3Nights - Private Transfers',
    price: 1000,
    hotel: '3* / Hotel Chancellor Orchard Road / Hotel Boss / Hotel V Lavender',
    tier: 'solo',
    desc: 'Experience Singapore at your own pace with a premium private-transfer solo package.',
    itinerary: [
      {
        day: 1,
        title: "Arrival, City Highlights & Gardens by the Bay",
        activities: [
          { time: "10:00 - 12:45", desc: "Half Day City Tour Covering Merlion, Buddha Temple & Nearby Places" },
          { time: "15:30 - 20:30", desc: "Cloud Forest & Flower Dome - Entry Tickets Provided, Visit Sky Tree" }
        ]
      },
      {
        day: 2,
        title: "Museum of Ice Cream & Sentosa Island",
        activities: [
          { time: "09:30 - 12:30", desc: "Explore Museum of Icecream - Place of Happiness" },
          { time: "13:15 - 20:00", desc: "Madame Tussauds, Cable Car, spend time on beach, Wings of time show" }
        ]
      },
      {
        day: 3,
        title: "Universal Studios Singapore",
        activities: [
          { time: "10:30", desc: "Universal Studios - Entry Tickets provided" }
        ]
      },
      {
        day: 4,
        title: "Leisure, Shopping & Departure",
        activities: [
          { time: "12:00", desc: "Hotel Checkout & Transfer to Airport / Explore Jewel Changi" }
        ]
      }
    ]
  },
  marvelous_singapore_5d4n: {
    title: 'Marvelous Singapore 5Days - 4Nights',
    price: 950,
    hotel: '3* / Hotel Chancellor Orchard Road / Hotel Boss / Hotel V Lavender',
    tier: 'groups',
    desc: 'The ultimate Singapore family and group getaway!',
    itinerary: [
      {
        day: 1,
        title: "Arrival, City Highlights & Gardens by the Bay",
        activities: [
          { time: "10:00 - 12:45", desc: "Half Day City Tour Covering Merlion, Buddha Temple & Nearby Places" },
          { time: "17:00 - 20:30", desc: "Cloud Forest & Flower Dome - Entry Tickets Provided, Visit Sky Tree" }
        ]
      },
      {
        day: 2,
        title: "Museum of Ice Cream, Bird Paradise & Night Safari",
        activities: [
          { time: "09:30 - 12:30", desc: "Museum of Singapore - Entry Tickets provided" },
          { time: "15:15 - 18:00", desc: "Bird Paradise - Entry Tickets Provided" },
          { time: "19:00 - 21:00", desc: "Night Safari - Entry Tickets Provided" }
        ]
      },
      {
        day: 3,
        title: "Universal Studios Thrills",
        activities: [
          { time: "10:30", desc: "Universal Studios - Entry Tickets provided" }
        ]
      },
      {
        day: 4,
        title: "Sentosa Island, Madame Tussauds, Aquarium & Wings of Time",
        activities: [
          { time: "12:15 - 13:15", desc: "Madame Tussaud Entry Tickets Provided & Cable Car ride" },
          { time: "15:00 - 17:00", desc: "Oceanarium - Entry Tickets provided" },
          { time: "19:00 - 20:00", desc: "Wings of Time - Entry Tickets provided" }
        ]
      },
      {
        day: 5,
        title: "Leisure, Shopping & Departure",
        activities: [
          { time: "12:00", desc: "Hotel Checkout & Transfer to Airport / Explore Jewel Changi" }
        ]
      }
    ]
  },
  genting_5n6d: {
    title: 'Enchanting Singapore With Genting Dream Cruise ( 5N - 6D)',
    price: 1050,
    hotel: '3* / Hotel Chancellor Orchard Road / Hotel Boss / Hotel V Lavendar',
    tier: 'groups',
    desc: 'A magical 6-day journey combining the vibrant cityscape of Singapore with the luxury and entertainment of a Genting Dream Cruise.',
    itinerary: [
      {
        day: 1,
        title: "Changi Airport Arrival & Night Safari",
        activities: [
          { time: "08:00", desc: "Pickup from Changi Airport" },
          { time: "14:30", desc: "Hotel Checkin - Hotel Chancellor @ Orchard Road" },
          { time: "17:30", desc: "Night Safari with tram ride, followed by Dinner" }
        ]
      },
      {
        day: 2,
        title: "Gardens by the Bay & Sentosa Fun",
        activities: [
          { time: "09:30", desc: "Gardens by the bay ( 2 domes: Cloud Forest & Flower Dome )" },
          { time: "14:00", desc: "Sentosa Pickup from Mount Faber - Ride the Cable Car & Madame Tussauds" },
          { time: "19:20", desc: "Wings of Time Show" }
        ]
      },
      {
        day: 3,
        title: "Universal Studios Thrills",
        activities: [
          { time: "09:30", desc: "Universal Studios - Full Day + Lunch Coupon" }
        ]
      },
      {
        day: 4,
        title: "Shopping & Genting Dream Cruise Embarkation",
        activities: [
          { time: "10:00", desc: "Free & Easy / Shopping Time" },
          { time: "14:00", desc: "Pick Baggage from hotel and transfer to Cruise Terminal for Check-in" }
        ]
      },
      {
        day: 5,
        title: "Enjoy Experiences on Cruise",
        activities: [
          { time: "Full Day", desc: "Enjoy premium experiences, slides, theater shows, dining, and Stay on Cruise" }
        ]
      },
      {
        day: 6,
        title: "Cruise Arrival & Changi Departure",
        activities: [
          { time: "14:00", desc: "Reach Singapore Cruise Terminal & Drop to Airport / Explore Jewel Changi" }
        ]
      }
    ]
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.875rem 1rem',
  borderRadius: '8px',
  border: '1px solid #CBD5E1',
  fontSize: '1rem',
  background: '#FAFAFA',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  marginBottom: '0.5rem',
  fontSize: '0.95rem',
}

export default function BookingCustomizer() {
  const searchParams = useSearchParams()
  const packageId = searchParams.get('packageId')

  const [sanityPkg, setSanityPkg] = useState<any>(null)

  useEffect(() => {
    if (!packageId) return
    async function fetchPackageFromSanity() {
      try {
        const query = `*[_type == "travelPackage" && _id == $id][0]{
          _id, title, tier, price, description, hotelOptions, itinerary
        }`
        const res = await client.fetch(query, { id: packageId })
        if (res) {
          setSanityPkg(res)
        }
      } catch (err) {
        console.error('Error fetching package from Sanity:', err)
      }
    }
    fetchPackageFromSanity()
  }, [packageId])

  const fallbackPkg = packageId ? RECOGNIZED_PACKAGES[packageId as keyof typeof RECOGNIZED_PACKAGES] : null

  const selectedPackage = useMemo(() => {
    if (!packageId) return null
    if (sanityPkg) {
      return {
        title: sanityPkg.title || fallbackPkg?.title || 'Singapore Tour Package',
        price: sanityPkg.price || fallbackPkg?.price || 600,
        hotel: (sanityPkg.hotelOptions && sanityPkg.hotelOptions.trim()) ? sanityPkg.hotelOptions : (fallbackPkg?.hotel || '3* / Standard Hotels'),
        tier: sanityPkg.tier || fallbackPkg?.tier || 'budget',
        desc: sanityPkg.description || fallbackPkg?.desc || 'A premium customizable package to explore Singapore.',
        itinerary: (sanityPkg.itinerary && sanityPkg.itinerary.length > 0) ? sanityPkg.itinerary : (fallbackPkg?.itinerary || [])
      }
    }
    if (fallbackPkg) return fallbackPkg
    return {
      title: 'Singapore Tour Package',
      price: 600,
      hotel: '3* / Standard Hotels',
      tier: 'budget',
      desc: 'A premium customizable package to explore Singapore.',
      itinerary: [] as any[]
    }
  }, [packageId, sanityPkg, fallbackPkg])

  const [step, setStep] = useState(1)
  const [itineraryExpanded, setItineraryExpanded] = useState(false)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isMobile, setIsMobile] = useState(false)

  const [formData, setFormData] = useState({
    tier: 'solo',
    travelers: 1,
    date: '',
    selectedExperiences: [] as string[],
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function fetchExperiences() {
      try {
        const query = `*[_type == "experience"]{ _id, title, category, priceINR, description, duration, "imageUrl": image.asset->url }`
        const data = await client.fetch(query)
        setExperiences(data && data.length > 0 ? data : FALLBACK_EXPERIENCES)
      } catch {
        setExperiences(FALLBACK_EXPERIENCES)
      }
    }
    fetchExperiences()
  }, [])

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const selectedExpDetails = useMemo(() => {
    return experiences.filter(exp => formData.selectedExperiences.includes(exp._id))
  }, [experiences, formData.selectedExperiences])

  const totalPrice = useMemo(() => {
    const base = TIER_BASE_PRICES[formData.tier] || 25000
    const experienceTotal = selectedExpDetails.reduce((sum, exp) => sum + exp.priceINR, 0)
    return base + experienceTotal
  }, [formData.tier, selectedExpDetails])

  // Direct package submission
  const handlePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        travelDate: formData.date,
        tier: selectedPackage?.tier || 'budget',
        travelers: formData.travelers,
        experiences: [{ title: `Package Booking: ${selectedPackage?.title}` }],
        totalPrice: (selectedPackage?.price || 600) * formData.travelers,
        notes: `Selected Hotel Tier: ${selectedPackage?.hotel}\nNotes: ${formData.notes}`,
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const resData = await res.json()
      const sanityDocId = resData.sanityDocId

      const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
      if (web3formsKey) {
        const messageText = `
=== DIRECT PACKAGE BOOKING ENQUIRY ===
Package: ${selectedPackage?.title}
Price: S$ ${selectedPackage?.price} per person
Hotel Options: ${selectedPackage?.hotel}

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Travel Date: ${formData.date}
Travelers: ${formData.travelers}

Special Requests:
${formData.notes || 'None'}

${sanityDocId ? `Logged in Sanity: ${sanityDocId}` : ''}
        `.trim()

        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            access_key: web3formsKey,
            subject: `✈️ Package Booking: ${selectedPackage?.title} from ${formData.name}`,
            from_name: 'Flying Wonders Website',
            name: formData.name,
            email: formData.email,
            message: messageText,
          }),
        })
      }

      setSubmitStatus('success')
    } catch (err) {
      console.error(err)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Standard customizer submission
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        travelDate: formData.date,
        tier: formData.tier,
        travelers: formData.travelers,
        experiences: selectedExpDetails.map(exp => ({ title: exp.title, priceINR: exp.priceINR })),
        totalPrice,
        notes: formData.notes,
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Database logging failed')
      }

      const resData = await res.json()
      const sanityDocId = resData.sanityDocId

      const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
      if (web3formsKey) {
        const experienceListText = selectedExpDetails.length > 0
          ? selectedExpDetails.map(exp => `- ${exp.title}`).join('\n')
          : 'None selected'

        const messageText = `
=== CUSTOM PACKAGE LEAD ===
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Travel Date: ${formData.date || 'Not specified'}

Package Profile: ${TIER_LABELS[formData.tier]}
Travelers: ${formData.travelers}

Selected Experiences:
${experienceListText}

Estimated Value: ₹${totalPrice.toLocaleString('en-IN')} Per Person

Special Notes:
${formData.notes || 'None'}

${sanityDocId ? `Logged in Sanity: ${sanityDocId}` : ''}
        `.trim()

        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            access_key: web3formsKey,
            subject: `✈️ Custom Package Booking Request from ${formData.name}`,
            from_name: 'Flying Wonders Website',
            name: formData.name,
            email: formData.email,
            message: messageText,
          }),
        })
      }

      setSubmitStatus('success')
    } catch (err) {
      console.error('Submission error:', err)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pre-filled WhatsApp fallback redirects
  const handleWhatsAppRedirect = () => {
    const text = selectedPackage
      ? `Hello Flying Wonders! I would like to book the '${selectedPackage.title}' package.%0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.phone}%0A*Date:* ${formData.date}%0A*Travelers:* ${formData.travelers}%0A*Price:* S$ ${selectedPackage.price}/person%0A%0A*Special Notes:* ${formData.notes || 'None'}`
      : `Hello Flying Wonders! I would like to request a Custom Singapore Package.%0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.phone}%0A*Date:* ${formData.date}%0A*Profile:* ${TIER_LABELS[formData.tier]}%0A*Travelers:* ${formData.travelers}%0A*Total Est. Cost:* ₹${totalPrice.toLocaleString('en-IN')}/person%0A*Selected Experiences:*%0A${selectedExpDetails.map(e => `- ${e.title}`).join('%0A')}%0A%0A*Notes:* ${formData.notes || 'None'}`
    window.open(`https://wa.me/919886171251?text=${text}`, '_blank')
  }

  // --- Success Render State ---
  if (submitStatus === 'success') {
    return (
      <div className="glass" style={{ padding: '3rem', borderRadius: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎉</div>
        <h2 style={{ color: 'var(--emerald-secondary)', marginBottom: '1rem', fontFamily: 'var(--font-playfair), serif', fontSize: '2rem' }}>Booking Request Received!</h2>
        <p style={{ opacity: 0.8, lineHeight: 1.6, marginBottom: '2rem' }}>
          Thank you for choosing Flying Wonders. Our travel architects have logged your request and will contact you shortly with the confirmed itinerary and booking steps.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={handleWhatsAppRedirect} 
            className="btn btn-primary" 
            style={{ background: '#25D366', color: '#FFF', border: 'none', padding: '0.875rem', fontWeight: 700, borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}
          >
            💬 Reach out on WhatsApp
          </button>
          
          <Link 
            href="/packages" 
            style={{ color: 'var(--crimson-primary)', fontWeight: 700, textDecoration: 'underline', marginTop: '1rem', fontSize: '0.95rem' }}
          >
            Go back to Packages
          </Link>
        </div>
      </div>
    )
  }

  // --- Render Direct Package Booking Form (If packageId is present) ---
  if (selectedPackage) {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', 
        gap: '2.5rem', 
        alignItems: 'start' 
      }}>
        
        {/* Left: Package Booking Form */}
        <div className="glass" style={{ padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: '16px', background: '#FFF' }}>
          <h2 style={{ color: 'var(--emerald-secondary)', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair), serif', fontSize: '1.8rem' }}>
            Book Your Package
          </h2>
          <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '2rem' }}>
            Please fill in your contact information and travel dates. Our team will verify availability and reach out to complete the reservation.
          </p>

          <form onSubmit={handlePackageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input 
                type="text" required placeholder="Enter your full name"
                value={formData.name} onChange={e => updateForm('name', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input 
                  type="email" required placeholder="your.email@domain.com"
                  value={formData.email} onChange={e => updateForm('email', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp Phone Number *</label>
                <input 
                  type="tel" required placeholder="+91 XXXXX XXXXX"
                  value={formData.phone} onChange={e => updateForm('phone', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Target Travel Date *</label>
                <input 
                  type="date" required
                  value={formData.date} onChange={e => updateForm('date', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Number of Travelers *</label>
                <input 
                  type="number" required min={1}
                  value={formData.travelers} onChange={e => updateForm('travelers', Number(e.target.value))}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Special Requests / Customizations</label>
              <textarea 
                placeholder="E.g., vegetarian meals, room preferences, extra tours..."
                rows={4}
                value={formData.notes} onChange={e => updateForm('notes', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {submitStatus === 'error' && (
              <p style={{ color: 'red', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                ⚠️ There was an error submitting your request. Please try again or message us on WhatsApp.
              </p>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting}
              style={{ padding: '1rem', fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem', cursor: 'pointer' }}
            >
              {isSubmitting ? 'Sending Request...' : 'Confirm & Book Package ✈️'}
            </button>
          </form>
        </div>

        {/* Right: Selected Package Summary Card */}
        <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', background: '#FFF' }}>
          <div style={{ padding: '1.5rem', background: 'var(--emerald-secondary)', color: '#FFF' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
              Selected Package
            </span>
            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.4rem', fontFamily: 'var(--font-playfair), serif' }}>
              {selectedPackage.title}
            </h3>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Hotel Stay:</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                {selectedPackage.hotel}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Overview:</div>
              <div style={{ fontSize: '0.88rem', color: '#4A5568', marginTop: '0.25rem', lineHeight: 1.4 }}>
                {selectedPackage.desc}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '1.25rem 0' }} />

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Package Pricing:</div>
              <div style={{ fontWeight: 800, fontSize: '1.8rem', color: 'var(--crimson-primary)', marginTop: '0.25rem' }}>
                S$ {selectedPackage.price}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Per Person</div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <button 
                type="button"
                onClick={() => setItineraryExpanded(!itineraryExpanded)}
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--emerald-secondary)', 
                  fontWeight: 700, 
                  fontSize: '0.85rem', 
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {itineraryExpanded ? '🔼 Hide Detailed Itinerary' : '📆 View Detailed Itinerary'}
              </button>

              {itineraryExpanded && selectedPackage && (selectedPackage as any).itinerary && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  textAlign: 'left'
                }}>
                  {(selectedPackage as any).itinerary.map((day: any, idx: number) => (
                    <div key={idx} style={{ marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--emerald-secondary)' }}>
                        Day {day.day}: {day.title}
                      </div>
                      <div style={{ paddingLeft: '0.5rem', marginTop: '0.25rem' }}>
                        {day.activities.map((act: any, aIdx: number) => (
                          <div key={aIdx} style={{ fontSize: '0.75rem', color: '#4A5568', marginBottom: '0.15rem' }}>
                            • <span style={{ fontWeight: 600 }}>{act.time}</span>: {act.desc}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div 
              onClick={handleWhatsAppRedirect}
              style={{
                padding: '0.75rem',
                background: 'rgba(37,211,102,0.06)',
                borderRadius: '8px',
                borderLeft: '4px solid #25D366',
                fontSize: '0.75rem',
                color: '#128C7E',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Click to chat on WhatsApp"
            >
              💬 Instant support available via WhatsApp.
            </div>
          </div>
        </div>

      </div>
    )
  }

  // --- Render Standard Customizer Flow (Fallback if no packageId is present) ---
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', 
      gap: '2.5rem', 
      alignItems: 'start' 
    }}>
      
      {/* Left: Form Flow */}
      <div className="glass" style={{ padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: '16px' }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(0,0,0,0.1)', zIndex: 0 }}></div>
          {[1, 2, 3, 4].map(num => (
            <div key={num} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: step >= num ? 'var(--crimson-primary)' : '#CBD5E1',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1, fontWeight: 'bold', fontSize: '0.9rem',
              transition: 'background 0.3s ease',
            }}>
              {step > num ? '✓' : num}
            </div>
          ))}
        </div>

        <form onSubmit={submit}>
          {step === 1 && (
            <div>
              <h3 style={{ color: 'var(--emerald-secondary)', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair), serif', fontSize: '1.8rem' }}>1. Select Traveler Profile</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                {Object.entries(TIER_LABELS).map(([key, label]) => (
                  <div 
                    key={key}
                    onClick={() => updateForm('tier', key)}
                    style={{
                      padding: '1.5rem', borderRadius: '12px', border: formData.tier === key ? '2px solid var(--crimson-primary)' : '1px solid #E2E8F0',
                      cursor: 'pointer', background: formData.tier === key ? 'rgba(184,58,75,0.04)' : '#FFF',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: formData.tier === key ? 'var(--crimson-primary)' : 'var(--text-dark)' }}>{label}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.25rem' }}>SGD base customizer rate applies.</div>
                  </div>
                ))}
              </div>

              <div>
                <label style={labelStyle}>Number of Travelers</label>
                <input 
                  type="number" min={1} required
                  value={formData.travelers} onChange={e => updateForm('travelers', Number(e.target.value))}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" onClick={() => setStep(2)} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Next Step →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ color: 'var(--emerald-secondary)', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair), serif', fontSize: '1.8rem' }}>2. Add Experiences</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {experiences.map(exp => {
                  const isSelected = formData.selectedExperiences.includes(exp._id)
                  return (
                    <div 
                      key={exp._id}
                      onClick={() => {
                        const next = isSelected 
                          ? formData.selectedExperiences.filter(id => id !== exp._id)
                          : [...formData.selectedExperiences, exp._id]
                        updateForm('selectedExperiences', next)
                      }}
                      style={{
                        display: 'flex', gap: '1.25rem', padding: '1rem', borderRadius: '10px',
                        border: isSelected ? '2px solid var(--crimson-primary)' : '1px solid #E2E8F0',
                        cursor: 'pointer', background: isSelected ? 'rgba(184,58,75,0.02)' : '#FFF',
                        alignItems: 'center', transition: 'all 0.2s',
                      }}
                    >
                      {exp.imageUrl && (
                        <img src={exp.imageUrl} alt={exp.title} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                      )}
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? 'var(--crimson-primary)' : 'var(--text-dark)' }}>{exp.title}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.15rem' }}>Duration: {exp.duration || 'Flexible'}</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>₹{exp.priceINR.toLocaleString('en-IN')}</div>
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn glass" style={{ padding: '0.75rem 2rem' }}>← Back</button>
                <button type="button" onClick={() => setStep(3)} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Next Step →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ color: 'var(--emerald-secondary)', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair), serif', fontSize: '1.8rem' }}>3. Contact Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input 
                    type="text" required placeholder="Enter name"
                    value={formData.name} onChange={e => updateForm('name', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input 
                    type="email" required placeholder="email@address.com"
                    value={formData.email} onChange={e => updateForm('email', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp Phone Number *</label>
                  <input 
                    type="tel" required placeholder="+91 XXXXX XXXXX"
                    value={formData.phone} onChange={e => updateForm('phone', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <button type="button" onClick={() => setStep(2)} className="btn glass" style={{ padding: '0.75rem 2rem' }}>← Back</button>
                <button type="button" onClick={() => setStep(4)} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Review Details →</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 style={{ color: 'var(--emerald-secondary)', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair), serif', fontSize: '1.8rem' }}>4. Review & Confirm</h3>
              
              <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
                <div><strong>Lead Name:</strong> {formData.name}</div>
                <div><strong>Email:</strong> {formData.email}</div>
                <div><strong>Phone / WhatsApp:</strong> {formData.phone}</div>
                <div><strong>Travelers:</strong> {formData.travelers} Guests</div>
                <div><strong>Tier Profile:</strong> {TIER_LABELS[formData.tier]}</div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Preferred Travel Date</label>
                <input 
                  type="date"
                  value={formData.date} onChange={e => updateForm('date', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={labelStyle}>Additional requests / custom hotel suggestions</label>
                <textarea 
                  placeholder="Enter details here..." rows={3}
                  value={formData.notes} onChange={e => updateForm('notes', e.target.value)}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {submitStatus === 'error' && (
                <p style={{ color: 'red', fontWeight: 600, fontSize: '0.85rem' }}>⚠️ An error occurred. Please contact us on WhatsApp.</p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" onClick={() => setStep(3)} className="btn glass" style={{ padding: '0.75rem 2rem' }}>← Back</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ padding: '0.75rem 2rem' }}>
                  {isSubmitting ? 'Confirming...' : 'Confirm & Request Booking ✈️'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Right: Live Builder Summary Card */}
      <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', background: '#FFF' }}>
        <div style={{ width: '100%', height: '140px', background: 'var(--emerald-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '1rem', textAlign: 'center' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Custom Itinerary Planner</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>Build your perfect Singapore package</p>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--crimson-primary)', fontWeight: 700, marginBottom: '1rem' }}>
            LIVE BUILDER SUMMARY
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Traveler Profile:</div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{TIER_LABELS[formData.tier]}</div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Included Experiences:</div>
            {selectedExpDetails.length > 0 ? (
              <ul style={{ paddingLeft: '1.25rem', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                {selectedExpDetails.map(exp => (
                  <li key={exp._id} style={{ marginBottom: '4px' }}>{exp.title}</li>
                ))}
              </ul>
            ) : (
              <p style={{ opacity: 0.4, fontStyle: 'italic', fontSize: '0.85rem', margin: '4px 0 0 0' }}>No attractions chosen yet</p>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '1rem 0' }} />

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Estimated Package Value:</div>
            <div style={{ fontWeight: 800, fontSize: '1.8rem', color: 'var(--crimson-primary)' }}>
              ₹{totalPrice.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Per Person</div>
          </div>

          <div style={{
            padding: '0.75rem',
            background: 'rgba(0,168,89,0.06)',
            borderRadius: '8px',
            borderLeft: '4px solid var(--emerald-secondary)',
            fontSize: '0.75rem',
            color: 'var(--emerald-secondary)',
            fontWeight: 600,
          }}>
            🛡️ Price protected under best price guarantee.
          </div>
        </div>
      </div>

    </div>
  )
}
