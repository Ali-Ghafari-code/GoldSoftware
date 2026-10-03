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
import { newId } from "@/lib/storage";
import type { Supplier } from "@/lib/types";
import { formatJalaliDate, formatPersianNumber } from "@/lib/jalali";
import { Plus, Trash2, Truck } from "lucide-react";

const EMPTY: Omit<Supplier, "id" | "createdAt"> = {
  code: "",
  name: "",
  type: "manufacturer",
  mobile: "",
  phone: "",
  city: "",
  address: "",
  openingRial: 0,
  openingGold: 0,
  notes: "",
};

const TYPES: { value: Supplier["type"]; label: string }[] = [
  { value: "manufacturer", label: "تولیدکننده" },
  { value: "wholesaler", label: "عمده‌فروش / بنکدار" },
  { value: "workshop", label: "کارگاه" },
  { value: "assay", label: "آزمایشگاه ری‌گیری" },
  { value: "other", label: "سایر" },
];

export default function SuppliersPage() {
  const { items, add, remove } = useCollection<Supplier>("suppliers");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });

  const nextCode = () => {
    const nums = items
      .map((c) => Number(c.code.replace(/\D/g, "")))
      .filter((n) => Number.isFinite(n) && n > 0);
    const next = (nums.length ? Math.max(...nums) : 2000) + 1;
    return `S-${next}`;
  };

  const openDialog = () => {
    setForm({ ...EMPTY, code: nextCode() });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    add({
      ...form,
      id: newId(),
      code: form.code || nextCode(),
      createdAt: formatJalaliDate(),
    });
    setOpen(false);
  };

  const typeLabel = (t: Supplier["type"]) =>
    TYPES.find((x) => x.value === t)?.label ?? t;

  return (
    <>
      <PageHeader
        title="تأمین‌کنندگان و همکاران"
        description="تولیدکننده، بنکدار، کارگاه، آزمایشگاه ری‌گیری"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gold" onClick={openDialog}>
                <Plus className="h-4 w-4" /> تأمین‌کننده جدید
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>افزودن تأمین‌کننده</DialogTitle>
                <DialogDescription>
                  اطلاعات طرف حساب جدید را تکمیل کنید
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <F label="کد">
                  <Input
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value })
                    }
                  />
                </F>
                <F label="نام">
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </F>
                <F label="نوع">
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      setForm({ ...form, type: v as Supplier["type"] })
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
                <F label="موبایل">
                  <Input
                    value={form.mobile}
                    onChange={(e) =>
                      setForm({ ...form, mobile: e.target.value })
                    }
                  />
                </F>
                <F label="تلفن">
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </F>
                <F label="شهر">
                  <Input
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                  />
                </F>
                <F label="مانده ریال اول دوره">
                  <Input
                    type="number"
                    value={form.openingRial}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        openingRial: Number(e.target.value) || 0,
                      })
                    }
                  />
                </F>
                <F label="مانده طلای اول دوره (گرم)">
                  <Input
                    type="number"
                    step="0.001"
                    value={form.openingGold}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        openingGold: Number(e.target.value) || 0,
                      })
                    }
                  />
                </F>
                <div className="col-span-2">
                  <F label="آدرس">
                    <Textarea
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                    />
                  </F>
                </div>
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
          {items.length === 0 ? (
            <EmptyState
              icon={<Truck className="h-6 w-6" />}
              title="تأمین‌کننده‌ای ثبت نشده"
              description="برای افزودن تأمین‌کننده جدید روی دکمه بالا کلیک کنید"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>کد</TableHead>
                  <TableHead>نام</TableHead>
                  <TableHead>نوع</TableHead>
                  <TableHead>موبایل</TableHead>
                  <TableHead>شهر</TableHead>
                  <TableHead className="text-left">مانده ریال</TableHead>
                  <TableHead className="text-left">مانده طلا</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.code}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{typeLabel(s.type)}</Badge>
                    </TableCell>
                    <TableCell className="num">{s.mobile ?? "—"}</TableCell>
                    <TableCell>{s.city ?? "—"}</TableCell>
                    <TableCell className="num text-left">
                      {formatPersianNumber(s.openingRial ?? 0)}
                    </TableCell>
                    <TableCell className="num text-left">
                      {formatPersianNumber(s.openingGold ?? 0, 3)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`حذف ${s.name}؟`)) remove(s.id);
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
