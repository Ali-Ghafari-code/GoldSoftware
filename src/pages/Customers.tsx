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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { useCollection } from "@/lib/hooks";
import { newId } from "@/lib/storage";
import type { Customer } from "@/lib/types";
import { formatJalaliDate, formatPersianNumber } from "@/lib/jalali";
import { Plus, Trash2, Users } from "lucide-react";

const EMPTY: Omit<Customer, "id" | "createdAt"> = {
  code: "",
  name: "",
  mobile: "",
  nationalId: "",
  phone: "",
  city: "",
  address: "",
  category: "عادی",
  creditLimit: 0,
  openingRial: 0,
  openingGold: 0,
  notes: "",
};

export default function CustomersPage() {
  const { items, add, remove } = useCollection<Customer>("customers");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ ...EMPTY });

  const filtered = items.filter((c) => {
    if (!query) return true;
    const q = query.trim().toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.mobile ?? "").includes(q)
    );
  });

  const nextCode = () => {
    const nums = items
      .map((c) => Number(c.code.replace(/\D/g, "")))
      .filter((n) => Number.isFinite(n) && n > 0);
    const next = (nums.length ? Math.max(...nums) : 1000) + 1;
    return `C-${next}`;
  };

  const openDialog = () => {
    setForm({ ...EMPTY, code: nextCode() });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    const now = formatJalaliDate();
    add({
      ...form,
      id: newId(),
      code: form.code || nextCode(),
      createdAt: now,
    });
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="مشتریان"
        description="فهرست مشتریان، مانده افتتاحیه ریالی و طلایی"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gold" onClick={openDialog}>
                <Plus className="h-4 w-4" /> مشتری جدید
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>افزودن مشتری</DialogTitle>
                <DialogDescription>
                  اطلاعات مشتری جدید را تکمیل و ذخیره کنید
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <F label="کد مشتری">
                  <Input
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value })
                    }
                  />
                </F>
                <F label="نام و نام خانوادگی">
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
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
                <F label="کد ملی">
                  <Input
                    value={form.nationalId}
                    onChange={(e) =>
                      setForm({ ...form, nationalId: e.target.value })
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
                <F label="گروه مشتری">
                  <Input
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  />
                </F>
                <F label="سقف اعتبار (ریال)">
                  <Input
                    type="number"
                    value={form.creditLimit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        creditLimit: Number(e.target.value) || 0,
                      })
                    }
                  />
                </F>
                <F label="مانده ریالی اول دوره">
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
          <div className="mb-3 flex items-center gap-2">
            <Input
              placeholder="جستجو بر اساس نام، کد یا موبایل..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-sm"
            />
            <Badge variant="outline">
              {formatPersianNumber(filtered.length)} رکورد
            </Badge>
          </div>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="مشتری یافت نشد"
              description="برای شروع یک مشتری جدید ایجاد کنید"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>کد</TableHead>
                  <TableHead>نام</TableHead>
                  <TableHead>موبایل</TableHead>
                  <TableHead>شهر</TableHead>
                  <TableHead>گروه</TableHead>
                  <TableHead className="text-left">مانده ریال</TableHead>
                  <TableHead className="text-left">مانده طلا (گرم)</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.code}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="num">{c.mobile ?? "—"}</TableCell>
                    <TableCell>{c.city ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{c.category ?? "—"}</Badge>
                    </TableCell>
                    <TableCell className="num text-left">
                      {formatPersianNumber(c.openingRial ?? 0)}
                    </TableCell>
                    <TableCell className="num text-left">
                      {formatPersianNumber(c.openingGold ?? 0, 3)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`حذف ${c.name}؟`)) remove(c.id);
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
