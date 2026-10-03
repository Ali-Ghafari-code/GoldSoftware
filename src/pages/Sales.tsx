import { useMemo, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/common/EmptyState";
import { useCollection } from "@/lib/hooks";
import { newId, addItem } from "@/lib/storage";
import type { Customer, PaymentLine, Sale, LedgerEntry } from "@/lib/types";
import { calculateGoldInvoice } from "@/lib/calc";
import {
  formatJalaliDate,
  formatPersianNumber,
  formatRial,
  toPersianDigits,
} from "@/lib/jalali";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { loadSettings } from "@/lib/storage";
import type { AppSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/seed";

interface ItemDraft {
  id: string;
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
}

export default function SalesPage() {
  const { items: sales, add } = useCollection<Sale>("sales");
  const { items: customers } = useCollection<Customer>("customers");

  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState<string>("");
  const [notes, setNotes] = useState("");

  const settings = loadSettings<AppSettings>(DEFAULT_SETTINGS);

  const emptyLine = (): ItemDraft => ({
    id: newId(),
    productName: "",
    karat: settings.defaultKarat,
    grossWeight: 0,
    stoneWeight: 0,
    pricePerGram18: settings.pricePerGram18,
    makingChargePercent: settings.defaultMakingPercent,
    makingChargeFixed: 0,
    profitPercent: settings.defaultProfitPercent,
    taxPercent: settings.defaultTaxPercent,
    discount: 0,
  });

  const [lines, setLines] = useState<ItemDraft[]>([emptyLine()]);
  const [payments, setPayments] = useState<PaymentLine[]>([
    { id: newId(), method: "cash", amount: 0 },
  ]);

  const computedLines = useMemo(
    () =>
      lines.map((l) => {
        const r = calculateGoldInvoice(l);
        return { ...l, ...r };
      }),
    [lines]
  );

  const total = computedLines.reduce((s, l) => s + l.finalAmount, 0);
  const paid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const remaining = total - paid;

  const openDialog = () => {
    setCustomerId(customers[0]?.id ?? "");
    setNotes("");
    setLines([emptyLine()]);
    setPayments([{ id: newId(), method: "cash", amount: 0 }]);
    setOpen(true);
  };

  const nextInvoice = () => {
    const nums = sales
      .map((s) => Number(s.invoiceNumber.replace(/\D/g, "")))
      .filter((n) => Number.isFinite(n) && n > 0);
    const next = (nums.length ? Math.max(...nums) : 1000) + 1;
    return String(next);
  };

  const save = () => {
    if (computedLines.length === 0) return;
    const customer = customers.find((c) => c.id === customerId);
    const invoice = nextInvoice();
    const now = formatJalaliDate();
    const sale: Sale = {
      id: newId(),
      invoiceNumber: invoice,
      date: new Date().toISOString(),
      jalaliDate: now,
      customerId: customer?.id,
      customerName: customer?.name,
      items: computedLines.map((c) => ({
        id: c.id,
        productName: c.productName || "کالای متفرقه",
        karat: c.karat,
        grossWeight: c.grossWeight,
        stoneWeight: c.stoneWeight,
        pricePerGram18: c.pricePerGram18,
        makingChargePercent: c.makingChargePercent,
        makingChargeFixed: c.makingChargeFixed,
        profitPercent: c.profitPercent,
        taxPercent: c.taxPercent,
        discount: c.discount,
        finalAmount: c.finalAmount,
        fineGoldWeight: c.fineGoldWeight,
      })),
      payments: payments.filter((p) => Number(p.amount) > 0),
      total,
      paid,
      remaining,
      notes,
      createdAt: now,
    };
    add(sale);

    const totalGold = computedLines.reduce(
      (s, c) => s + Math.max(0, c.grossWeight - c.stoneWeight),
      0
    );

    const ledger: LedgerEntry = {
      id: newId(),
      jalaliDate: now,
      partyType: "customer",
      partyId: customer?.id,
      partyName: customer?.name ?? "مشتری متفرقه",
      description: `فروش - فاکتور ${invoice}`,
      rialDebit: total,
      rialCredit: paid,
      goldDebit: 0,
      goldCredit: totalGold,
      referenceType: "sale",
      referenceId: sale.id,
      createdAt: now,
    };
    addItem("ledger", ledger);
    setOpen(false);
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (id: string) =>
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.id !== id)));
  const updateLine = <K extends keyof ItemDraft>(
    id: string,
    key: K,
    value: ItemDraft[K]
  ) =>
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [key]: value } : l))
    );

  const addPayment = () =>
    setPayments((prev) => [
      ...prev,
      { id: newId(), method: "cash", amount: 0 },
    ]);
  const removePayment = (id: string) =>
    setPayments((prev) => prev.filter((p) => p.id !== id));
  const updatePayment = <K extends keyof PaymentLine>(
    id: string,
    key: K,
    value: PaymentLine[K]
  ) =>
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: value } : p))
    );

  return (
    <>
      <PageHeader
        title="فروش"
        description="ثبت فاکتور فروش طلا و جواهر، سکه و آبشده"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gold" onClick={openDialog}>
                <Plus className="h-4 w-4" /> فروش جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle>فاکتور فروش جدید</DialogTitle>
                <DialogDescription>
                  اقلام فاکتور، اطلاعات مشتری و روش‌های پرداخت را وارد کنید
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <F label="مشتری">
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب مشتری" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </F>
                <F label="تاریخ">
                  <Input value={formatJalaliDate()} readOnly />
                </F>
                <F label="شماره فاکتور">
                  <Input value={toPersianDigits(nextInvoice())} readOnly />
                </F>
              </div>

              <Separator />

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>شرح کالا</TableHead>
                      <TableHead>عیار</TableHead>
                      <TableHead>ناخالص</TableHead>
                      <TableHead>سنگ</TableHead>
                      <TableHead>قیمت ۱۸ع</TableHead>
                      <TableHead>اجرت ٪</TableHead>
                      <TableHead>سود ٪</TableHead>
                      <TableHead>مالیات ٪</TableHead>
                      <TableHead className="text-left">نهایی</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {computedLines.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="min-w-[160px]">
                          <Input
                            value={l.productName}
                            onChange={(e) =>
                              updateLine(l.id, "productName", e.target.value)
                            }
                            placeholder="نام کالا"
                          />
                        </TableCell>
                        <TableCell className="w-20">
                          <Input
                            type="number"
                            value={l.karat}
                            onChange={(e) =>
                              updateLine(
                                l.id,
                                "karat",
                                Number(e.target.value) || 0
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="w-24">
                          <Input
                            type="number"
                            step="0.001"
                            value={l.grossWeight}
                            onChange={(e) =>
                              updateLine(
                                l.id,
                                "grossWeight",
                                Number(e.target.value) || 0
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="w-24">
                          <Input
                            type="number"
                            step="0.001"
                            value={l.stoneWeight}
                            onChange={(e) =>
                              updateLine(
                                l.id,
                                "stoneWeight",
                                Number(e.target.value) || 0
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="w-32">
                          <Input
                            type="number"
                            value={l.pricePerGram18}
                            onChange={(e) =>
                              updateLine(
                                l.id,
                                "pricePerGram18",
                                Number(e.target.value) || 0
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="w-20">
                          <Input
                            type="number"
                            value={l.makingChargePercent}
                            onChange={(e) =>
                              updateLine(
                                l.id,
                                "makingChargePercent",
                                Number(e.target.value) || 0
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="w-20">
                          <Input
                            type="number"
                            value={l.profitPercent}
                            onChange={(e) =>
                              updateLine(
                                l.id,
                                "profitPercent",
                                Number(e.target.value) || 0
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="w-20">
                          <Input
                            type="number"
                            value={l.taxPercent}
                            onChange={(e) =>
                              updateLine(
                                l.id,
                                "taxPercent",
                                Number(e.target.value) || 0
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="num text-left font-medium">
                          {formatPersianNumber(l.finalAmount)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLine(l.id)}
                            disabled={lines.length <= 1}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button variant="outline" size="sm" onClick={addLine}>
                <Plus className="h-4 w-4" /> افزودن قلم
              </Button>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-medium">پرداخت‌ها</div>
                  <div className="space-y-2">
                    {payments.map((p) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <Select
                          value={p.method}
                          onValueChange={(v) =>
                            updatePayment(p.id, "method", v as PaymentLine["method"])
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">نقدی</SelectItem>
                            <SelectItem value="pos">کارت‌خوان</SelectItem>
                            <SelectItem value="transfer">واریز بانکی</SelectItem>
                            <SelectItem value="check">چک</SelectItem>
                            <SelectItem value="credit">حساب مشتری</SelectItem>
                            <SelectItem value="gold">طلا</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={p.amount}
                          onChange={(e) =>
                            updatePayment(
                              p.id,
                              "amount",
                              Number(e.target.value) || 0
                            )
                          }
                          placeholder="مبلغ"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePayment(p.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addPayment}>
                      <Plus className="h-4 w-4" /> افزودن پرداخت
                    </Button>
                  </div>
                </div>
                <div className="space-y-3 rounded-md border bg-muted/40 p-4">
                  <SummaryRow
                    label="مجموع فاکتور"
                    value={formatPersianNumber(total)}
                  />
                  <SummaryRow
                    label="مجموع پرداخت‌ها"
                    value={formatPersianNumber(paid)}
                  />
                  <Separator />
                  <SummaryRow
                    label="مانده"
                    value={formatPersianNumber(remaining)}
                    strong
                  />
                </div>
              </div>

              <F label="یادداشت">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </F>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  انصراف
                </Button>
                <Button variant="gold" onClick={save}>
                  ذخیره فاکتور
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-4">
          {sales.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="h-6 w-6" />}
              title="فاکتوری ثبت نشده"
              description="برای ثبت فروش جدید دکمه بالا را بزنید"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>شماره</TableHead>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>مشتری</TableHead>
                  <TableHead>اقلام</TableHead>
                  <TableHead className="text-left">مجموع</TableHead>
                  <TableHead className="text-left">پرداختی</TableHead>
                  <TableHead className="text-left">مانده</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="num">
                      {toPersianDigits(s.invoiceNumber)}
                    </TableCell>
                    <TableCell>{s.jalaliDate}</TableCell>
                    <TableCell>{s.customerName ?? "متفرقه"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatPersianNumber(s.items.length)} قلم
                      </Badge>
                    </TableCell>
                    <TableCell className="num text-left">
                      {formatRial(s.total)}
                    </TableCell>
                    <TableCell className="num text-left">
                      {formatPersianNumber(s.paid)}
                    </TableCell>
                    <TableCell className="num text-left font-medium">
                      {formatPersianNumber(s.remaining)}
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

function SummaryRow({
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
        "flex items-center justify-between text-sm " +
        (strong ? "text-base font-semibold" : "")
      }
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="num">{value}</span>
    </div>
  );
}
