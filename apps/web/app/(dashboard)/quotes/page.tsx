import Link from 'next/link';
import { Plus, FileText, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// TODO: Replace with actual data fetching
const mockQuotes = [
  {
    id: '1',
    quoteNumber: 'QT-001',
    title: 'Website Redesign Project',
    clientName: 'Acme Corporation',
    status: 'sent',
    total: 15000,
    issueDate: '2024-01-15',
    expirationDate: '2024-02-15',
  },
  {
    id: '2',
    quoteNumber: 'QT-002',
    title: 'Mobile App Development',
    clientName: 'TechStart Inc',
    status: 'draft',
    total: 45000,
    issueDate: '2024-01-18',
    expirationDate: null,
  },
  {
    id: '3',
    quoteNumber: 'QT-003',
    title: 'Brand Identity Package',
    clientName: 'Fresh Foods Co',
    status: 'accepted',
    total: 8500,
    issueDate: '2024-01-10',
    expirationDate: '2024-02-10',
  },
];

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
};

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground">
            Create and manage your quotes and proposals
          </p>
        </div>
        <Button asChild>
          <Link href="/quotes/new">
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search quotes..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4">
        {mockQuotes.map((quote) => (
          <Link key={quote.id} href={`/quotes/${quote.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{quote.title}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[quote.status] || statusColors.draft}`}
                      >
                        {quote.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {quote.quoteNumber} &bull; {quote.clientName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${quote.total.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(quote.issueDate).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {mockQuotes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No quotes yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first quote to get started
            </p>
            <Button asChild>
              <Link href="/quotes/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Quote
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
