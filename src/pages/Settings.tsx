import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadSettings, saveSettings } from "@/lib/storage";
import type { AppSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/seed";
import { Save, RotateCcw } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadSettings<AppSettings>(DEFAULT_SETTINGS)
  );
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 2500);
    return () => clearTimeout(t);
  }, [status]);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    saveSettings(settings);
    setStatus("تنظیمات ذخیره شد");
  };

  const reset = () => {
    saveSettings(DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
    setStatus("تنظیمات پیش‌فرض بازگردانی شد");
  };

  const clearData = () => {
    if (!confirm("تمام داده‌های ذخیره شده پاک شود؟")) return;
    const keys = [
      "customers",
      "suppliers",
      "products",
      "sales",
      "purchases",
      "coins",
      "checks",
      "ledger",
    ];
    for (const k of keys) localStorage.removeItem(`goldshop:${k}`);
    setStatus("داده‌ها پاک شد. صفحه را بارگذاری مجدد کنید.");
  };

  return (
    <>
      <PageHeader
        title="تنظیمات"
        description="پیکربندی عمومی برنامه، قیمت پیش‌فرض طلا و پارامترهای فروش"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              بازگردانی پیش‌فرض
            </Button>
            <Button variant="gold" onClick={save}>
              <Save className="h-4 w-4" />
              ذخیره تنظیمات
            </Button>
          </div>
        }
      />
      {status ? (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {status}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">اطلاعات فروشگاه</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="نام فروشگاه">
              <Input
                value={settings.companyName}
                onChange={(e) => update("companyName", e.target.value)}
              />
            </Field>
            <Field label="شعبه">
              <Input
                value={settings.branch ?? ""}
                onChange={(e) => update("branch", e.target.value)}
              />
            </Field>
            <Field label="واحد پول">
              <Input
                value={settings.currency}
                onChange={(e) => update("currency", e.target.value)}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">قیمت و محاسبات</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="قیمت هر گرم ۱۸ عیار (ریال)">
              <Input
                type="number"
                value={settings.pricePerGram18}
                onChange={(e) =>
                  update("pricePerGram18", Number(e.target.value) || 0)
                }
              />
            </Field>
            <Field label="عیار پیش‌فرض">
              <Input
                type="number"
                value={settings.defaultKarat}
                onChange={(e) =>
                  update("defaultKarat", Number(e.target.value) || 18)
                }
              />
            </Field>
            <Field label="اجرت پیش‌فرض (٪)">
              <Input
                type="number"
                value={settings.defaultMakingPercent}
                onChange={(e) =>
                  update("defaultMakingPercent", Number(e.target.value) || 0)
                }
              />
            </Field>
            <Field label="سود فروشنده پیش‌فرض (٪)">
              <Input
                type="number"
                value={settings.defaultProfitPercent}
                onChange={(e) =>
                  update("defaultProfitPercent", Number(e.target.value) || 0)
                }
              />
            </Field>
            <Field label="مالیات پیش‌فرض (٪)">
              <Input
                type="number"
                value={settings.defaultTaxPercent}
                onChange={(e) =>
                  update("defaultTaxPercent", Number(e.target.value) || 0)
                }
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-destructive/40">
          <CardHeader>
            <CardTitle className="text-sm text-destructive">
              منطقه خطر
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              پاکسازی کامل داده‌های محلی (فروش، خرید، مشتری، تأمین‌کننده، چک، سکه، انبار).
            </div>
            <Button variant="destructive" onClick={clearData}>
              پاک کردن داده‌ها
            </Button>
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
