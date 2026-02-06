'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Building2 } from 'lucide-react';
import Link from 'next/link';

interface ClientInfo {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

interface DetailsSectionProps {
  title: string;
  onTitleChange: (title: string) => void;
  expirationDays: string;
  onExpirationChange: (days: string) => void;
  taxRate: string;
  onTaxRateChange: (rate: string) => void;
  client: ClientInfo | null;
}

export function DetailsSection({
  title,
  onTitleChange,
  expirationDays,
  onExpirationChange,
  taxRate,
  onTaxRateChange,
  client,
}: DetailsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Client Info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Client</CardTitle>
          <CardDescription>
            The client this quote is for
          </CardDescription>
        </CardHeader>
        <CardContent>
          {client ? (
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {client.company ? (
                  <Building2 className="h-5 w-5 text-primary" />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{client.company || client.name}</p>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>
              <Link
                href={`/quotes/new?change=true`}
                className="text-sm text-primary hover:underline"
              >
                Change
              </Link>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>No client selected</p>
              <Link
                href="/quotes/new"
                className="text-sm text-primary hover:underline"
              >
                Select a client
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Details */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Quote Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Quote Title</Label>
            <Input
              id="title"
              placeholder="e.g., Website Redesign Proposal"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiration">Valid For</Label>
              <Select value={expirationDays} onValueChange={onExpirationChange}>
                <SelectTrigger id="expiration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="45">45 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="taxRate">Tax Rate</Label>
              <Select value={taxRate} onValueChange={onTaxRateChange}>
                <SelectTrigger id="taxRate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% - No Tax</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="7.5">7.5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
