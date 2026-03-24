import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { loginSchema } from '@/lib/validations/auth';

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

      // Public routes — explicitly listed, everything else requires auth
      const publicRoutes = [
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/p/',  // Client portal (public quote view)
        '/q/',  // Quote portal
        '/i/',  // Invoice portal
        '/c/',  // Contract portal
        '/invite/',
      ];
      const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

      // Allow root path and all marketing/legal pages
      const marketingRoutes = ['/', '/pricing', '/features', '/about', '/blog', '/careers', '/changelog', '/contact', '/cookies', '/docs', '/privacy', '/terms'];
      if (marketingRoutes.includes(pathname) || marketingRoutes.some(r => r !== '/' && pathname.startsWith(r + '/'))) {
        return true;
      }

      // Allow public routes without auth
      if (isPublicRoute) {
        return true;
      }

      // Everything else requires authentication (protect by default)
      if (isLoggedIn) return true;
      return false; // Redirect to login
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        if (!user.id) {
          console.warn('[AUTH] JWT callback received user without id — this may indicate an OAuth provider issue');
        }
        token.id = user.id ?? '';
        token.email = user.email ?? '';
        token.name = user.name ?? '';
        token.avatarUrl = user.avatarUrl;
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token.name = session.name;
        token.avatarUrl = session.avatarUrl;
      }

      // Bug #84: Check if user is soft-deleted on every request (invalidate existing sessions)
      // Only check periodically to avoid hitting DB on every request — use token.lastChecked
      if (token.id && typeof token.id === 'string') {
        const now = Math.floor(Date.now() / 1000);
        const lastChecked = typeof token.lastChecked === 'number' ? token.lastChecked : 0;
        // Check every 5 minutes
        if (now - lastChecked > 300) {
          try {
            const { prisma } = await import('@quotecraft/database');
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id },
              select: { deletedAt: true, passwordChangedAt: true },
            });
            if (!dbUser || dbUser.deletedAt) {
              // User deleted — invalidate token
              return { ...token, id: '', email: '', name: '' };
            }
            // Invalidate JWT if password was changed after token was issued
            if (dbUser.passwordChangedAt && token.iat) {
              const changedAtSeconds = Math.floor(dbUser.passwordChangedAt.getTime() / 1000);
              if (token.iat < changedAtSeconds) {
                return { ...token, id: '', email: '', name: '' };
              }
            }
            token.lastChecked = now;
            token.dbCheckFailures = 0;
          } catch {
            // Track consecutive failures — invalidate after 3 to prevent indefinite access during outages
            const failures = (typeof token.dbCheckFailures === 'number' ? token.dbCheckFailures : 0) + 1;
            token.dbCheckFailures = failures;
            // 5 consecutive failures × 5 min interval = 25 min sustained outage before invalidation
            if (failures >= 5) {
              return { ...token, id: '', email: '', name: '' };
            }
          }
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = typeof token.id === 'string' ? token.id : String(token.id ?? '');
        session.user.email = typeof token.email === 'string' ? token.email : '';
        session.user.name = typeof token.name === 'string' ? token.name : '';
        session.user.avatarUrl = typeof token.avatarUrl === 'string' ? token.avatarUrl : null;
      }
      return session;
    },
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [GitHub({
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        })]
      : []),
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
