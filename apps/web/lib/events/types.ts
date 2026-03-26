export type DomainEvent =
  | { type: 'quote.created'; payload: { quoteId: string; workspaceId: string } }
  | { type: 'quote.sent'; payload: { quoteId: string; workspaceId: string; clientEmail: string } }
  | { type: 'quote.accepted'; payload: { quoteId: string; workspaceId: string } }
  | { type: 'quote.declined'; payload: { quoteId: string; workspaceId: string } }
  | { type: 'invoice.created'; payload: { invoiceId: string; workspaceId: string } }
  | { type: 'invoice.sent'; payload: { invoiceId: string; workspaceId: string; clientEmail: string } }
  | { type: 'invoice.paid'; payload: { invoiceId: string; workspaceId: string; amount: number } }
  | { type: 'invoice.voided'; payload: { invoiceId: string; workspaceId: string } }
  | { type: 'payment.received'; payload: { paymentId: string; invoiceId: string; workspaceId: string; amount: number } }
  | { type: 'payment.refunded'; payload: { paymentId: string; workspaceId: string; amount: number } }
  | { type: 'client.created'; payload: { clientId: string; workspaceId: string } }
  | { type: 'credit_note.issued'; payload: { creditNoteId: string; invoiceId: string; workspaceId: string } };

export type DomainEventType = DomainEvent['type'];

export type DomainEventPayload<T extends DomainEventType> = Extract<DomainEvent, { type: T }>['payload'];
