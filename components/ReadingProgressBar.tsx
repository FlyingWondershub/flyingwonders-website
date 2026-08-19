import { useState, useEffect } from 'react'

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (scrollTop / scrollHeight) * 100
      setProgress(scrolled)
    }
    window.addEventListener('scroll', updateProgress)
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '4px', background: 'rgba(0,0,0,0.1)', zIndex: 9999 }}>
      <div style={{ width: `${progress}%`, height: '100%', background: 'var(--emerald-primary)', transition: 'width 0.1s' }} />
    </div>
  )
}
