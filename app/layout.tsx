import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import LayoutWrapper from '../components/LayoutWrapper'
import Script from 'next/script'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
})
const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair', 
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap'
})

import SeoSchema from '../components/SeoSchema'

export const metadata: Metadata = {
  metadataBase: new URL('https://flyingwonders.net'),
  title: 'Flying Wonders | Premier Singapore DMC & B2B Travel Agent Partner',
  description: 'Flying Wonders Private Limited is a specialist Destination Management Company (DMC) operating in Singapore & India. B2B wholesale rates, attraction e-tickets, custom itineraries, and zero-fee UPI payments.',
  keywords: [
    'Singapore DMC',
    'Singapore DMC India',
    'Singapore B2B Travel Agent Rates',
    'Singapore Attractions E-Tickets',
    'Singapore Tour Packages 2026',
    'Universal Studios Singapore Tickets',
    'Singapore Visa Processing'
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
  openGraph: {
    title: 'Flying Wonders | Premier Singapore DMC & B2B Travel Partner',
    description: 'Specialist Destination Management Company (DMC) operating in Singapore & India. Custom B2B travel agent quotes, Singapore attraction tickets, and zero-fee UPI payments.',
    url: 'https://flyingwonders.net',
    siteName: 'Flying Wonders',
    images: [
      {
        url: '/images/hero/singapore-hero-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Flying Wonders Singapore Travel DMC'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flying Wonders | Premier Singapore DMC',
    description: 'Specialist Destination Management Company (DMC) for Singapore travel packages and attraction tickets.',
    images: ['/images/hero/singapore-hero-1.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'google-adsense-account': 'ca-pub-3967023851392009'
  }
}

import { client } from '../sanity/lib/client'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let settings = {
    contactEmail: 'info.flyingwonders@gmail.com',
    officeAddress: '#74, 4th Cross, SBM Colony, BSK 1st Stage, Bangalore, India - 560050',
    whatsappNumber: '+919886171251',
    youtubeUrl: 'https://www.youtube.com/@flyingwonders7886',
    instagramUrl: 'https://www.instagram.com/flyingwonders.sg/',
    facebookUrl: 'https://www.facebook.com/profile.php?id=61585495532807',
    contactPhoneSingapore: '+65 94722830',
    contactPhoneIndia: '+91 9886171251'
  }

  let pageVisibility = {
    hideInstantQuote: true,
    hideCustomPackage: false,
    hideSingaporeAttractions: false,
    hidePackages: false,
    hideBrochure: false,
    hideReviews: false,
    hideBlog: false,
    hideContact: false,
    hideChatbot: false,
  }

  try {
    const fetchedSettings = await client.fetch(`*[_type == "globalContact"][0]{
      contactEmail,
      officeAddress,
      whatsappNumber,
      youtubeUrl,
      instagramUrl,
      facebookUrl,
      contactPhoneSingapore,
      contactPhoneIndia
    }`)
    if (fetchedSettings) {
      settings = { ...settings, ...fetchedSettings }
    }

    const fetchedVisibility = await client.fetch(`*[_type == "siteSettings"][0]{
      hideInstantQuote,
      hideCustomPackage,
      hideSingaporeAttractions,
      hidePackages,
      hideBrochure,
      hideReviews,
      hideBlog,
      hideContact,
      hideChatbot,
      hidePwaPrompt
    }`)
    if (fetchedVisibility) {
      pageVisibility = { ...pageVisibility, ...fetchedVisibility }
    }
  } catch (err) {
    console.error('Error fetching layout settings from Sanity, using defaults:', err)
  }

  const gaId = 'G-LGTV9FY74C'

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <meta name="color-scheme" content="light dark" />
        <SeoSchema />
        {/* Google AdSense Publisher Account & Site Verification Meta Tag */}
        <meta name="google-adsense-account" content="ca-pub-3967023851392009" />
        {/* Google AdSense Script for Instant Crawler Verification */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3967023851392009"
          crossOrigin="anonymous"
        />
        {/* Next.js Script Fallback */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3967023851392009"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Google Analytics 4 Setup */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                send_page_view: true
              });
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable}`}>
        <LayoutWrapper initialSettings={settings} pageVisibility={pageVisibility}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  )
}
