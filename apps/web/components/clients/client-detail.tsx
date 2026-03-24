'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Pencil,
  Trash2,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteClient } from '@/lib/clients/actions';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { ClientDetail as ClientDetailType, ClientActivity } from '@/lib/clients/types';
import { toast } from 'sonner';

interface ClientDetailProps {
  client: ClientDetailType;
  activities: ClientActivity[];
  currency?: string;
}

export function ClientDetail({ client, activities, currency = 'USD' }: ClientDetailProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteClient(client.id);
      toast.success('Client deleted successfully');
      router.push('/clients');
    } catch {
      toast.error('Failed to delete client');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalRevenue = client.totalRevenue;
  const outstanding = client.outstandingAmount;
  const collected = totalRevenue - outstanding;
  const collectionProgress = totalRevenue > 0 ? (collected / totalRevenue) * 100 : 0;

  const addressString = client.address
    ? [
        client.address.street,
        client.address.city,
        client.address.state,
        client.address.postalCode,
        client.address.country,
      ]
        .filter(Boolean)
        .join(', ')
    : null;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          href="/clients"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Clients
        </Link>
        <span>/</span>
        <span className="text-foreground">{client.company || client.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {client.company || client.name}
            </h1>
            <Badge
              variant={client.type === 'company' ? 'default' : 'secondary'}
              className="font-normal"
            >
              {client.type === 'company' ? 'Company' : 'Individual'}
            </Badge>
            {client.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
          {client.company && client.company !== client.name && (
            <p className="text-muted-foreground">{client.name}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/clients/${client.id}/edit`}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/quotes/new?clientId=${client.id}`}>New quote</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/invoices/new?clientId=${client.id}`}>New invoice</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contact Details */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
        <a
          href={`mailto:${client.email}`}
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <Mail className="h-3.5 w-3.5" />
          {client.email}
        </a>
        {client.phone && (
          <a
            href={`tel:${client.phone}`}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            {client.phone}
          </a>
        )}
        {/* Bug #204: Ensure website link has protocol to prevent relative URL navigation */}
        {client.website && (
          <a
            href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            {client.website}
          </a>
        )}
        {addressString && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {addressString}
          </span>
        )}
      </div>

      {/* Financial Summary */}
      <div className="rounded-lg border bg-card p-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-semibold tracking-tight mt-1">
              {formatCurrency(totalRevenue, currency)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className="text-2xl font-semibold tracking-tight mt-1 text-amber-600">
              {formatCurrency(outstanding, currency)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Quotes</p>
            <p className="text-2xl font-semibold tracking-tight mt-1">
              {client._count?.quotes || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Invoices</p>
            <p className="text-2xl font-semibold tracking-tight mt-1">
              {client._count?.invoices || 0}
            </p>
          </div>
        </div>
        {totalRevenue > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Collection progress</span>
              <span>{Math.round(collectionProgress)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${collectionProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Main Content */}
        <div className="space-y-10">
          {/* Invoices */}
          <section>
            <SectionHeader
              title="Invoices"
              count={client.invoices?.length || 0}
              addHref={`/invoices/new?clientId=${client.id}`}
            />
            {client.invoices && client.invoices.length > 0 ? (
              <div className="rounded-lg border divide-y">
                {client.invoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Due {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium tabular-nums">
                        {formatCurrency(Number(invoice.total), (invoice as any).currency || currency)}
                      </span>
                      <StatusBadge status={invoice.status} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState label="No invoices yet" />
            )}
          </section>

          {/* Quotes */}
          <section>
            <SectionHeader
              title="Quotes"
              count={client.quotes?.length || 0}
              addHref={`/quotes/new?clientId=${client.id}`}
            />
            {client.quotes && client.quotes.length > 0 ? (
              <div className="rounded-lg border divide-y">
                {client.quotes.map((quote) => (
                  <Link
                    key={quote.id}
                    href={`/quotes/${quote.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{quote.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(quote.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium tabular-nums">
                        {formatCurrency(Number(quote.total), (quote as any).currency || currency)}
                      </span>
                      <StatusBadge status={quote.status} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState label="No quotes yet" />
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Additional Contacts (company-specific) */}
          {client.contacts.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-4">People</h2>
              <div className="rounded-lg border divide-y">
                {client.contacts.map((contact) => (
                  <div key={contact.id} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{contact.name}</p>
                      {contact.isPrimary && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          Primary
                        </Badge>
                      )}
                    </div>
                    {contact.role && (
                      <p className="text-xs text-muted-foreground mt-0.5">{contact.role}</p>
                    )}
                    <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-muted-foreground">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="hover:text-foreground transition-colors"
                        >
                          {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="hover:text-foreground transition-colors"
                        >
                          {contact.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          {client.notes && (
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-4">Notes</h2>
              <div className="rounded-lg border px-4 py-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{client.notes}</p>
              </div>
            </section>
          )}

          {/* Activity */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Activity</h2>
            {activities.length > 0 ? (
              <div className="space-y-0">
                {activities.map((item, i) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative flex flex-col items-center">
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full mt-1.5 shrink-0 bg-gray-400',
                          (item.type === 'quote_accepted' || item.type === 'invoice_paid') &&
                            'bg-emerald-500',
                          (item.type === 'quote_sent' || item.type === 'invoice_sent') &&
                            'bg-blue-500',
                          (item.type === 'quote_declined' || item.type === 'invoice_overdue') &&
                            'bg-red-500',
                        )}
                      />
                      {i < activities.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1.5" />
                      )}
                    </div>
                    <div className="pb-5">
                      <p className="text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeDate(item.date)}
                        {item.amount != null && ` \u00b7 ${formatCurrency(item.amount, currency)}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            )}
          </section>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {client.company || client.name}? This action
              cannot be undone. Associated quotes and invoices will remain but will no longer be
              linked to this client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------- Shared sub-components ---------- */

function SectionHeader({
  title,
  count,
  addHref,
}: {
  title: string;
  count: number;
  addHref?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        {count > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums bg-muted rounded-full px-2 py-0.5">
            {count}
          </span>
        )}
      </div>
      {addHref && (
        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
          <Link href={addHref}>
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Link>
        </Button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs capitalize',
        (status === 'paid' || status === 'accepted') &&
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400',
        status === 'sent' &&
          'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400',
        (status === 'draft' || status === 'viewed') &&
          'border-border bg-muted text-muted-foreground',
        (status === 'overdue' || status === 'declined' || status === 'expired') &&
          'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400',
      )}
    >
      {status}
    </Badge>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground py-2">{label}</p>;
}

// Low #88: Handle future dates (e.g. upcoming due dates)
function formatRelativeDate(date: Date) {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);

  // Future dates
  if (days < 0) {
    const futureDays = Math.abs(days);
    if (futureDays === 1) return 'Tomorrow';
    if (futureDays < 7) return `In ${futureDays} days`;
    if (futureDays < 30) return `In ${Math.floor(futureDays / 7)} weeks`;
    return formatDate(date);
  }

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(date);
}
