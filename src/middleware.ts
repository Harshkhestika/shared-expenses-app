import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isPublicPath = path === '/login';

  const userId = request.cookies.get('userId')?.value || '';

  // Redirect unauthenticated users to login
  if (!isPublicPath && !userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from login
  if (isPublicPath && userId) {
    return NextResponse.redirect(new URL('/groups', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
