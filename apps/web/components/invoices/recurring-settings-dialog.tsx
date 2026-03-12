'use client';

import { useState, useEffect } from 'react';
import { Loader2, RefreshCw, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface RecurringSettings {
  enabled: boolean;
  frequency: string;
  startDate: string;
  endDate: string | null;
  noEndDate: boolean;
  autoSend: boolean;
}

interface RecurringSettingsDialogProps {
  invoiceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (settings: RecurringSettings) => void;
}

const frequencies = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

function getStorageKey(invoiceId: string) {
  return `qc-recurring-${invoiceId}`;
}

function loadSettings(invoiceId: string): RecurringSettings {
  if (typeof window === 'undefined') return getDefaults();
  try {
    const stored = localStorage.getItem(getStorageKey(invoiceId));
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return getDefaults();
}

function getDefaults(): RecurringSettings {
  return {
    enabled: false,
    frequency: 'monthly',
    startDate: new Date().toISOString(),
    endDate: null,
    noEndDate: true,
    autoSend: false,
  };
}

export function RecurringSettingsDialog({
  invoiceId,
  open,
  onOpenChange,
  onSave,
}: RecurringSettingsDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [noEndDate, setNoEndDate] = useState(true);
  const [autoSend, setAutoSend] = useState(false);

  // Load from localStorage when dialog opens
  useEffect(() => {
    if (open) {
      const settings = loadSettings(invoiceId);
      setEnabled(settings.enabled);
      setFrequency(settings.frequency);
      setStartDate(new Date(settings.startDate));
      setEndDate(settings.endDate ? new Date(settings.endDate) : undefined);
      setNoEndDate(settings.noEndDate);
      setAutoSend(settings.autoSend);
    }
  }, [open, invoiceId]);

  const handleSave = async () => {
    setIsSaving(true);

    const settings: RecurringSettings = {
      enabled,
      frequency,
      startDate: startDate.toISOString(),
      endDate: noEndDate ? null : (endDate?.toISOString() ?? null),
      noEndDate,
      autoSend,
    };

    // Save locally for now — recurring invoices backend not yet implemented
    localStorage.setItem(getStorageKey(invoiceId), JSON.stringify(settings));
    setIsSaving(false);
    toast.info('Recurring invoices are not yet fully supported. Settings saved locally only.');
    onSave?.(settings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Recurring Settings
          </DialogTitle>
          <DialogDescription>
            Configure this invoice to repeat automatically on a schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Enable Recurring</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically generate this invoice on schedule
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <>
              {/* Frequency */}
              <div className="grid gap-2">
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(d) => d && setStartDate(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="grid gap-2">
                <Label>End Date</Label>
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    id="no-end-date"
                    checked={noEndDate}
                    onCheckedChange={(checked) => setNoEndDate(!!checked)}
                  />
                  <label htmlFor="no-end-date" className="text-sm text-muted-foreground cursor-pointer">
                    No end date
                  </label>
                </div>
                {!noEndDate && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : 'Pick an end date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => date < startDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Auto-send */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto-send to Client</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Automatically email the invoice when generated
                  </p>
                </div>
                <Switch checked={autoSend} onCheckedChange={setAutoSend} />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
