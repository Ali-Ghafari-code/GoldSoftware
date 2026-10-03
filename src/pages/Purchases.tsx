import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { useCollection } from "@/lib/hooks";
import { addItem, newId } from "@/lib/storage";
import type {
  Supplier,
  Purchase,
  LedgerEntry,
  PaymentLine,
  Product,
} from "@/lib/types";
import {
  formatJalaliDate,
  formatPersianNumber,
  formatRial,
  toPersianDigits,
} from "@/lib/jalali";
import { Plus, ShoppingBag } from "lucide-react";
import { loadSettings } from "@/lib/storage";
import { DEFAULT_SETTINGS } from "@/lib/seed";
import type { AppSettings } from "@/lib/types";

const CATEGORIES: { value: Product["category"]; label: string }[] = [
  { value: "ring", label: "انگشتر" },
  { value: "bracelet", label: "دستبند" },
  { value: "necklace", label: "گردنبند" },
  { value: "earring", label: "گوشواره" },
  { value: "bullion", label: "طلای آبشده / شمش" },
  { value: "coin", label: "سکه" },
  { value: "scrap", label: "طلای شکسته / دست‌دوم" },
  { value: "other", label: "سایر" },
];

export default function PurchasesPage() {
  const settings = loadSettings<AppSettings>(DEFAULT_SETTINGS);
  const { items: purchases, add } = useCollection<Purchase>("purchases");
  const { items: suppliers } = useCollection<Supplier>("suppliers");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    supplierId: "",
    productName: "",
    category: "scrap" as Product["category"],
    karat: settings.defaultKarat,
    grossWeight: 0,
    stoneWeight: 0,
    pricePerGram18: settings.pricePerGram18,
    makingCharge: 0,
    paymentMethod: "cash" as PaymentLine["method"],
    paidAmount: 0,
    notes: "",
  });

  const nextInvoice = () => {
    const nums = purchases
      .map((p) => Number(p.invoiceNumber.replace(/\D/g, "")))
      .filter((n) => Number.isFinite(n) && n > 0);
    const next = (nums.length ? Math.max(...nums) : 5000) + 1;
    return String(next);
  };

  const totalAmount = (() => {
    const net = Math.max(0, form.grossWeight - form.stoneWeight);
    const price = (form.pricePerGram18 * form.karat) / 18;
    return Math.round(net * price + form.makingCharge);
  })();

  const openDialog = () =>
    setForm({
      supplierId: suppliers[0]?.id ?? "",
      productName: "",
      category: "scrap",
      karat: settings.defaultKarat,
      grossWeight: 0,
      stoneWeight: 0,
      pricePerGram18: settings.pricePerGram18,
      makingCharge: 0,
      paymentMethod: "cash",
      paidAmount: 0,
      notes: "",
    });

  const save = () => {
    const supplier = suppliers.find((s) => s.id === form.supplierId);
    const invoice = nextInvoice();
    const today = formatJalaliDate();
    const purchase: Purchase = {
      id: newId(),
      invoiceNumber: invoice,
      date: new Date().toISOString(),
      jalaliDate: today,
      supplierId: supplier?.id,
      supplierName: supplier?.name,
      productName: form.productName || "خرید طلا",
      category: form.category,
      karat: form.karat,
      grossWeight: form.grossWeight,
      stoneWeight: form.stoneWeight,
      pricePerGram18: form.pricePerGram18,
      makingCharge: form.makingCharge,
      totalAmount,
      payments: [
        { id: newId(), method: form.paymentMethod, amount: form.paidAmount },
      ],
      notes: form.notes,
      createdAt: today,
    };
    add(purchase);
    const ledger: LedgerEntry = {
      id: newId(),
      jalaliDate: today,
      partyType: "supplier",
      partyId: supplier?.id,
      partyName: supplier?.name ?? "تأمین‌کننده متفرقه",
      description: `خرید - فاکتور ${invoice}`,
      rialDebit: form.paidAmount,
      rialCredit: totalAmount,
      goldDebit: Math.max(0, form.grossWeight - form.stoneWeight),
      goldCredit: 0,
      referenceType: "purchase",
      referenceId: purchase.id,
      createdAt: today,
    };
    addItem("ledger", ledger);
    setOpen(false);
  };

  const catLabel = (c: Product["category"]) =>
    CATEGORIES.find((x) => x.value === c)?.label ?? c;

  return (
    <>
      <PageHeader
        title="خرید"
        description="ثبت خرید طلای نو، دست‌دوم، آبشده و سایر اقلام"
        actions={
          <Dialog
            open={open}
            onOpenChange={(v) => {
              if (v) openDialog();
              setOpen(v);
            }}
          >
            <DialogTrigger asChild>
              <Button variant="gold">
                <Plus className="h-4 w-4" /> خرید جدید
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ثبت خرید</DialogTitle>
                <DialogDescription>
                  اطلاعات کالا، وزن، عیار و قیمت را وارد کنید
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <F label="تأمین‌کننده">
                  <Select
                    value={form.supplierId}
                    onValueChange={(v) =>
                      setForm({ ...form, supplierId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </F>
                <F label="شرح کالا">
                  <Input
                    value={form.productName}
                    onChange={(e) =>
                      setForm({ ...form, productName: e.target.value })
                    }
                  />
                </F>
                <F label="دسته‌بندی">
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        category: v as Product["category"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </F>
                <F label="عیار">
                  <Input
                    type="number"
                    value={form.karat}
                    onChange={(e) =>
                      setForm({ ...form, karat: Number(e.target.value) || 18 })
                    }
                  />
                </F>
                <F label="وزن ناخالص (گرم)">
                  <Input
                    type="number"
                    step="0.001"
                    value={form.grossWeight}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        grossWeight: Number(e.target.value) || 0,
                      })
                    }
                  />
                </F>
                <F label="وزن سنگ (گرم)">
                  <Input
                    type="number"
                    step="0.001"
                    value={form.stoneWeight}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stoneWeight: Number(e.target.value) || 0,
                      })
                    }
                  />
                </F>
                <F label="قیمت هر گرم ۱۸ع">
                  <Input
                    type="number"
                    value={form.pricePerGram18}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pricePerGram18: Number(e.target.value) || 0,
                      })
                    }
                  />
                </F>
                <F label="اجرت پرداختی (ریال)">
                  <Input
                    type="number"
                    value={form.makingCharge}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        makingCharge: Number(e.target.value) || 0,
                      })
                    }
                  />
                </F>
                <F label="روش پرداخت">
                  <Select
                    value={form.paymentMethod}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        paymentMethod: v as PaymentLine["method"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقدی</SelectItem>
                      <SelectItem value="pos">کارت‌خوان</SelectItem>
                      <SelectItem value="transfer">واریز بانکی</SelectItem>
                      <SelectItem value="check">چک</SelectItem>
                      <SelectItem value="credit">حساب</SelectItem>
                      <SelectItem value="gold">طلا</SelectItem>
                    </SelectContent>
                  </Select>
                </F>
                <F label="مبلغ پرداختی">
                  <Input
                    type="number"
                    value={form.paidAmount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        paidAmount: Number(e.target.value) || 0,
                      })
                    }
                  />
                </F>
                <div className="col-span-2">
                  <F label="یادداشت">
                    <Textarea
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                    />
                  </F>
                </div>
              </div>
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    جمع فاکتور خرید
                  </span>
                  <span className="num text-base font-semibold">
                    {formatRial(totalAmount)}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  انصراف
                </Button>
                <Button variant="gold" onClick={save}>
                  ذخیره
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-4">
          {purchases.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="h-6 w-6" />}
              title="خریدی ثبت نشده"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>شماره</TableHead>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>تأمین‌کننده</TableHead>
                  <TableHead>شرح</TableHead>
                  <TableHead>دسته</TableHead>
                  <TableHead>عیار</TableHead>
                  <TableHead className="text-left">وزن خالص</TableHead>
                  <TableHead className="text-left">مبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="num">
                      {toPersianDigits(p.invoiceNumber)}
                    </TableCell>
                    <TableCell>{p.jalaliDate}</TableCell>
                    <TableCell>{p.supplierName ?? "متفرقه"}</TableCell>
                    <TableCell>{p.productName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {catLabel(p.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="num">
                      {formatPersianNumber(p.karat)}
                    </TableCell>
                    <TableCell className="num text-left">
                      {formatPersianNumber(
                        Math.max(0, p.grossWeight - p.stoneWeight),
                        3
                      )}
                    </TableCell>
                    <TableCell className="num text-left font-medium">
                      {formatPersianNumber(p.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
