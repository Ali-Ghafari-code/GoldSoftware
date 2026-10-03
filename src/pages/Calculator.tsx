import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadSettings } from "@/lib/storage";
import type { AppSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/seed";
import { calculateGoldInvoice } from "@/lib/calc";
import { formatGram, formatPersianNumber } from "@/lib/jalali";
import { Separator } from "@/components/ui/separator";

export default function CalculatorPage() {
  const settings = loadSettings<AppSettings>(DEFAULT_SETTINGS);
  const [form, setForm] = useState({
    grossWeight: 5,
    stoneWeight: 0,
    karat: settings.defaultKarat,
    pricePerGram18: settings.pricePerGram18,
    makingChargePercent: settings.defaultMakingPercent,
    makingChargeFixed: 0,
    profitPercent: settings.defaultProfitPercent,
    taxPercent: settings.defaultTaxPercent,
    discount: 0,
  });

  const result = useMemo(() => calculateGoldInvoice(form), [form]);

  const set = <K extends keyof typeof form>(k: K, v: number) =>
    setForm((f) => ({ ...f, [k]: Number.isFinite(v) ? v : 0 }));

  return (
    <>
      <PageHeader
        title="ماشین حساب طلا"
        description="محاسبه سریع قیمت نهایی بدون نیاز به ایجاد فاکتور"
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">پارامترها</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="وزن ناخالص (گرم)">
              <Input
                type="number"
                step="0.001"
                value={form.grossWeight}
                onChange={(e) => set("grossWeight", Number(e.target.value))}
              />
            </Field>
            <Field label="وزن سنگ (گرم)">
              <Input
                type="number"
                step="0.001"
                value={form.stoneWeight}
                onChange={(e) => set("stoneWeight", Number(e.target.value))}
              />
            </Field>
            <Field label="عیار">
              <Input
                type="number"
                value={form.karat}
                onChange={(e) => set("karat", Number(e.target.value))}
              />
            </Field>
            <Field label="قیمت هر گرم ۱۸ عیار (ریال)">
              <Input
                type="number"
                value={form.pricePerGram18}
                onChange={(e) => set("pricePerGram18", Number(e.target.value))}
              />
            </Field>
            <Field label="اجرت درصدی (٪)">
              <Input
                type="number"
                value={form.makingChargePercent}
                onChange={(e) =>
                  set("makingChargePercent", Number(e.target.value))
                }
              />
            </Field>
            <Field label="اجرت ثابت (ریال)">
              <Input
                type="number"
                value={form.makingChargeFixed}
                onChange={(e) =>
                  set("makingChargeFixed", Number(e.target.value))
                }
              />
            </Field>
            <Field label="سود فروشنده (٪)">
              <Input
                type="number"
                value={form.profitPercent}
                onChange={(e) => set("profitPercent", Number(e.target.value))}
              />
            </Field>
            <Field label="مالیات (٪)">
              <Input
                type="number"
                value={form.taxPercent}
                onChange={(e) => set("taxPercent", Number(e.target.value))}
              />
            </Field>
            <Field label="تخفیف (ریال)">
              <Input
                type="number"
                value={form.discount}
                onChange={(e) => set("discount", Number(e.target.value))}
              />
            </Field>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">تفکیک محاسبه</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="وزن خالص" value={formatGram(result.netWeight, 3)} />
            <Row
              label="معادل طلای خالص"
              value={formatGram(result.fineGoldWeight, 3)}
            />
            <Row
              label={`قیمت هر گرم (${formatPersianNumber(form.karat)} عیار)`}
              value={formatPersianNumber(result.pricePerGramAtKarat)}
            />
            <Separator />
            <Row
              label="ارزش طلا"
              value={formatPersianNumber(result.goldValue)}
            />
            <Row
              label="اجرت ساخت"
              value={formatPersianNumber(result.makingCharge)}
            />
            <Row label="سود فروشنده" value={formatPersianNumber(result.profit)} />
            <Row label="مالیات" value={formatPersianNumber(result.tax)} />
            <Row label="تخفیف" value={`-${formatPersianNumber(result.discount)}`} />
            <Separator />
            <Row
              label="مبلغ قابل پرداخت"
              value={formatPersianNumber(result.finalAmount)}
              strong
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={
        "flex items-center justify-between " +
        (strong ? "text-base font-semibold" : "")
      }
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="num">{value}</span>
    </div>
  );
}
