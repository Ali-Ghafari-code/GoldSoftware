export interface Customer {
  id: string;
  code: string;
  name: string;
  nationalId?: string;
  mobile?: string;
  phone?: string;
  city?: string;
  address?: string;
  category?: string;
  creditLimit?: number;
  openingRial?: number;
  openingGold?: number;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  type: "manufacturer" | "wholesaler" | "workshop" | "assay" | "other";
  mobile?: string;
  phone?: string;
  city?: string;
  address?: string;
  openingRial?: number;
  openingGold?: number;
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  code: string;
  barcode?: string;
  jewelryNumber?: string;
  name: string;
  category: "ring" | "bracelet" | "necklace" | "earring" | "bullion" | "coin" | "scrap" | "other";
  karat: number;
  grossWeight: number;
  stoneWeight: number;
  makingCharge: number;
  location: string;
  supplierId?: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentLine {
  id: string;
  method: "cash" | "pos" | "transfer" | "check" | "credit" | "gold";
  amount: number;
  reference?: string;
}

export interface SaleItem {
  id: string;
  productId?: string;
  productName: string;
  karat: number;
  grossWeight: number;
  stoneWeight: number;
  pricePerGram18: number;
  makingChargePercent: number;
  makingChargeFixed: number;
  profitPercent: number;
  taxPercent: number;
  discount: number;
  finalAmount: number;
  fineGoldWeight: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  jalaliDate: string;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  payments: PaymentLine[];
  total: number;
  paid: number;
  remaining: number;
  notes?: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  date: string;
  jalaliDate: string;
  supplierId?: string;
  supplierName?: string;
  productName: string;
  category: Product["category"];
  karat: number;
  grossWeight: number;
  stoneWeight: number;
  pricePerGram18: number;
  makingCharge: number;
  totalAmount: number;
  payments: PaymentLine[];
  notes?: string;
  createdAt: string;
}

export type CoinType =
  | "emami"
  | "bahar"
  | "half"
  | "quarter"
  | "parsian"
  | "custom";

export interface CoinEntry {
  id: string;
  type: CoinType;
  label: string;
  quantity: number;
  pricePerCoin: number;
  direction: "in" | "out";
  partyName?: string;
  jalaliDate: string;
  createdAt: string;
}

export interface CheckEntry {
  id: string;
  kind: "received" | "paid";
  checkNumber: string;
  bank: string;
  branch?: string;
  owner: string;
  amount: number;
  issueJalali: string;
  dueJalali: string;
  status:
    | "pending"
    | "deposited"
    | "cleared"
    | "returned"
    | "transferred"
    | "cancelled";
  notes?: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  jalaliDate: string;
  partyType: "customer" | "supplier";
  partyId?: string;
  partyName: string;
  description: string;
  rialDebit: number;
  rialCredit: number;
  goldDebit: number; // grams
  goldCredit: number; // grams
  referenceType?: "sale" | "purchase" | "coin" | "check" | "manual";
  referenceId?: string;
  createdAt: string;
}

export interface AppSettings {
  id: string;
  companyName: string;
  branch?: string;
  pricePerGram18: number;
  defaultKarat: number;
  defaultMakingPercent: number;
  defaultProfitPercent: number;
  defaultTaxPercent: number;
  currency: string;
}
