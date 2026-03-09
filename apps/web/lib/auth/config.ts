import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    newUser: '/onboarding',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Protected routes - all dashboard-related paths
      const protectedRoutes = [
        '/dashboard',
        '/quotes',
        '/invoices',
        '/clients',
        '/settings',
        '/rate-cards',
        '/templates',
        '/contracts',
        '/onboarding',
        '/projects',
        '/analytics',
        '/help',
      ];
      const isOnProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

      const isOnAuth = pathname.startsWith('/login') || pathname.startsWith('/register');
      const isOnPortal = pathname.startsWith('/p/') || pathname.startsWith('/q/') || pathname.startsWith('/i/') || pathname.startsWith('/c/'); // Client portals

      // Allow public access to client portal
      if (isOnPortal) {
        return true;
      }

      // Allow auth pages (login/register) even for logged-in users.
      // This is necessary so that signOut (which redirects to /login) works properly.
      // The login page itself can redirect logged-in users if needed.
      if (isOnAuth) {
        return true;
      }

      // Protect dashboard routes
      if (isOnProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.avatarUrl = user.avatarUrl;
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token.name = session.name;
        token.avatarUrl = session.avatarUrl;
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        if (typeof token.id !== 'string' || !token.id) {
          return session;
        }
        session.user.id = token.id;
        session.user.email = typeof token.email === 'string' ? token.email : '';
        session.user.name = typeof token.name === 'string' ? token.name : '';
        session.user.avatarUrl = typeof token.avatarUrl === 'string' ? token.avatarUrl : null;
      }
      return session;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        // Import dynamically to avoid issues with edge runtime
        const { verifyCredentials } = await import('./credentials');
        const user = await verifyCredentials(parsed.data.email, parsed.data.password);

        return user;
      },
    }),
  ],
};
