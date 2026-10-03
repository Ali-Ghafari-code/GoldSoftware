// Minimal Gregorian ↔ Jalali conversion (Birashk algorithm).
// Returns Persian-formatted date strings without external libs.

function div(a: number, b: number): number {
  return Math.floor(a / b);
}

function gregorianToJalali(gy: number, gm: number, gd: number) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    jy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export function formatJalaliDate(d: Date = new Date()): string {
  const { jy, jm, jd } = gregorianToJalali(
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate()
  );
  const mm = String(jm).padStart(2, "0");
  const dd = String(jd).padStart(2, "0");
  return toPersianDigits(`${jy}/${mm}/${dd}`);
}

export function formatJalaliDateTime(d: Date = new Date()): string {
  const date = formatJalaliDate(d);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${date} - ${toPersianDigits(`${hh}:${mm}`)}`;
}

export function formatPersianNumber(
  value: number | string,
  fractionDigits = 0
): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "۰";
  const formatted = n.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return toPersianDigits(formatted);
}

export function formatRial(value: number | string): string {
  return `${formatPersianNumber(value)} ریال`;
}

export function formatGram(value: number | string, digits = 3): string {
  return `${formatPersianNumber(value, digits)} گرم`;
}
