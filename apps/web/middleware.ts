import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// List of public routes that don't require authentication
const publicRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Check if the route is public
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for auth token
  const hasAccessToken = request.cookies.has('accessToken');
  const hasRefreshToken = request.cookies.has('refreshToken');

  // If no tokens are present and trying to access a protected route, redirect to login
  if (!hasAccessToken && !hasRefreshToken && pathname !== '/') {
    const response = NextResponse.redirect(new URL('/login', request.url));
    return response;
  }

  // If we have a refresh token but no access token, allow the request to proceed
  // The client-side code will handle refreshing the access token
  if (!hasAccessToken && hasRefreshToken) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
