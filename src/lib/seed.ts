import { loadAll, saveAll, newId, loadSettings, saveSettings } from "./storage";
import type {
  Customer,
  Supplier,
  Product,
  AppSettings,
  CoinEntry,
  CheckEntry,
} from "./types";
import { formatJalaliDate } from "./jalali";

export const DEFAULT_SETTINGS: AppSettings = {
  id: "settings",
  companyName: "گالری طلای نمونه",
  branch: "شعبه مرکزی",
  pricePerGram18: 32_500_000,
  defaultKarat: 18,
  defaultMakingPercent: 7,
  defaultProfitPercent: 7,
  defaultTaxPercent: 9,
  currency: "ریال",
};

export function ensureSeed() {
  const settings = loadSettings<AppSettings>(DEFAULT_SETTINGS);
  saveSettings(settings);

  if (loadAll<Customer>("customers").length === 0) {
    const today = formatJalaliDate();
    const customers: Customer[] = [
      {
        id: newId(),
        code: "C-1001",
        name: "علی رضایی",
        mobile: "09121234567",
        city: "تهران",
        category: "عادی",
        creditLimit: 200_000_000,
        openingRial: 0,
        openingGold: 0,
        createdAt: today,
      },
      {
        id: newId(),
        code: "C-1002",
        name: "محمد کریمی",
        mobile: "09127654321",
        city: "اصفهان",
        category: "ویژه",
        creditLimit: 500_000_000,
        openingRial: 25_000_000,
        openingGold: 1.5,
        createdAt: today,
      },
      {
        id: newId(),
        code: "C-1003",
        name: "شرکت نمونه تجارت",
        mobile: "02188888888",
        city: "تهران",
        category: "عمده",
        creditLimit: 1_000_000_000,
        openingRial: 0,
        openingGold: 0,
        createdAt: today,
      },
    ];
    saveAll("customers", customers);
  }

  if (loadAll<Supplier>("suppliers").length === 0) {
    const today = formatJalaliDate();
    const suppliers: Supplier[] = [
      {
        id: newId(),
        code: "S-2001",
        name: "کارگاه زرین",
        type: "workshop",
        mobile: "09351111111",
        city: "تهران",
        openingGold: 12.4,
        createdAt: today,
      },
      {
        id: newId(),
        code: "S-2002",
        name: "آزمایشگاه ری‌گیری پارس",
        type: "assay",
        mobile: "09362222222",
        city: "تهران",
        createdAt: today,
      },
      {
        id: newId(),
        code: "S-2003",
        name: "تولیدی طلای آریا",
        type: "manufacturer",
        mobile: "09373333333",
        city: "اصفهان",
        createdAt: today,
      },
    ];
    saveAll("suppliers", suppliers);
  }

  if (loadAll<Product>("products").length === 0) {
    const today = formatJalaliDate();
    const products: Product[] = [
      {
        id: newId(),
        code: "P-3001",
        barcode: "8900000001",
        jewelryNumber: "J-0001",
        name: "انگشتر طلا طرح کلاسیک",
        category: "ring",
        karat: 18,
        grossWeight: 4.25,
        stoneWeight: 0.1,
        makingCharge: 10,
        location: "ویترین ۱",
        createdAt: today,
      },
      {
        id: newId(),
        code: "P-3002",
        barcode: "8900000002",
        jewelryNumber: "J-0002",
        name: "دستبند ظریف",
        category: "bracelet",
        karat: 18,
        grossWeight: 7.8,
        stoneWeight: 0,
        makingCharge: 8,
        location: "ویترین ۲",
        createdAt: today,
      },
      {
        id: newId(),
        code: "P-3003",
        barcode: "8900000003",
        jewelryNumber: "J-0003",
        name: "گردنبند طرح جواهر",
        category: "necklace",
        karat: 18,
        grossWeight: 12.3,
        stoneWeight: 0.6,
        makingCharge: 12,
        location: "ویترین ۳",
        createdAt: today,
      },
      {
        id: newId(),
        code: "P-3004",
        name: "طلای آبشده",
        category: "bullion",
        karat: 24,
        grossWeight: 50,
        stoneWeight: 0,
        makingCharge: 0,
        location: "گاوصندوق",
        createdAt: today,
      },
    ];
    saveAll("products", products);
  }

  if (loadAll<CoinEntry>("coins").length === 0) {
    const today = formatJalaliDate();
    const coins: CoinEntry[] = [
      {
        id: newId(),
        type: "emami",
        label: "سکه امامی",
        quantity: 3,
        pricePerCoin: 45_000_000,
        direction: "in",
        partyName: "موجودی اول دوره",
        jalaliDate: today,
        createdAt: today,
      },
    ];
    saveAll("coins", coins);
  }

  if (loadAll<CheckEntry>("checks").length === 0) {
    const today = formatJalaliDate();
    const checks: CheckEntry[] = [
      {
        id: newId(),
        kind: "received",
        checkNumber: "123456",
        bank: "بانک ملی",
        branch: "شعبه مرکزی",
        owner: "محمد کریمی",
        amount: 150_000_000,
        issueJalali: today,
        dueJalali: today,
        status: "pending",
        createdAt: today,
      },
    ];
    saveAll("checks", checks);
  }
}
