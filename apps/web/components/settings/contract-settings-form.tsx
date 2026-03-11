'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { updateContractSettings } from '@/lib/contracts/actions';
import type { ContractSettingsData } from '@/lib/contracts/types';

interface ContractSettingsFormProps {
  initialData: ContractSettingsData;
}

export function ContractSettingsForm({ initialData }: ContractSettingsFormProps) {
  const [autoCountersign, setAutoCountersign] = useState(initialData.autoCountersign);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateContractSettings({ autoCountersign });
      toast.success('Contract settings updated');
    } catch {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Settings</CardTitle>
        <CardDescription>
          Configure how contracts are signed and processed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-countersign">Auto Countersign</Label>
            <p className="text-sm text-muted-foreground">
              Automatically apply your business signature after the client signs.
              When disabled, contracts will require manual countersigning.
            </p>
          </div>
          <Switch
            id="auto-countersign"
            checked={autoCountersign}
            onCheckedChange={setAutoCountersign}
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
