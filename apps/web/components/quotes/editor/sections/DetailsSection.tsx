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
import { ClientSelector } from '@/components/clients';
import { ProjectSelector } from '@/components/projects';

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
  onClientChange?: (client: ClientInfo | null) => void;
  projectId: string | null;
  onProjectChange: (projectId: string | null) => void;
}

export function DetailsSection({
  title,
  onTitleChange,
  expirationDays,
  onExpirationChange,
  taxRate,
  onTaxRateChange,
  client,
  onClientChange,
  projectId,
  onProjectChange,
}: DetailsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Client Selection with Typeahead */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Client</CardTitle>
          <CardDescription>
            Search and select a client for this quote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientSelector
            value={client}
            onChange={(newClient) => {
              if (onClientChange) {
                onClientChange(newClient);
              }
            }}
            placeholder="Search clients by name, email, or company..."
          />
        </CardContent>
      </Card>

      {/* Project Selection */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Project</CardTitle>
          <CardDescription>
            Optionally associate this quote with a project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectSelector
            clientId={client?.id || null}
            value={projectId}
            onChange={onProjectChange}
          />
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
