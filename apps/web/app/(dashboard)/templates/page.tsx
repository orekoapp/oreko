import { Suspense } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContractTemplateList } from '@/components/contracts/contract-template-list';
import { getContractTemplates } from '@/lib/contracts/actions';
import { getEmailTemplates } from '@/lib/email/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Mail, Plus } from 'lucide-react';

export const metadata = {
  title: 'Templates',
  description: 'Manage your contract and email templates',
};

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string; tab?: string }>;
}

async function ContractTemplateContent({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const { data: templates } = await getContractTemplates({
    search: searchParams.search,
    page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
    isTemplate: true,
  });

  return (
    <ContractTemplateList
      templates={templates}
      searchQuery={searchParams.search}
    />
  );
}

async function EmailTemplateContent() {
  const templates = await getEmailTemplates();

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-1">No email templates</h3>
        <p className="text-muted-foreground mb-4">
          Create email templates for quotes, invoices, and reminders.
        </p>
        <Button asChild>
          <Link href="/settings/emails/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{templates.length} template(s)</p>
        <Button asChild size="sm">
          <Link href="/settings/emails/new">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Link key={template.id} href={`/settings/emails/${template.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant={template.isActive ? 'default' : 'secondary'}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription>{template.subject}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-xs">
                  {template.type.replace(/_/g, ' ')}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TemplateListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}

export default async function TemplatesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeTab = params.tab || 'contracts';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Templates</h1>
        <p className="text-muted-foreground">
          Create and manage reusable templates for contracts and emails.
        </p>
      </div>

      <Tabs defaultValue={activeTab}>
        <TabsList>
          <TabsTrigger value="contracts" className="gap-2">
            <FileText className="h-4 w-4" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="emails" className="gap-2">
            <Mail className="h-4 w-4" />
            Emails
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="mt-6">
          <Suspense fallback={<TemplateListSkeleton />}>
            <ContractTemplateContent searchParams={params} />
          </Suspense>
        </TabsContent>

        <TabsContent value="emails" className="mt-6">
          <Suspense fallback={<TemplateListSkeleton />}>
            <EmailTemplateContent />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
