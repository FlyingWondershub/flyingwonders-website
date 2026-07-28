'use client'

import { useState, useEffect } from 'react'

const IMAGES = [
  // 1. Singapore Skyline (Iconic Marina Bay Sands & Helix Bridge at night)
  '/images/hero/singapore-hero-1.jpg',
  // 2. Marina Bay Skyline & Merlion (Classic, unmistakable Singapore waterfront)
  '/images/hero/singapore-hero-2.jpg',
  // 3. Gardens by the Bay (Dramatic cinematic angle of the Supertree Grove)
  '/images/hero/singapore-hero-3.jpg',
  // 4. Breathtaking Marina Bay Golden Hour Panoramic Skyline
  '/images/hero/singapore-hero-4.jpg'
]

export default function HeroBackground() {
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % IMAGES.length)
    }, 6000) // Change image every 6 seconds
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1
    }}>
      {IMAGES.map((img, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url('${img}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.4)',
            opacity: idx === currentIdx ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
            zIndex: idx === currentIdx ? 2 : 1
          }}
        />
      ))}
    </div>
  )
}
