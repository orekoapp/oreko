import type { Contract, ContractInstance, Client, Quote } from '@quotecraft/database';

// Contract template with relations
export type ContractWithRelations = Contract & {
  instances?: ContractInstance[];
  _count?: {
    instances: number;
  };
};

// Contract instance with relations
export type ContractInstanceWithRelations = ContractInstance & {
  contract?: Contract;
  client?: Client;
  quote?: Quote | null;
};

// Variable definition
export interface ContractVariable {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'boolean';
  defaultValue?: string;
  required?: boolean;
}

// Contract template list item
export interface ContractTemplateListItem {
  id: string;
  name: string;
  isTemplate: boolean;
  variables: ContractVariable[];
  instanceCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Contract template detail
export interface ContractTemplateDetail {
  id: string;
  workspaceId: string;
  name: string;
  content: string;
  isTemplate: boolean;
  variables: ContractVariable[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  _count: {
    instances: number;
  };
}

// Contract instance list item
export interface ContractInstanceListItem {
  id: string;
  contractName: string;
  clientName: string;
  clientEmail: string | null;
  quoteName: string | null;
  status: string;
  variablesCount: number;
  sentAt: Date | null;
  viewedAt: Date | null;
  signedAt: Date | null;
  createdAt: Date;
}

// Contract instance detail
export interface ContractInstanceDetail {
  id: string;
  contractId: string;
  contractName: string;
  clientId: string;
  clientName: string;
  quoteId: string | null;
  quoteName: string | null;
  workspaceId: string;
  content: string;
  status: string;
  accessToken: string;
  sentAt: Date | null;
  viewedAt: Date | null;
  signedAt: Date | null;
  signatureData: SignatureData | null;
  signerIpAddress: string | null;
  pdfUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Signature data
export interface SignatureData {
  type: 'typed' | 'drawn';
  value: string;
  name: string;
  date: string;
}

// Create contract template input
export interface CreateContractTemplateInput {
  name: string;
  content: string;
  isTemplate?: boolean;
  variables?: ContractVariable[];
}

// Update contract template input
export interface UpdateContractTemplateInput extends Partial<CreateContractTemplateInput> {
  id: string;
}

// Create contract instance input
export interface CreateContractInstanceInput {
  contractId: string;
  clientId: string;
  quoteId?: string;
  content?: string;
  variableValues?: Record<string, string>;
}

// Sign contract input
export interface SignContractInput {
  token: string;
  signatureData: SignatureData;
}

// Contract filter
export interface ContractFilter {
  search?: string;
  isTemplate?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Contract instance filter
export interface ContractInstanceFilter {
  search?: string;
  status?: string;
  clientId?: string;
  page?: number;
  limit?: number;
}

// Paginated contracts
export interface PaginatedContracts {
  data: ContractTemplateListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Contract settings
export interface ContractSettingsData {
  autoCountersign: boolean;
}

// Paginated contract instances
export interface PaginatedContractInstances {
  data: ContractInstanceListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
