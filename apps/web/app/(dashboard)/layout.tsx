import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { AppHeader } from '@/components/dashboard/app-header';
import { SkipToContent } from '@/components/shared/skip-to-content';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { needsOnboarding } from '@/lib/onboarding/actions';
import { getUserWorkspaces, getActiveWorkspace } from '@/lib/workspace/actions';
import { getUnreadNotificationCount, getNotifications } from '@/lib/notifications/actions';
import { DemoModeProvider } from '@/components/demo/demo-mode-provider';
import { Skeleton } from '@/components/ui/skeleton';

// Async server component — fetches sidebar data and renders
async function SidebarWithData({ user }: { user: { name: string | null; email: string; avatarUrl: string | null } }) {
  const results = await Promise.allSettled([
    getUserWorkspaces(),
    getActiveWorkspace(),
  ]);
  const workspaces = results[0].status === 'fulfilled' ? results[0].value : [];
  const activeWorkspaceResult = results[1].status === 'fulfilled' ? results[1].value : null;

  // If we can't fetch workspace data, fall back to first workspace or redirect
  if (!activeWorkspaceResult) {
    redirect('/login');
  }
  const activeWorkspace = activeWorkspaceResult!;

  return (
    <AppSidebar
      user={{
        name: user.name,
        email: user.email,
        image: user.avatarUrl,
      }}
      workspaces={workspaces}
      activeWorkspace={activeWorkspace}
    />
  );
}

// Async server component — fetches header data and renders
async function HeaderWithData({ user }: { user: { id: string; email: string; name: string | null; avatarUrl: string | null } }) {
  const headerResults = await Promise.allSettled([
    getUnreadNotificationCount(),
    getNotifications(10),
  ]);
  const unreadCount = headerResults[0].status === 'fulfilled' ? headerResults[0].value : 0;
  const notificationsResult = headerResults[1].status === 'fulfilled' ? headerResults[1].value : { data: [], total: 0 };

  return (
    <AppHeader user={user} unreadCount={unreadCount} notifications={notificationsResult.data} />
  );
}

// Lightweight skeleton for sidebar while data loads
function SidebarFallback() {
  return (
    <div className="flex h-full w-[var(--sidebar-width)] flex-col border-r bg-sidebar p-4 space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}

// Lightweight skeleton for header while data loads
function HeaderFallback() {
  return (
    <div className="flex h-14 items-center gap-4 border-b px-4">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-4 w-32" />
      <div className="ml-auto flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Only block on onboarding check — this is needed for the redirect
  const requiresOnboarding = await needsOnboarding();
  if (requiresOnboarding) {
    redirect('/onboarding');
  }

  return (
    <>
      <SkipToContent />
      <SidebarProvider>
        <Suspense fallback={<SidebarFallback />}>
          <SidebarWithData user={session.user} />
        </Suspense>
        <SidebarInset>
          <Suspense fallback={<HeaderFallback />}>
            <HeaderWithData user={session.user} />
          </Suspense>
          <DemoModeProvider>
            <main id="main-content" className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6 lg:p-8" tabIndex={-1}>
              <div className="mx-auto max-w-7xl">
                {children}
              </div>
            </main>
          </DemoModeProvider>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
