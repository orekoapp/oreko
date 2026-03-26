export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@quotecraft/database';
import { ChangePasswordForm } from './change-password-form';
import { ProfileForm } from './profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

async function getUserProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Bug #90: Check password existence without fetching the full hash into memory
  const [{ has_password }] = await prisma.$queryRaw<[{ has_password: boolean }]>`
    SELECT password_hash IS NOT NULL AS has_password FROM "User" WHERE id = ${session.user.id}
  `;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    hasPassword: has_password,
    oauthProviders: user.accounts.map((a) => a.provider),
  };
}

export const metadata = {
  title: 'Account Settings',
};

export default async function AccountSettingsPage() {
  const user = await getUserProfile();

  return (
    <div className="space-y-4">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ProfileFormSkeleton />}>
            <ProfileForm
              initialName={user.name || ''}
              initialEmail={user.email}
            />
          </Suspense>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            {user.hasPassword
              ? 'Change your password to keep your account secure.'
              : 'Set a password to enable email/password login.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.oauthProviders.length > 0 && !user.hasPassword && (
            <Alert className="mb-4">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                You signed up with {user.oauthProviders.join(' and ')}.
                Setting a password will allow you to also log in with your email.
              </AlertDescription>
            </Alert>
          )}
          <Suspense fallback={<PasswordFormSkeleton />}>
            <ChangePasswordForm hasExistingPassword={user.hasPassword} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Connected Accounts Section */}
      {user.oauthProviders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>
              Accounts you&apos;ve connected for sign-in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.oauthProviders.map((provider) => (
                <div
                  key={provider}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    {provider === 'google' && (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    {provider === 'github' && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    )}
                    <span className="font-medium capitalize">{provider}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Connected</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProfileFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-24" />
    </div>
  );
}

function PasswordFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
