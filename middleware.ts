import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignore static assets, api routes, and Next.js internal files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/studio') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if pathname contains any uppercase characters or underscores
  const normalizedPath = pathname.toLowerCase().replace(/_/g, '-')

  if (pathname !== normalizedPath) {
    // If the path normalization changes the path, redirect to the clean URL
    const url = request.nextUrl.clone()
    url.pathname = normalizedPath
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}

export const config = {
  // Run middleware on all document request paths
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
