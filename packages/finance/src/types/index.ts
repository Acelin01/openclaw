export type Currency = "CNY" | "USD";

export type TransactionType = "INCOME" | "EXPENSE";

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

export type InvoiceStatus = "PENDING" | "ISSUED" | "PAID" | "CANCELLED";

export type TaxStatus = "PENDING" | "FILED" | "PAID";

export interface Wallet {
  id: string;
  userId: string;
  balance: number; // Decimal in DB, number in JS/JSON usually
  currency: Currency;
  createdAt: string; // ISO Date string
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: TransactionType;
  category?: string;
  description?: string;
  status: TransactionStatus;
  referenceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  status: InvoiceStatus;
  title: string;
  content?: any;
  issuedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaxRecord {
  id: string;
  userId: string;
  amount: number;
  taxType: string;
  taxYear: number;
  status: TaxStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceOverview {
  wallet: Wallet;
  recentTransactions: WalletTransaction[];
  pendingInvoices: Invoice[];
  unpaidTaxes: TaxRecord[];
}
