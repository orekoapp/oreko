'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Pencil,
  Trash2,
  FileText,
  Receipt,
  User,
  FolderKanban,
  DollarSign,
  Clock,
  CheckCircle,
  Power,
  PowerOff,
  FileSignature,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { deleteProject, deactivateProject, reactivateProject } from '@/lib/projects/actions';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ProjectDetail as ProjectDetailType, ProjectStats } from '@/lib/projects/types';
import { toast } from 'sonner';

interface ProjectDetailProps {
  project: ProjectDetailType;
  stats: ProjectStats;
}

export function ProjectDetail({ project, stats }: ProjectDetailProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      toast.success('Project deleted successfully');
      router.push('/projects');
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      if (project.isActive) {
        await deactivateProject(project.id);
        toast.success('Project deactivated');
      } else {
        await reactivateProject(project.id);
        toast.success('Project reactivated');
      }
      router.refresh();
    } catch {
      toast.error('Failed to update project status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              {project.description && (
                <p className="text-muted-foreground">{project.description}</p>
              )}
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={project.isActive ? 'default' : 'secondary'}>
                  {project.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleToggleActive}>
            {project.isActive ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Reactivate
              </>
            )}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/projects/${project.id}/edit`}>
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
                <p className="text-2xl font-bold">{stats.quotes.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accepted Value</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.quotes.acceptedValue / 100)}</p>
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
                <p className="text-sm text-muted-foreground">Total Invoiced</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.invoices.totalValue / 100)}</p>
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
                <p className="text-2xl font-bold">{formatCurrency(stats.invoices.totalDue / 100)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Info */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/clients/${project.client.id}`}
                className="flex items-center gap-3 hover:underline"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  {project.client.company ? (
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{project.client.company || project.client.name}</p>
                  {project.client.company && (
                    <p className="text-sm text-muted-foreground">{project.client.name}</p>
                  )}
                </div>
              </Link>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${project.client.email}`} className="hover:underline">
                    {project.client.email}
                  </a>
                </div>
                {project.client.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${project.client.phone}`} className="hover:underline">
                      {project.client.phone}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Stats Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Quotes</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge variant="draft">{stats.quotes.draft} Draft</Badge>
                  <Badge variant="sent">{stats.quotes.sent} Sent</Badge>
                  <Badge variant="accepted">{stats.quotes.accepted} Accepted</Badge>
                  <Badge variant="expired">{stats.quotes.expired} Expired</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invoices</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge variant="pending">{stats.invoices.pending} Pending</Badge>
                  <Badge variant="paid">{stats.invoices.paid} Paid</Badge>
                  <Badge variant="overdue">{stats.invoices.overdue} Overdue</Badge>
                  <Badge variant="partial">{stats.invoices.partial} Partial</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contracts</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge variant="secondary">{project._count.contractInstances} Total</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild variant="outline" className="justify-start">
                <Link href={`/quotes/new?projectId=${project.id}&clientId=${project.client.id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Quote
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href={`/invoices/new?projectId=${project.id}&clientId=${project.client.id}`}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Create Invoice
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href={`/contracts/new?projectId=${project.id}&clientId=${project.client.id}`}>
                  <FileSignature className="mr-2 h-4 w-4" />
                  Create Contract
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Documents */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="quotes">
                <TabsList>
                  <TabsTrigger value="quotes">Quotes ({project.quotes?.length || 0})</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices ({project.invoices?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="quotes" className="mt-4">
                  {!project.quotes || project.quotes.length === 0 ? (
                    <div className="py-8 text-center">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">No quotes yet</p>
                      <Button asChild variant="outline" size="sm" className="mt-4">
                        <Link href={`/quotes/new?projectId=${project.id}&clientId=${project.client.id}`}>
                          Create Quote
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {project.quotes.map((quote) => (
                        <Link
                          key={quote.id}
                          href={`/quotes/${quote.id}`}
                          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">{quote.title || quote.quoteNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(quote.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(Number(quote.total) / 100)}</p>
                            <Badge variant={quote.status as 'draft' | 'sent' | 'accepted' | 'expired'}>
                              {quote.status}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="invoices" className="mt-4">
                  {!project.invoices || project.invoices.length === 0 ? (
                    <div className="py-8 text-center">
                      <Receipt className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">No invoices yet</p>
                      <Button asChild variant="outline" size="sm" className="mt-4">
                        <Link href={`/invoices/new?projectId=${project.id}&clientId=${project.client.id}`}>
                          Create Invoice
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {project.invoices.map((invoice) => (
                        <Link
                          key={invoice.id}
                          href={`/invoices/${invoice.id}`}
                          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">{invoice.title || invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              Due {formatDate(invoice.dueDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(Number(invoice.total) / 100)}</p>
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
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{project.name}&quot;? This action cannot be undone.
              Associated quotes, invoices, and contracts will remain but will no longer be linked to this project.
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

function getInvoiceStatusVariant(status: string) {
  switch (status) {
    case 'paid':
      return 'paid' as const;
    case 'overdue':
      return 'overdue' as const;
    case 'partial':
      return 'partial' as const;
    default:
      return 'pending' as const;
  }
}
