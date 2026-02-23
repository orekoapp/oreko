import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Appearance - Settings',
};

export default function AppearanceSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
