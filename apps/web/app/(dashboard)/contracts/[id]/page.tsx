import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  ExternalLink,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  FileText,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ContractEditor } from '@/components/contracts/contract-editor';
import { getContractInstanceById } from '@/lib/contracts/actions';
import { formatDate } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const instance = await getContractInstanceById(id);
  return {
    title: instance?.contractName || 'Contract',
    description: 'View contract details',
  };
}

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }
> = {
  draft: {
    label: 'Draft',
    variant: 'secondary',
    icon: <FileText className="h-4 w-4" />,
  },
  sent: {
    label: 'Sent',
    variant: 'default',
    icon: <Mail className="h-4 w-4" />,
  },
  viewed: {
    label: 'Viewed',
    variant: 'outline',
    icon: <Eye className="h-4 w-4" />,
  },
  signed: {
    label: 'Signed',
    variant: 'default',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  expired: {
    label: 'Expired',
    variant: 'destructive',
    icon: <Clock className="h-4 w-4" />,
  },
};

export default async function ContractDetailPage({ params }: PageProps) {
  const { id } = await params;
  const instance = await getContractInstanceById(id);

  if (!instance) {
    notFound();
  }

  const config = statusConfig[instance.status] ?? statusConfig.draft;
  const clientViewUrl = `/c/${instance.accessToken}`;

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/contracts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contracts
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{instance.contractName}</h1>
              <Badge variant={config?.variant ?? 'secondary'} className="gap-1">
                {config?.icon}
                {config?.label ?? instance.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              For {instance.clientName} · Created {formatDate(instance.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            {instance.status === 'draft' && (
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Send to Client
              </Button>
            )}
            {instance.status !== 'draft' && (
              <Button variant="outline" asChild>
                <Link href={clientViewUrl} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View as Client
                </Link>
              </Button>
            )}
            {instance.pdfUrl && (
              <Button variant="outline" asChild>
                <a href={instance.pdfUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-medium">{instance.clientName}</p>
            </div>
            {instance.quoteName && (
              <div>
                <p className="text-sm text-muted-foreground">Related Quote</p>
                <p className="font-medium">{instance.quoteName}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Sent</p>
              <p className="font-medium">
                {instance.sentAt ? formatDate(instance.sentAt) : 'Not sent'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Viewed</p>
              <p className="font-medium">
                {instance.viewedAt ? formatDate(instance.viewedAt) : 'Not viewed'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Signed</p>
              <p className="font-medium">
                {instance.signedAt ? formatDate(instance.signedAt) : 'Not signed'}
              </p>
            </div>
            {instance.signerIpAddress && (
              <div>
                <p className="text-sm text-muted-foreground">Signer IP</p>
                <p className="font-medium font-mono text-sm">
                  {instance.signerIpAddress}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {instance.signatureData && (
          <Card>
            <CardHeader>
              <CardTitle>Signature</CardTitle>
              <CardDescription>
                Signed by {instance.signatureData.name} on{' '}
                {formatDate(new Date(instance.signatureData.date))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {instance.signatureData.type === 'drawn' ? (
                <div className="border rounded-lg p-4 bg-white">
                  <img
                    src={instance.signatureData.value}
                    alt="Signature"
                    className="max-h-24"
                  />
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-white">
                  <p
                    className="text-3xl"
                    style={{ fontFamily: "'Brush Script MT', cursive" }}
                  >
                    {instance.signatureData.value}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Contract Content</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractEditor
              content={instance.content}
              editable={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
