'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import {
  ArrowRight,
  Check,
  FileText,
  Users,
  CreditCard,
  BarChart3,
  Bell,
  Search,
  Plus,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Download,
  Eye,
  Sparkles,
  Database,
  Zap,
} from 'lucide-react';

// Actual Shadcn Theme configurations from official sources
const themes = {
  // Official Shadcn Blue Theme
  'default-blue': {
    name: 'Default + Blue',
    tagline: 'Official Shadcn',
    description: 'The official shadcn/ui blue theme. Trust & reliability for professional services, financial tools, and business applications.',
    badge: 'Official',
    icon: Zap,
    heroGradient: 'from-blue-50/80 via-slate-50 to-white dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950',
    logoGradient: 'from-blue-600 to-blue-700',
    accentColor: 'blue',
    // Light mode CSS (HSL format - official shadcn blue)
    lightCss: `
      --background: 0 0% 100%;
      --foreground: 222.2 84% 4.9%;
      --card: 0 0% 100%;
      --card-foreground: 222.2 84% 4.9%;
      --popover: 0 0% 100%;
      --popover-foreground: 222.2 84% 4.9%;
      --primary: 221.2 83.2% 53.3%;
      --primary-foreground: 210 40% 98%;
      --secondary: 210 40% 96.1%;
      --secondary-foreground: 222.2 47.4% 11.2%;
      --muted: 210 40% 96.1%;
      --muted-foreground: 215.4 16.3% 46.9%;
      --accent: 210 40% 96.1%;
      --accent-foreground: 222.2 47.4% 11.2%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 210 40% 98%;
      --border: 214.3 31.8% 91.4%;
      --input: 214.3 31.8% 91.4%;
      --ring: 221.2 83.2% 53.3%;
      --radius: 0.5rem;
      --chart-1: 221.2 83.2% 53.3%;
      --chart-2: 212 95% 68%;
      --chart-3: 216 92% 60%;
      --chart-4: 210 98% 78%;
      --chart-5: 212 97% 87%;
    `,
    // Dark mode CSS
    darkCss: `
      --background: 222.2 84% 4.9%;
      --foreground: 210 40% 98%;
      --card: 222.2 84% 4.9%;
      --card-foreground: 210 40% 98%;
      --popover: 222.2 84% 4.9%;
      --popover-foreground: 210 40% 98%;
      --primary: 217.2 91.2% 59.8%;
      --primary-foreground: 222.2 47.4% 11.2%;
      --secondary: 217.2 32.6% 17.5%;
      --secondary-foreground: 210 40% 98%;
      --muted: 217.2 32.6% 17.5%;
      --muted-foreground: 215 20.2% 65.1%;
      --accent: 217.2 32.6% 17.5%;
      --accent-foreground: 210 40% 98%;
      --destructive: 0 62.8% 30.6%;
      --destructive-foreground: 210 40% 98%;
      --border: 217.2 32.6% 17.5%;
      --input: 217.2 32.6% 17.5%;
      --ring: 224.3 76.3% 48%;
      --chart-1: 221.2 83.2% 53.3%;
      --chart-2: 217.2 91.2% 59.8%;
      --chart-3: 224.3 76.3% 48%;
      --chart-4: 210 98% 78%;
      --chart-5: 212 97% 87%;
    `,
  },
  // Claude Theme - Anthropic inspired warm terracotta
  claude: {
    name: 'Claude',
    tagline: 'Anthropic Inspired',
    description: 'Warm terracotta orange that feels human. Cream backgrounds that invite conversation. Intelligence that feels approachable.',
    badge: 'AI-Native',
    icon: Sparkles,
    heroGradient: 'from-orange-50/80 via-amber-50/50 to-white dark:from-stone-950 dark:via-orange-950/20 dark:to-stone-950',
    logoGradient: 'from-orange-500 to-amber-600',
    accentColor: 'orange',
    // Light mode - warm terracotta with cream backgrounds
    lightCss: `
      --background: 40 33% 98%;
      --foreground: 20 14% 15%;
      --card: 40 33% 99%;
      --card-foreground: 20 14% 15%;
      --popover: 40 33% 99%;
      --popover-foreground: 20 14% 15%;
      --primary: 24 75% 50%;
      --primary-foreground: 40 33% 98%;
      --secondary: 35 30% 94%;
      --secondary-foreground: 20 14% 20%;
      --muted: 35 20% 93%;
      --muted-foreground: 20 10% 45%;
      --accent: 35 30% 92%;
      --accent-foreground: 20 14% 20%;
      --destructive: 0 84% 60%;
      --destructive-foreground: 0 0% 100%;
      --border: 30 20% 88%;
      --input: 30 20% 88%;
      --ring: 24 75% 50%;
      --radius: 0.625rem;
      --chart-1: 24 75% 50%;
      --chart-2: 35 80% 56%;
      --chart-3: 45 90% 58%;
      --chart-4: 16 70% 55%;
      --chart-5: 30 85% 60%;
    `,
    // Dark mode - evening warmth
    darkCss: `
      --background: 20 14% 10%;
      --foreground: 40 20% 94%;
      --card: 20 14% 12%;
      --card-foreground: 40 20% 94%;
      --popover: 20 14% 12%;
      --popover-foreground: 40 20% 94%;
      --primary: 24 80% 55%;
      --primary-foreground: 20 14% 10%;
      --secondary: 20 12% 18%;
      --secondary-foreground: 40 20% 94%;
      --muted: 20 12% 18%;
      --muted-foreground: 30 15% 60%;
      --accent: 20 15% 20%;
      --accent-foreground: 40 20% 94%;
      --destructive: 0 70% 45%;
      --destructive-foreground: 0 0% 100%;
      --border: 20 12% 20%;
      --input: 20 12% 20%;
      --ring: 24 80% 55%;
      --chart-1: 24 80% 55%;
      --chart-2: 35 75% 50%;
      --chart-3: 45 85% 52%;
      --chart-4: 16 65% 50%;
      --chart-5: 30 80% 55%;
    `,
  },
  // Supabase Theme - Developer-friendly emerald green
  supabase: {
    name: 'Supabase',
    tagline: 'Developer Native',
    description: 'That distinctive green that says "database operations just work." Clean, modern aesthetics for developer tools and technical products.',
    badge: 'Dev-Friendly',
    icon: Database,
    heroGradient: 'from-emerald-50/80 via-teal-50/30 to-white dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-950',
    logoGradient: 'from-emerald-500 to-teal-600',
    accentColor: 'emerald',
    // Light mode - clean with emerald primary
    lightCss: `
      --background: 0 0% 99%;
      --foreground: 160 10% 12%;
      --card: 0 0% 100%;
      --card-foreground: 160 10% 12%;
      --popover: 0 0% 100%;
      --popover-foreground: 160 10% 12%;
      --primary: 160 84% 39%;
      --primary-foreground: 160 10% 98%;
      --secondary: 160 15% 95%;
      --secondary-foreground: 160 10% 15%;
      --muted: 160 10% 94%;
      --muted-foreground: 160 8% 45%;
      --accent: 160 15% 93%;
      --accent-foreground: 160 10% 15%;
      --destructive: 0 84% 60%;
      --destructive-foreground: 0 0% 100%;
      --border: 160 10% 90%;
      --input: 160 10% 90%;
      --ring: 160 84% 39%;
      --radius: 0.5rem;
      --chart-1: 160 84% 39%;
      --chart-2: 168 80% 45%;
      --chart-3: 152 76% 35%;
      --chart-4: 174 72% 50%;
      --chart-5: 145 70% 42%;
    `,
    // Dark mode - comfortable for late-night coding
    darkCss: `
      --background: 160 15% 8%;
      --foreground: 160 10% 95%;
      --card: 160 15% 10%;
      --card-foreground: 160 10% 95%;
      --popover: 160 15% 10%;
      --popover-foreground: 160 10% 95%;
      --primary: 160 75% 45%;
      --primary-foreground: 160 15% 8%;
      --secondary: 160 12% 15%;
      --secondary-foreground: 160 10% 95%;
      --muted: 160 12% 15%;
      --muted-foreground: 160 10% 60%;
      --accent: 160 15% 18%;
      --accent-foreground: 160 10% 95%;
      --destructive: 0 70% 45%;
      --destructive-foreground: 0 0% 100%;
      --border: 160 12% 18%;
      --input: 160 12% 18%;
      --ring: 160 75% 45%;
      --chart-1: 160 75% 45%;
      --chart-2: 168 70% 50%;
      --chart-3: 152 65% 40%;
      --chart-4: 174 65% 55%;
      --chart-5: 145 60% 48%;
    `,
  },
} as const;

type ThemeKey = keyof typeof themes;

// Mock data
const stats = [
  { label: 'Total Revenue', value: '$124,500', change: '+12.5%', up: true, icon: CreditCard },
  { label: 'Active Quotes', value: '23', change: '+3', up: true, icon: FileText },
  { label: 'Clients', value: '48', change: '+5', up: true, icon: Users },
  { label: 'Conversion Rate', value: '68%', change: '-2%', up: false, icon: BarChart3 },
];

const recentQuotes = [
  { id: 'Q-2024-001', client: 'Acme Corp', amount: '$12,500', status: 'sent', date: '2 hours ago' },
  { id: 'Q-2024-002', client: 'TechStart Inc', amount: '$8,750', status: 'viewed', date: '5 hours ago' },
  { id: 'Q-2024-003', client: 'Design Studio', amount: '$3,200', status: 'accepted', date: '1 day ago' },
  { id: 'Q-2024-004', client: 'Global Media', amount: '$15,000', status: 'draft', date: '2 days ago' },
];

const statusConfig = {
  draft: { icon: Clock, label: 'Draft' },
  sent: { icon: Send, label: 'Sent' },
  viewed: { icon: Eye, label: 'Viewed' },
  accepted: { icon: CheckCircle2, label: 'Accepted' },
  rejected: { icon: XCircle, label: 'Rejected' },
};

export default function ThemeShowcasePage({ params }: { params: Promise<{ theme: string }> }) {
  const resolvedParams = use(params);
  const themeKey = resolvedParams.theme as ThemeKey;

  if (!themes[themeKey]) {
    notFound();
  }

  const theme = themes[themeKey];
  const otherThemes = Object.keys(themes).filter((t) => t !== themeKey) as ThemeKey[];
  const ThemeIcon = theme.icon;

  return (
    <>
      {/* Inject theme CSS variables */}
      <style jsx global>{`
        :root {
          ${theme.lightCss}
        }
        .dark {
          ${theme.darkCss}
        }
      `}</style>

      <div className={`min-h-screen bg-gradient-to-br ${theme.heroGradient}`}>
        {/* Theme Switcher Banner */}
        <div className="bg-foreground text-background py-3 border-b border-border/10">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm opacity-70">Viewing:</span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground">
                <ThemeIcon className="h-3.5 w-3.5" />
                {theme.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-background/20 text-background/80">
                {theme.tagline}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-70">Compare:</span>
              {otherThemes.map((t) => (
                <Link
                  key={t}
                  href={`/theme-showcase/${t}`}
                  className="px-3 py-1.5 rounded-md text-sm font-medium bg-background/10 hover:bg-background/20 transition-colors"
                >
                  {themes[t].name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${theme.logoGradient} flex items-center justify-center shadow-sm`}>
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-foreground">Oreko</span>
                </Link>
                <nav className="hidden md:flex items-center gap-1">
                  <span className="px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md">Dashboard</span>
                  <span className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md cursor-pointer transition-colors">Quotes</span>
                  <span className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md cursor-pointer transition-colors">Invoices</span>
                  <span className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md cursor-pointer transition-colors">Clients</span>
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Search...</span>
                  <kbd className="px-1.5 py-0.5 text-xs bg-background rounded border border-border font-mono">⌘K</kbd>
                </div>
                <button className="relative p-2 rounded-lg hover:bg-muted border border-transparent hover:border-border transition-colors">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-sm font-semibold shadow-sm">
                  JD
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, here&apos;s your business overview.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              New Quote
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-medium ${stat.up ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                    {stat.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Quotes */}
            <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-card-foreground">Recent Quotes</h2>
                <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">View All</button>
              </div>
              <div className="divide-y divide-border">
                {recentQuotes.map((quote) => {
                  const status = statusConfig[quote.status as keyof typeof statusConfig];
                  return (
                    <div key={quote.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <status.icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium text-card-foreground">{quote.client}</div>
                            <div className="text-sm text-muted-foreground">{quote.id}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-card-foreground">{quote.amount}</div>
                          <div className="text-sm text-muted-foreground">{quote.date}</div>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-muted">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions + Revenue Chart */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 text-primary transition-all">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Create Quote</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Add Client</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Download className="h-5 w-5" />
                    <span className="font-medium">Export Report</span>
                  </button>
                </div>
              </div>

              {/* Mini Chart */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-card-foreground mb-4">Revenue Trend</h2>
                <div className="flex items-end justify-between h-32 gap-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature Showcase */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-xl bg-gradient-to-br ${theme.logoGradient} text-white shadow-lg`}>
              <h3 className="text-lg font-semibold mb-2">Visual Quote Builder</h3>
              <p className="text-white/80 text-sm mb-4">Drag-and-drop blocks to create stunning quotes in minutes.</p>
              <button className="flex items-center gap-2 text-sm font-medium bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                Try it now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">E-Signatures</h3>
              <p className="text-muted-foreground text-sm">Get quotes signed online with legally binding signatures.</p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Accept Payments</h3>
              <p className="text-muted-foreground text-sm">Get paid faster with integrated Stripe payments.</p>
            </div>
          </div>

          {/* Theme Info Card */}
          <div className="mt-12 p-8 rounded-2xl bg-card border border-border shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${theme.logoGradient}`}>
                    <ThemeIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    {theme.badge}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-card-foreground mb-2">{theme.name} Theme</h2>
                <p className="text-muted-foreground max-w-2xl">{theme.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="px-6 py-3 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Use This Theme
                </Link>
              </div>
            </div>

            {/* Color Palette Preview */}
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Color Palette</h3>
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-lg bg-primary shadow-sm" />
                  <span className="text-xs text-muted-foreground">Primary</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-lg bg-secondary border border-border" />
                  <span className="text-xs text-muted-foreground">Secondary</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-lg bg-muted border border-border" />
                  <span className="text-xs text-muted-foreground">Muted</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-lg bg-accent border border-border" />
                  <span className="text-xs text-muted-foreground">Accent</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-lg bg-background border border-border" />
                  <span className="text-xs text-muted-foreground">Background</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-lg bg-card border border-border" />
                  <span className="text-xs text-muted-foreground">Card</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-lg bg-destructive" />
                  <span className="text-xs text-muted-foreground">Destructive</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${theme.logoGradient} flex items-center justify-center`}>
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-foreground">Oreko</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Theme showcase for stakeholder review
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
