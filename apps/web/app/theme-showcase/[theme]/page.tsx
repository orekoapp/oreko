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
  Settings,
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
} from 'lucide-react';

// Theme configurations
const themes = {
  blue: {
    name: 'Corporate Blue',
    description: 'Trust & Reliability — Perfect for professional services',
    badge: 'Most Popular',
    gradient: 'from-blue-600 to-blue-800',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/30',
    badgeText: 'text-blue-700 dark:text-blue-300',
    accentDot: 'bg-blue-500',
    heroGradient: 'from-blue-50/50 to-white dark:from-blue-950/30 dark:to-slate-950',
    primaryBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondaryBtn: 'border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300',
    cardAccent: 'border-l-blue-500',
    statUp: 'text-emerald-600',
    statDown: 'text-red-500',
    chartBar: 'bg-blue-500',
    link: 'text-blue-600 hover:text-blue-700',
    ring: 'ring-blue-500',
    css: `
      --primary: 217.2 91.2% 59.8%;
      --primary-foreground: 222.2 47.4% 11.2%;
      --ring: 217.2 91.2% 59.8%;
      --accent: 214.3 31.8% 91.4%;
    `,
  },
  violet: {
    name: 'Modern Violet',
    description: 'Creative & Premium — For agencies and designers',
    badge: 'Designer Pick',
    gradient: 'from-violet-600 to-purple-800',
    badgeBg: 'bg-violet-100 dark:bg-violet-900/30',
    badgeText: 'text-violet-700 dark:text-violet-300',
    accentDot: 'bg-violet-500',
    heroGradient: 'from-violet-50/50 to-white dark:from-violet-950/30 dark:to-slate-950',
    primaryBtn: 'bg-violet-600 hover:bg-violet-700 text-white',
    secondaryBtn: 'border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300',
    cardAccent: 'border-l-violet-500',
    statUp: 'text-emerald-600',
    statDown: 'text-red-500',
    chartBar: 'bg-violet-500',
    link: 'text-violet-600 hover:text-violet-700',
    ring: 'ring-violet-500',
    css: `
      --primary: 262.1 83.3% 57.8%;
      --primary-foreground: 210 40% 98%;
      --ring: 262.1 83.3% 57.8%;
      --accent: 270 50% 95%;
    `,
  },
  emerald: {
    name: 'Fresh Emerald',
    description: 'Growth & Success — For startups and tech companies',
    badge: 'Trending',
    gradient: 'from-emerald-600 to-teal-800',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    accentDot: 'bg-emerald-500',
    heroGradient: 'from-emerald-50/50 to-white dark:from-emerald-950/30 dark:to-slate-950',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    secondaryBtn: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300',
    cardAccent: 'border-l-emerald-500',
    statUp: 'text-emerald-600',
    statDown: 'text-red-500',
    chartBar: 'bg-emerald-500',
    link: 'text-emerald-600 hover:text-emerald-700',
    ring: 'ring-emerald-500',
    css: `
      --primary: 160.1 84.1% 39.4%;
      --primary-foreground: 210 40% 98%;
      --ring: 160.1 84.1% 39.4%;
      --accent: 160 50% 95%;
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
  draft: { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
  sent: { icon: Send, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  viewed: { icon: Eye, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  accepted: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
};

export default function ThemeShowcasePage({ params }: { params: Promise<{ theme: string }> }) {
  const resolvedParams = use(params);
  const themeKey = resolvedParams.theme as ThemeKey;

  if (!themes[themeKey]) {
    notFound();
  }

  const theme = themes[themeKey];
  const otherThemes = Object.keys(themes).filter((t) => t !== themeKey) as ThemeKey[];

  return (
    <>
      {/* Inject theme CSS */}
      <style jsx global>{`
        :root {
          ${theme.css}
        }
      `}</style>

      <div className={`min-h-screen bg-gradient-to-b ${theme.heroGradient}`}>
        {/* Theme Switcher Banner */}
        <div className="bg-slate-900 text-white py-3">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Theme Preview:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${theme.badgeBg} ${theme.badgeText}`}>
                {theme.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Switch to:</span>
              {otherThemes.map((t) => (
                <Link
                  key={t}
                  href={`/theme-showcase/${t}`}
                  className="px-3 py-1 rounded-md text-sm font-medium bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  {themes[t].name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">QuoteCraft</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                  <span className={`text-sm font-medium ${theme.link}`}>Dashboard</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">Quotes</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">Invoices</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">Clients</span>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Search className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Search...</span>
                  <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">⌘K</kbd>
                </div>
                <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${theme.accentDot}`} />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-sm font-medium">
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
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Welcome back, here&apos;s your business overview.</p>
            </div>
            <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${theme.primaryBtn}`}>
              <Plus className="h-4 w-4" />
              New Quote
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${theme.badgeBg}`}>
                    <stat.icon className={`h-5 w-5 ${theme.badgeText}`} />
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-medium ${stat.up ? theme.statUp : theme.statDown}`}>
                    {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Quotes */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Quotes</h2>
                <button className={`text-sm font-medium ${theme.link}`}>View All</button>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {recentQuotes.map((quote) => {
                  const status = statusConfig[quote.status as keyof typeof statusConfig];
                  return (
                    <div key={quote.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg ${status.bg} flex items-center justify-center`}>
                            <status.icon className={`h-5 w-5 ${status.color}`} />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{quote.client}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{quote.id}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900 dark:text-white">{quote.amount}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{quote.date}</div>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                          <MoreHorizontal className="h-4 w-4 text-slate-400" />
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
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-solid transition-all ${theme.secondaryBtn}`}>
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Create Quote</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Add Client</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                    <Download className="h-5 w-5" />
                    <span className="font-medium">Export Report</span>
                  </button>
                </div>
              </div>

              {/* Mini Chart */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue Trend</h2>
                <div className="flex items-end justify-between h-32 gap-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t-sm ${theme.chartBar} transition-all hover:opacity-80`}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-slate-400">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature Showcase */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-xl bg-gradient-to-br ${theme.gradient} text-white`}>
              <h3 className="text-lg font-semibold mb-2">Visual Quote Builder</h3>
              <p className="text-white/80 text-sm mb-4">Drag-and-drop blocks to create stunning quotes in minutes.</p>
              <button className="flex items-center gap-2 text-sm font-medium bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                Try it now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className={`w-10 h-10 rounded-lg ${theme.badgeBg} flex items-center justify-center mb-4`}>
                <Check className={`h-5 w-5 ${theme.badgeText}`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">E-Signatures</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Get quotes signed online with legally binding signatures.</p>
            </div>
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className={`w-10 h-10 rounded-lg ${theme.badgeBg} flex items-center justify-center mb-4`}>
                <CreditCard className={`h-5 w-5 ${theme.badgeText}`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Accept Payments</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Get paid faster with integrated Stripe payments.</p>
            </div>
          </div>

          {/* Theme Info */}
          <div className="mt-12 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.badgeBg} ${theme.badgeText} text-sm font-medium mb-3`}>
                  {theme.badge}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{theme.name} Theme</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-xl">{theme.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${theme.primaryBtn}`}
                >
                  Use This Theme
                </Link>
                <button className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                  <FileText className="h-3 w-3 text-white" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">QuoteCraft</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Theme showcase for stakeholder review. © 2024 QuoteCraft
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
