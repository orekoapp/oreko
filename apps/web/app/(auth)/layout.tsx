export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
