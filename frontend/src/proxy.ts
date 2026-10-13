import { NextResponse } from "next/server";
import type { NextProxy } from "next/server"; // Latest Next.js 16 shorthand type

export const proxy: NextProxy = (request) => {
  // NextAuth automatically creates a secure session token cookie
  // Note: Localhost typically names it 'next-auth.session-token', production uses '__Secure-next-auth.session-token'
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  // If no session token cookie is found, redirect them immediately to the login page
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);

    // Optional: preserve the intended target route URL as a callback query parameter
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to pass cleanly to the App Router layouts/pages
  return NextResponse.next();
};

export const config = {
  /*
   * Protect ALL paths across your application except:
   * 1. /login and /register (So unauthenticated users can access them)
   * 2. /api/auth (So NextAuth can handle logins/handshakes internally)
   * 3. Static assets, fonts, and framework internal files
   */
  matcher: [
    "/((?!login|register|api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
