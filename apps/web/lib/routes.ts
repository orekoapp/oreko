/**
 * Application route constants
 * Centralizes route paths to prevent typos and enable easy refactoring.
 */

export const ROUTES = {
  // Auth
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  onboarding: '/onboarding',

  // Dashboard
  dashboard: '/dashboard',

  // Quotes
  quotes: '/quotes',
  newQuote: '/quotes/new',
  quoteBuilder: '/quotes/new/builder',
  quoteDetail: (id: string) => `/quotes/${id}`,

  // Invoices
  invoices: '/invoices',
  newInvoice: '/invoices/new',
  invoiceDetail: (id: string) => `/invoices/${id}`,

  // Clients
  clients: '/clients',
  newClient: '/clients/new',
  clientDetail: (id: string) => `/clients/${id}`,

  // Projects
  projects: '/projects',
  projectDetail: (id: string) => `/projects/${id}`,

  // Rate Cards
  rateCards: '/rate-cards',

  // Templates & Contracts
  templates: '/templates',
  contracts: '/contracts',

  // Analytics
  analytics: '/analytics',

  // Settings
  settings: '/settings',
  settingsAccount: '/settings/account',
  settingsTeam: '/settings/team',
  settingsInvoice: '/settings/invoice',
  settingsEmails: '/settings/emails',
  settingsAppearance: '/settings/appearance',
  settingsBilling: '/settings/billing',
  settingsBusiness: '/settings/business',
  settingsBranding: '/settings/branding',
  settingsPayments: '/settings/payments',
  settingsQuotes: '/settings/quotes',
  settingsWorkspace: '/settings/workspace',

  // Help
  help: '/help',

  // Client Portal (public)
  quotePortal: (token: string) => `/q/${token}`,
  invoicePortal: (token: string) => `/i/${token}`,
  contractPortal: (token: string) => `/c/${token}`,
} as const;
