'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecurringSettingsDialog, RecurringSettings } from './recurring-settings-dialog';

interface RecurringSettingsButtonProps {
  invoiceId: string;
  initialSettings?: (RecurringSettings & { nextRecurringDate?: string | null }) | null;
}

export function RecurringSettingsButton({
  invoiceId,
  initialSettings,
}: RecurringSettingsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={() => setOpen(true)}
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Settings
      </Button>
      <RecurringSettingsDialog
        invoiceId={invoiceId}
        open={open}
        onOpenChange={setOpen}
        initialSettings={initialSettings ? {
          enabled: initialSettings.enabled,
          frequency: initialSettings.frequency,
          startDate: initialSettings.startDate,
          endDate: initialSettings.endDate,
          noEndDate: initialSettings.noEndDate,
          autoSend: initialSettings.autoSend,
        } : null}
      />
    </>
  );
}
