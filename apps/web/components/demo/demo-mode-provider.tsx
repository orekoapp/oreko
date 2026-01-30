import { isDemoSession } from '@/lib/demo/guard';
import { DemoBannerWrapper } from './demo-banner';

/**
 * Server component that checks demo mode and provides the banner
 * Add this to your dashboard layout to show the demo banner
 */
export async function DemoModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDemo = await isDemoSession();

  return (
    <>
      <DemoBannerWrapper isDemo={isDemo} />
      {/* Add padding to account for the fixed banner when in demo mode */}
      <div className={isDemo ? 'pt-10' : ''}>{children}</div>
    </>
  );
}

/**
 * Hook-compatible function to get demo status
 * For use in client components that need to check demo mode
 */
export async function getDemoStatus(): Promise<{
  isDemo: boolean;
  message: string | null;
}> {
  const isDemo = await isDemoSession();

  return {
    isDemo,
    message: isDemo
      ? 'You are using a demo account. Changes will not be saved.'
      : null,
  };
}
