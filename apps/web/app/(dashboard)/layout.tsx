import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { AppHeader } from '@/components/dashboard/app-header';
import { SkipToContent } from '@/components/shared/skip-to-content';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { needsOnboarding } from '@/lib/onboarding/actions';
import { getUserWorkspaces, getActiveWorkspace } from '@/lib/workspace/actions';
import { getUnreadNotificationCount, getNotifications } from '@/lib/notifications/actions';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Redirect to onboarding if not completed
  const requiresOnboarding = await needsOnboarding();
  if (requiresOnboarding) {
    redirect('/onboarding');
  }

  // Fetch workspaces data and notifications
  const [workspaces, activeWorkspace, unreadCount, notifications] = await Promise.all([
    getUserWorkspaces(),
    getActiveWorkspace(),
    getUnreadNotificationCount(),
    getNotifications(10),
  ]);

  return (
    <>
      <SkipToContent />
      <SidebarProvider>
        <AppSidebar
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.avatarUrl,
          }}
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
        />
        <SidebarInset>
          <AppHeader user={session.user} unreadCount={unreadCount} notifications={notifications} />
          <main id="main-content" className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6 lg:p-8" tabIndex={-1}>
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
