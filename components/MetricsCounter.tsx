'use client'

import { useState, useEffect, useRef } from 'react'

interface MetricsCounterProps {
  end: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

export default function MetricsCounter({ end, label, suffix = '', prefix = '' }: MetricsCounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isVisible) {
      let startTimestamp: number
      const duration = 2000 // 2 seconds

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / duration, 1)
        
        // easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress, 4)
        setCount(Math.floor(easeProgress * end))
        
        if (progress < 1) {
          window.requestAnimationFrame(step)
        }
      }
      
      window.requestAnimationFrame(step)
    }
  }, [isVisible, end])

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--gold-accent)', marginBottom: '0.5rem', lineHeight: 1 }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-light)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  )
}
