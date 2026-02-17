'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface NotesSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  internalNotes: string;
  onInternalNotesChange?: (internalNotes: string) => void;
}

export function NotesSection({ notes, onNotesChange, internalNotes, onInternalNotesChange }: NotesSectionProps) {
  return (
    <div className="space-y-6">
      {/* Client-facing Notes */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Notes for Client</CardTitle>
          <CardDescription>
            These notes will be visible to the client on the quote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="notes" className="sr-only">Notes for Client</Label>
            <Textarea
              id="notes"
              placeholder="Thank you for considering us for your project. We look forward to working with you!"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Internal Notes */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Internal Notes</CardTitle>
          <CardDescription>
            Private notes for your team only - not visible to client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="internalNotes" className="sr-only">Internal Notes</Label>
            <Textarea
              id="internalNotes"
              placeholder="Add any internal notes about this quote..."
              value={internalNotes}
              onChange={(e) => onInternalNotesChange?.(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
