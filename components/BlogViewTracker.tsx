'use client'

import { useEffect } from 'react'

export default function BlogViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return
    try {
      fetch(`/api/blog/view/${slug}`, { method: 'PATCH' }).catch(() => {})
    } catch (e) {}
  }, [slug])

  return null
}
