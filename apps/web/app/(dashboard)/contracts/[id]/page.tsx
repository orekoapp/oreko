import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Hourglass,
  Eye,
  Mail,
  FileText,
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
import { ContractDetailActions } from '@/components/contracts/contract-detail-actions';
import { getContractInstanceById } from '@/lib/contracts/actions';
import { formatDate } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return { title: 'Contract Not Found' };
  }
  try {
    const instance = await getContractInstanceById(id);
    return {
      title: instance?.contractName || 'Contract',
      description: 'View contract details',
    };
  } catch {
    return { title: 'Contract Not Found' };
  }
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
  pending: {
    label: 'Pending Countersign',
    variant: 'outline',
    icon: <Hourglass className="h-4 w-4" />,
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

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/contracts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contracts
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{instance.contractName}</h1>
              <Badge variant={config?.variant ?? 'secondary'} className="gap-1">
                {config?.icon}
                {config?.label ?? instance.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              For {instance.clientName} · Created {formatDate(instance.createdAt)}
            </p>
          </div>
          <ContractDetailActions
            contractId={instance.id}
            contractName={instance.contractName}
            status={instance.status}
            clientViewUrl={`/c/${instance.accessToken}`}
            pdfUrl={instance.pdfUrl}
          />
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
                <p className="text-sm text-muted-foreground">Client IP</p>
                <p className="font-medium font-mono text-sm">
                  {instance.signerIpAddress}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {(instance.signatureData || instance.status === 'pending' || instance.status === 'signed') && (
          <Card>
            <CardHeader>
              <CardTitle>Signatures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Client Signature */}
                <div>
                  <p className="text-sm font-medium mb-2">Client Signature</p>
                  {instance.signatureData ? (
                    <div className="border rounded-lg p-4 bg-card">
                      {instance.signatureData.type === 'drawn' && (instance.signatureData.value.startsWith('data:image/') || instance.signatureData.value.startsWith('https://')) ? (
                        <img
                          src={instance.signatureData.value}
                          alt="Client Signature"
                          className="max-h-24"
                        />
                      ) : instance.signatureData.type === 'drawn' ? (
                        <p className="text-sm text-muted-foreground">Invalid signature data</p>
                      ) : (
                        <p
                          className="text-3xl"
                          style={{ fontFamily: "'Brush Script MT', cursive" }}
                        >
                          {instance.signatureData.value}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Signed by {instance.signatureData.name} on{' '}
                        {formatDate(new Date(instance.signatureData.date))}
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-4 h-24 flex items-center justify-center text-sm text-muted-foreground">
                      Awaiting client signature
                    </div>
                  )}
                </div>

                {/* Business Signature */}
                <div>
                  <p className="text-sm font-medium mb-2">Business Signature</p>
                  {instance.countersignatureData ? (
                    <div className="border rounded-lg p-4 bg-card">
                      {instance.countersignatureData.type === 'drawn' && (instance.countersignatureData.value.startsWith('data:image/') || instance.countersignatureData.value.startsWith('https://')) ? (
                        <img
                          src={instance.countersignatureData.value}
                          alt="Business Signature"
                          className="max-h-24"
                        />
                      ) : instance.countersignatureData.type === 'drawn' ? (
                        <p className="text-sm text-muted-foreground">Invalid signature data</p>
                      ) : (
                        <p
                          className="text-3xl"
                          style={{ fontFamily: "'Brush Script MT', cursive" }}
                        >
                          {instance.countersignatureData.value}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Countersigned by {instance.countersignatureData.name} on{' '}
                        {formatDate(new Date(instance.countersignatureData.date))}
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-4 h-24 flex items-center justify-center text-sm text-muted-foreground">
                      Awaiting business countersignature
                    </div>
                  )}
                </div>
              </div>
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
