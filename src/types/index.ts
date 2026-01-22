export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
  createdAt: Date;
}

export interface Transaction {
  id?: string;
  from: string;
  to: string;
  purpose?: string;
  amount: number;
  currency: 'PKR' | 'KWD';
  date: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}

export interface Sender {
  id: string;
  name: string;
  usageCount: number;
}

export interface Receiver {
  id: string;
  name: string;
  usageCount: number;
}

export interface AuditLog {
  id?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'transaction' | 'user' | 'settings';
  entityId: string;
  performedBy: string;
  performedAt: Date;
  beforeValues?: any;
  afterValues?: any;
}

export interface Settings {
  id: string;
  kwdToPkrRate: number;
  updatedBy: string;
  updatedAt: Date;
}