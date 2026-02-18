'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateInvoiceDefaults, type InvoiceDefaults } from '@/lib/settings/actions';
import { PAYMENT_TERMS } from '@/lib/invoices/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvoiceDefaultsFormProps {
  initialData: InvoiceDefaults;
}

export function InvoiceDefaultsForm({ initialData }: InvoiceDefaultsFormProps) {
  const [data, setData] = useState<InvoiceDefaults>(initialData);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await updateInvoiceDefaults(data);
      if (result.success) {
        toast({ title: 'Invoice defaults saved' });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Defaults</CardTitle>
        <CardDescription>
          Set default payment terms and messages for new invoices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Default Payment Terms</Label>
            <Select
              value={data.paymentTerms}
              onValueChange={(value) => setData({ ...data, paymentTerms: value })}
            >
              <SelectTrigger id="paymentTerms">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TERMS.map((term) => (
                  <SelectItem key={term.value} value={term.value}>
                    {term.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultNotes">Default Notes</Label>
            <Textarea
              id="defaultNotes"
              value={data.defaultNotes}
              onChange={(e) => setData({ ...data, defaultNotes: e.target.value })}
              placeholder="Default notes that appear on every invoice..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultTerms">Default Terms & Conditions</Label>
            <Textarea
              id="defaultTerms"
              value={data.defaultTerms}
              onChange={(e) => setData({ ...data, defaultTerms: e.target.value })}
              placeholder="Default terms and conditions..."
              rows={3}
            />
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Late Fee</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically apply late fees to overdue invoices
                </p>
              </div>
              <Switch
                checked={data.lateFeeEnabled}
                onCheckedChange={(checked) => setData({ ...data, lateFeeEnabled: checked })}
              />
            </div>
            {data.lateFeeEnabled && (
              <div className="flex gap-4">
                <div className="w-32">
                  <Label>Type</Label>
                  <Select
                    value={data.lateFeeType}
                    onValueChange={(value: 'percentage' | 'fixed') =>
                      setData({ ...data, lateFeeType: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>{data.lateFeeType === 'percentage' ? 'Rate (%)' : 'Amount ($)'}</Label>
                  <Input
                    type="number"
                    value={data.lateFeeValue}
                    onChange={(e) => setData({ ...data, lateFeeValue: parseFloat(e.target.value) || 0 })}
                    min={0}
                    step="0.01"
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>Payment Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Send automatic reminders before and after due dates
              </p>
            </div>
            <Switch
              checked={data.reminderEnabled}
              onCheckedChange={(checked) => setData({ ...data, reminderEnabled: checked })}
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Defaults
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
