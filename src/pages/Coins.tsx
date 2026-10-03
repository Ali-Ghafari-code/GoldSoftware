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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { useCollection } from "@/lib/hooks";
import { newId } from "@/lib/storage";
import type { CoinEntry, CoinType } from "@/lib/types";
import { formatJalaliDate, formatPersianNumber, toPersianDigits } from "@/lib/jalali";
import { Coins, Plus, Trash2 } from "lucide-react";

const TYPES: { value: CoinType; label: string }[] = [
  { value: "emami", label: "سکه امامی" },
  { value: "bahar", label: "بهار آزادی" },
  { value: "half", label: "نیم سکه" },
  { value: "quarter", label: "ربع سکه" },
  { value: "parsian", label: "پارسیان" },
  { value: "custom", label: "سایر" },
];

export default function CoinsPage() {
  const { items, add, remove } = useCollection<CoinEntry>("coins");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "emami" as CoinType,
    label: "سکه امامی",
    quantity: 1,
    pricePerCoin: 45_000_000,
    direction: "in" as "in" | "out",
    partyName: "",
  });

  const balances = useMemo(() => {
    const map = new Map<string, { label: string; qty: number }>();
    for (const i of items) {
      const key = i.type === "custom" ? `custom:${i.label}` : i.type;
      const prev = map.get(key) ?? { label: i.label, qty: 0 };
      prev.qty += i.direction === "in" ? i.quantity : -i.quantity;
      prev.label = i.label;
      map.set(key, prev);
    }
    return Array.from(map.entries()).map(([key, v]) => ({ key, ...v }));
  }, [items]);

  const save = () => {
    if (!form.quantity) return;
    add({
      id: newId(),
      type: form.type,
      label:
        form.type === "custom"
          ? form.label || "سایر"
          : TYPES.find((t) => t.value === form.type)?.label ?? form.type,
      quantity: form.quantity,
      pricePerCoin: form.pricePerCoin,
      direction: form.direction,
      partyName: form.partyName,
      jalaliDate: formatJalaliDate(),
      createdAt: formatJalaliDate(),
    });
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="سکه"
        description="ثبت ورود/خروج سکه و مانده هر نوع"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gold">
                <Plus className="h-4 w-4" /> ثبت سکه
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ثبت تراکنش سکه</DialogTitle>
                <DialogDescription>
                  نوع سکه، تعداد و جهت تراکنش را مشخص کنید
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <F label="نوع سکه">
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      setForm({ ...form, type: v as CoinType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </F>
                {form.type === "custom" ? (
                  <F label="عنوان">
                    <Input
                      value={form.label}
                      onChange={(e) =>
                        setForm({ ...form, label: e.target.value })
                      }
                    />
                  </F>
                ) : null}
                <F label="تعداد">
                  <Input
                    type="number"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantity: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                  />
                </F>
                <F label="قیمت واحد (ریال)">
                  <Input
                    type="number"
                    value={form.pricePerCoin}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pricePerCoin: Number(e.target.value) || 0,
                      })
                    }
                  />
                </F>
                <F label="جهت">
                  <Select
                    value={form.direction}
                    onValueChange={(v) =>
                      setForm({ ...form, direction: v as "in" | "out" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">ورود (خرید / دریافت)</SelectItem>
                      <SelectItem value="out">خروج (فروش / تحویل)</SelectItem>
                    </SelectContent>
                  </Select>
                </F>
                <F label="طرف معامله">
                  <Input
                    value={form.partyName}
                    onChange={(e) =>
                      setForm({ ...form, partyName: e.target.value })
                    }
                  />
                </F>
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

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {balances.length === 0 ? (
          <Card className="sm:col-span-3">
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              موجودی سکه‌ای ثبت نشده
            </CardContent>
          </Card>
        ) : (
          balances.map((b) => (
            <Card key={b.key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{b.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="num text-2xl font-semibold">
                  {toPersianDigits(b.qty)}
                </div>
                <div className="text-xs text-muted-foreground">عدد</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          {items.length === 0 ? (
            <EmptyState
              icon={<Coins className="h-6 w-6" />}
              title="تراکنش سکه‌ای ثبت نشده"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>نوع</TableHead>
                  <TableHead>تعداد</TableHead>
                  <TableHead>جهت</TableHead>
                  <TableHead>قیمت واحد</TableHead>
                  <TableHead>طرف معامله</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.jalaliDate}</TableCell>
                    <TableCell className="font-medium">{c.label}</TableCell>
                    <TableCell className="num">
                      {formatPersianNumber(c.quantity)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={c.direction === "in" ? "success" : "warning"}
                      >
                        {c.direction === "in" ? "ورود" : "خروج"}
                      </Badge>
                    </TableCell>
                    <TableCell className="num">
                      {formatPersianNumber(c.pricePerCoin)}
                    </TableCell>
                    <TableCell>{c.partyName ?? "—"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("حذف تراکنش؟")) remove(c.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
