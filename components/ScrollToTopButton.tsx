'use client'

import React, { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTopButton() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop
          const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight

          if (docHeight > 0) {
            const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100))
            setScrollProgress(progress)
          } else {
            setScrollProgress(0)
          }

          setIsVisible(scrollTop > 120)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Geometry: 46px x 46px button, 3px stroke, radius 20px
  const size = 46
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2 // 21.5px
  const circumference = 2 * Math.PI * radius // ~135.088px
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

  return (
    <button
      onClick={scrollToTop}
      className={`scroll-progress-btn ${isVisible ? 'visible' : ''}`}
      aria-label={`Scroll to top (${Math.round(scrollProgress)}% scrolled)`}
      title={`Scroll to top (${Math.round(scrollProgress)}%)`}
    >
      <svg
        className="scroll-progress-svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id="scrollProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F4C3A" />
            <stop offset="65%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
          <linearGradient id="scrollProgressGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>

        {/* Faint track circle */}
        <circle
          className="scroll-progress-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Dynamic progress circle */}
        <circle
          className="scroll-progress-indicator"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>

      <span className="scroll-progress-icon">
        <ChevronUp size={20} strokeWidth={2.6} />
      </span>
    </button>
  )
}
