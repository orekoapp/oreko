import { Logo } from '@/components/shared';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/50">
      {/* Header with logo linking to homepage */}
      <header className="w-full py-6">
        <div className="container mx-auto px-4">
          <Logo href="/" />
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center pb-16">
        <div className="w-full max-w-md px-4">{children}</div>
      </div>
    </div>
  );
}
