'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Pencil,
  Trash2,
  FileText,
  Receipt,
  User,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { deleteClient } from '@/lib/clients/actions';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ClientDetail as ClientDetailType, ClientActivity } from '@/lib/clients/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ClientDetailProps {
  client: ClientDetailType;
  activities: ClientActivity[];
}

export function ClientDetail({ client, activities }: ClientDetailProps) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              {client.type === 'company' ? (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{client.company || client.name}</h1>
              {client.company && (
                <p className="text-muted-foreground">{client.name}</p>
              )}
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={client.type === 'company' ? 'default' : 'secondary'}>
                  {client.type === 'company' ? 'Company' : 'Individual'}
                </Badge>
                {client.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/clients/${client.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Quotes</p>
                <p className="text-2xl font-bold">{client._count?.quotes || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                <Receipt className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{client._count?.invoices || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(client.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">{formatCurrency(client.outstandingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Info */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${client.email}`} className="text-sm hover:underline">
                  {client.email}
                </a>
              </div>
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${client.phone}`} className="text-sm hover:underline">
                    {client.phone}
                  </a>
                </div>
              )}
              {client.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    {client.website}
                  </a>
                </div>
              )}
              {addressString && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{addressString}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Contacts */}
          {client.contacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Additional Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.contacts.map((contact) => (
                  <div key={contact.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{contact.name}</span>
                      {contact.isPrimary && (
                        <Badge variant="secondary" className="text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                    {contact.role && (
                      <p className="text-sm text-muted-foreground">{contact.role}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                      <a href={`mailto:${contact.email}`} className="hover:underline">
                        {contact.email}
                      </a>
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="hover:underline">
                          {contact.phone}
                        </a>
                      )}
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{client.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild variant="outline" className="justify-start">
                <Link href={`/quotes/new?clientId=${client.id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Quote
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href={`/invoices/new?clientId=${client.id}`}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Create Invoice
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity & History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Activity & History</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="activity">
                <TabsList>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="quotes">Quotes ({client.quotes?.length || 0})</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices ({client.invoices?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="mt-4">
                  {activities.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      No activity yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="quotes" className="mt-4">
                  {!client.quotes || client.quotes.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      No quotes yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {client.quotes.map((quote) => (
                        <Link
                          key={quote.id}
                          href={`/quotes/${quote.id}`}
                          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">{quote.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(quote.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(Number(quote.total))}</p>
                            <Badge variant={getQuoteStatusVariant(quote.status)}>
                              {quote.status}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="invoices" className="mt-4">
                  {!client.invoices || client.invoices.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      No invoices yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {client.invoices.map((invoice) => (
                        <Link
                          key={invoice.id}
                          href={`/invoices/${invoice.id}`}
                          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              Due {formatDate(invoice.dueDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(Number(invoice.total))}</p>
                            <Badge variant={getInvoiceStatusVariant(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {client.company || client.name}? This action
              cannot be undone. All associated quotes and invoices will remain but will no longer be
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

function ActivityItem({ activity }: { activity: ClientActivity }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'quote_created':
        return <FileText className="h-4 w-4" />;
      case 'quote_sent':
        return <Mail className="h-4 w-4" />;
      case 'quote_accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'quote_declined':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'invoice_created':
        return <Receipt className="h-4 w-4" />;
      case 'invoice_sent':
        return <Mail className="h-4 w-4" />;
      case 'invoice_paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invoice_overdue':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex gap-3">
      <div className="mt-1">{getIcon()}</div>
      <div className="flex-1">
        <p className="text-sm">{activity.title}</p>
        {activity.description && (
          <p className="text-sm text-muted-foreground">{activity.description}</p>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(activity.date)}</span>
          {activity.amount && <span>• {formatCurrency(activity.amount)}</span>}
        </div>
      </div>
    </div>
  );
}

function getQuoteStatusVariant(status: string) {
  switch (status) {
    case 'accepted':
      return 'default' as const;
    case 'sent':
    case 'viewed':
      return 'secondary' as const;
    case 'declined':
    case 'expired':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
}

function getInvoiceStatusVariant(status: string) {
  switch (status) {
    case 'paid':
      return 'default' as const;
    case 'sent':
    case 'viewed':
      return 'secondary' as const;
    case 'overdue':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
}
