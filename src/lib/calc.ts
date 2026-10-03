// Centralized gold calculation engine.
// All values are kept as plain numbers but rounded consistently for display.

export interface GoldCalcInput {
  grossWeight: number;      // Gross weight (grams)
  stoneWeight: number;      // Stone weight (grams)
  karat: number;            // Gold karat, e.g. 18, 21, 24
  pricePerGram18: number;   // Market gold price per gram @ 18K (Rial)
  makingChargePercent: number; // Making charge as a percent of gold value
  makingChargeFixed: number;   // Fixed making charge (Rial)
  profitPercent: number;       // Seller profit margin as percent
  taxPercent: number;          // Applicable tax percent
  discount: number;            // Discount amount (Rial)
}

export interface GoldCalcResult {
  netWeight: number;        // grossWeight - stoneWeight
  fineGoldWeight: number;   // netWeight * karat/24 (grams of pure gold)
  pricePerGramAtKarat: number; // priced at the chosen karat
  goldValue: number;        // netWeight * pricePerGramAtKarat
  makingCharge: number;
  profit: number;
  taxableBase: number;      // base before tax
  tax: number;
  discount: number;
  finalAmount: number;
}

export function calculateGoldInvoice(input: GoldCalcInput): GoldCalcResult {
  const netWeight = Math.max(0, input.grossWeight - input.stoneWeight);
  const fineGoldWeight = (netWeight * input.karat) / 24;
  // 18K is the market reference, scale by karat ratio.
  const pricePerGramAtKarat = (input.pricePerGram18 * input.karat) / 18;
  const goldValue = netWeight * pricePerGramAtKarat;
  const makingCharge =
    (goldValue * input.makingChargePercent) / 100 + input.makingChargeFixed;
  const profit = ((goldValue + makingCharge) * input.profitPercent) / 100;
  const taxableBase = goldValue + makingCharge + profit;
  const tax = (taxableBase * input.taxPercent) / 100;
  const finalAmount = Math.max(
    0,
    taxableBase + tax - Math.max(0, input.discount)
  );

  return {
    netWeight: round(netWeight, 3),
    fineGoldWeight: round(fineGoldWeight, 3),
    pricePerGramAtKarat: round(pricePerGramAtKarat, 0),
    goldValue: round(goldValue, 0),
    makingCharge: round(makingCharge, 0),
    profit: round(profit, 0),
    taxableBase: round(taxableBase, 0),
    tax: round(tax, 0),
    discount: round(Math.max(0, input.discount), 0),
    finalAmount: round(finalAmount, 0),
  };
}

export function round(value: number, digits = 0): number {
  const f = Math.pow(10, digits);
  return Math.round(value * f) / f;
}
