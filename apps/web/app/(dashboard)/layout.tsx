import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardNav } from '@/components/dashboard/nav';
import { DashboardHeader } from '@/components/dashboard/header';
import { SkipToContent } from '@/components/shared/skip-to-content';
import { needsOnboarding } from '@/lib/onboarding/actions';

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

  return (
    <>
      <SkipToContent />
      <div className="flex min-h-screen">
        {/* Sidebar Navigation */}
        <DashboardNav />

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          <DashboardHeader user={session.user} />
          <main id="main-content" className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6 lg:p-8" tabIndex={-1}>
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
