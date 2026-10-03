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
import type { Product } from "@/lib/types";
import { formatGram, formatJalaliDate, formatPersianNumber } from "@/lib/jalali";
import { Package, Plus, Trash2 } from "lucide-react";

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

const EMPTY: Omit<Product, "id" | "createdAt"> = {
  code: "",
  barcode: "",
  jewelryNumber: "",
  name: "",
  category: "ring",
  karat: 18,
  grossWeight: 0,
  stoneWeight: 0,
  makingCharge: 0,
  location: "ویترین ۱",
  notes: "",
};

export default function InventoryPage() {
  const { items, add, remove } = useCollection<Product>("products");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });

  const nextCode = () => {
    const nums = items
      .map((p) => Number(p.code.replace(/\D/g, "")))
      .filter((n) => Number.isFinite(n) && n > 0);
    const next = (nums.length ? Math.max(...nums) : 3000) + 1;
    return `P-${next}`;
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

  const catLabel = (c: Product["category"]) =>
    CATEGORIES.find((x) => x.value === c)?.label ?? c;

  const totalGold = items.reduce(
    (s, p) => s + Math.max(0, p.grossWeight - p.stoneWeight),
    0
  );

  return (
    <>
      <PageHeader
        title="انبار و ویترین"
        description="فهرست کالاها، وزن، عیار و محل نگهداری"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gold" onClick={openDialog}>
                <Plus className="h-4 w-4" /> کالای جدید
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>افزودن کالا</DialogTitle>
                <DialogDescription>
                  مشخصات کالای جدید را وارد کنید
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <F label="کد کالا">
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
                      setForm({
                        ...form,
                        karat: Number(e.target.value) || 18,
                      })
                    }
                  />
                </F>
                <F label="بارکد">
                  <Input
                    value={form.barcode}
                    onChange={(e) =>
                      setForm({ ...form, barcode: e.target.value })
                    }
                  />
                </F>
                <F label="شماره جواهر">
                  <Input
                    value={form.jewelryNumber}
                    onChange={(e) =>
                      setForm({ ...form, jewelryNumber: e.target.value })
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
                <F label="اجرت پیش‌فرض (٪)">
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
                <F label="محل نگهداری">
                  <Input
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
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
          <div className="mb-3 flex items-center justify-between">
            <Badge variant="outline">
              {formatPersianNumber(items.length)} قلم کالا
            </Badge>
            <div className="text-xs text-muted-foreground">
              مجموع وزن خالص:{" "}
              <span className="num font-medium text-foreground">
                {formatGram(totalGold, 3)}
              </span>
            </div>
          </div>
          {items.length === 0 ? (
            <EmptyState
              icon={<Package className="h-6 w-6" />}
              title="کالایی ثبت نشده"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>کد</TableHead>
                  <TableHead>نام</TableHead>
                  <TableHead>دسته</TableHead>
                  <TableHead>عیار</TableHead>
                  <TableHead className="text-left">وزن ناخالص</TableHead>
                  <TableHead className="text-left">وزن سنگ</TableHead>
                  <TableHead className="text-left">وزن خالص</TableHead>
                  <TableHead>محل</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => {
                  const net = Math.max(0, p.grossWeight - p.stoneWeight);
                  return (
                    <TableRow key={p.id}>
                      <TableCell>{p.code}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {catLabel(p.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="num">
                        {formatPersianNumber(p.karat)}
                      </TableCell>
                      <TableCell className="num text-left">
                        {formatPersianNumber(p.grossWeight, 3)}
                      </TableCell>
                      <TableCell className="num text-left">
                        {formatPersianNumber(p.stoneWeight, 3)}
                      </TableCell>
                      <TableCell className="num text-left font-medium">
                        {formatPersianNumber(net, 3)}
                      </TableCell>
                      <TableCell>{p.location}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`حذف ${p.name}؟`)) remove(p.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
