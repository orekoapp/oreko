import type { Project, Client, Quote, Invoice } from '@quotecraft/database';

export type ProjectWithClient = Project & {
  client: Pick<Client, 'id' | 'name' | 'company' | 'email'>;
};

export type ProjectWithCounts = ProjectWithClient & {
  _count: {
    quotes: number;
    invoices: number;
    contractInstances: number;
  };
};

export type ProjectDetail = Project & {
  client: Pick<Client, 'id' | 'name' | 'company' | 'email' | 'phone'>;
  quotes: Pick<
    Quote,
    'id' | 'quoteNumber' | 'title' | 'status' | 'total' | 'createdAt'
  >[];
  invoices: Pick<
    Invoice,
    | 'id'
    | 'invoiceNumber'
    | 'title'
    | 'status'
    | 'total'
    | 'amountDue'
    | 'dueDate'
    | 'createdAt'
  >[];
  _count: {
    quotes: number;
    invoices: number;
    contractInstances: number;
  };
};

export type ProjectStats = {
  quotes: {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    expired: number;
    totalValue: number;
    acceptedValue: number;
  };
  invoices: {
    total: number;
    pending: number;
    paid: number;
    overdue: number;
    partial: number;
    totalValue: number;
    totalPaid: number;
    totalDue: number;
  };
};

export type ProjectListItem = {
  id: string;
  name: string;
  description: string | null;
};
