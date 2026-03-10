import Link from 'next/link';
import {
  Building2,
  Palette,
  Receipt,
  FileText,
  CreditCard,
  Percent,
  Mail,
  Users,
  Settings2,
  Wallet,
  UserCircle,
  SunMoon,
  Webhook,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Settings',
};

const settingsLinks = [
  {
    href: '/settings/account',
    icon: UserCircle,
    title: 'Account',
    description: 'Your profile, password, and security settings',
  },
  {
    href: '/settings/business',
    icon: Building2,
    title: 'Business Profile',
    description: 'Company name, address, and contact information',
  },
  {
    href: '/settings/branding',
    icon: Palette,
    title: 'Branding',
    description: 'Colors, fonts, and visual customization',
  },
  {
    href: '/settings/appearance',
    icon: SunMoon,
    title: 'Appearance',
    description: 'Theme, font size, and sidebar style preferences',
  },
  {
    href: '/settings/team',
    icon: Users,
    title: 'Team Members',
    description: 'Manage who has access to this workspace',
  },
  {
    href: '/settings/workspace',
    icon: Settings2,
    title: 'Workspace',
    description: 'Workspace name, URL, and settings',
  },
  {
    href: '/settings/billing',
    icon: Wallet,
    title: 'Billing & Subscription',
    description: 'Manage your plan and payment methods',
  },
  {
    href: '/settings/tax-rates',
    icon: Percent,
    title: 'Tax Rates',
    description: 'Configure tax rates for quotes and invoices',
  },
  {
    href: '/settings/quotes',
    icon: FileText,
    title: 'Quote Settings',
    description: 'Quote numbering and default settings',
  },
  {
    href: '/settings/invoices',
    icon: Receipt,
    title: 'Invoice Settings',
    description: 'Invoice numbering and payment terms',
  },
  {
    href: '/settings/emails',
    icon: Mail,
    title: 'Email Templates',
    description: 'Customize email notifications sent to clients',
  },
  {
    href: '/settings/payments',
    icon: CreditCard,
    title: 'Payment Settings',
    description: 'Stripe Connect and payment processing options',
  },
  {
    href: '/settings/webhooks',
    icon: Webhook,
    title: 'Webhooks',
    description: 'Configure outbound webhooks for external integrations',
  },
];

export default function SettingsPage() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your workspace and business settings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <link.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{link.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
