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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { useCollection } from "@/lib/hooks";
import { newId } from "@/lib/storage";
import type { CheckEntry } from "@/lib/types";
import { formatJalaliDate, formatPersianNumber } from "@/lib/jalali";
import { FileCheck, Plus, Trash2 } from "lucide-react";

const STATUSES: {
  value: CheckEntry["status"];
  label: string;
  tone: "default" | "success" | "warning" | "destructive" | "secondary";
}[] = [
  { value: "pending", label: "در انتظار", tone: "warning" },
  { value: "deposited", label: "واگذار به بانک", tone: "secondary" },
  { value: "cleared", label: "وصول شد", tone: "success" },
  { value: "returned", label: "برگشت", tone: "destructive" },
  { value: "transferred", label: "خرج شد", tone: "secondary" },
  { value: "cancelled", label: "باطل", tone: "destructive" },
];

const EMPTY: Omit<CheckEntry, "id" | "createdAt"> = {
  kind: "received",
  checkNumber: "",
  bank: "",
  branch: "",
  owner: "",
  amount: 0,
  issueJalali: "",
  dueJalali: "",
  status: "pending",
  notes: "",
};

export default function ChecksPage() {
  const { items, add, update, remove } = useCollection<CheckEntry>("checks");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY, issueJalali: formatJalaliDate() });

  const save = () => {
    if (!form.checkNumber.trim() || !form.amount) return;
    add({
      ...form,
      id: newId(),
      createdAt: formatJalaliDate(),
    });
    setOpen(false);
    setForm({ ...EMPTY, issueJalali: formatJalaliDate() });
  };

  return (
    <>
      <PageHeader
        title="چک‌ها"
        description="مدیریت چک‌های دریافتی و پرداختی و وضعیت وصول"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gold">
                <Plus className="h-4 w-4" /> ثبت چک
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ثبت چک جدید</DialogTitle>
                <DialogDescription>
                  اطلاعات چک، بانک، تاریخ سررسید و وضعیت
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <F label="نوع">
                  <Select
                    value={form.kind}
                    onValueChange={(v) =>
                      setForm({ ...form, kind: v as CheckEntry["kind"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">دریافتی</SelectItem>
                      <SelectItem value="paid">پرداختی</SelectItem>
                    </SelectContent>
                  </Select>
                </F>
                <F label="شماره چک">
                  <Input
                    value={form.checkNumber}
                    onChange={(e) =>
                      setForm({ ...form, checkNumber: e.target.value })
                    }
                  />
                </F>
                <F label="بانک">
                  <Input
                    value={form.bank}
                    onChange={(e) =>
                      setForm({ ...form, bank: e.target.value })
                    }
                  />
                </F>
                <F label="شعبه">
                  <Input
                    value={form.branch}
                    onChange={(e) =>
                      setForm({ ...form, branch: e.target.value })
                    }
                  />
                </F>
                <F label="صاحب حساب / دریافت‌کننده">
                  <Input
                    value={form.owner}
                    onChange={(e) =>
                      setForm({ ...form, owner: e.target.value })
                    }
                  />
                </F>
                <F label="مبلغ (ریال)">
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        amount: Number(e.target.value) || 0,
                      })
                    }
                  />
                </F>
                <F label="تاریخ صدور (شمسی)">
                  <Input
                    placeholder="۱۴۰۳/۰۱/۰۱"
                    value={form.issueJalali}
                    onChange={(e) =>
                      setForm({ ...form, issueJalali: e.target.value })
                    }
                  />
                </F>
                <F label="تاریخ سررسید (شمسی)">
                  <Input
                    placeholder="۱۴۰۳/۰۲/۰۱"
                    value={form.dueJalali}
                    onChange={(e) =>
                      setForm({ ...form, dueJalali: e.target.value })
                    }
                  />
                </F>
                <F label="وضعیت">
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm({ ...form, status: v as CheckEntry["status"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          {items.length === 0 ? (
            <EmptyState
              icon={<FileCheck className="h-6 w-6" />}
              title="چکی ثبت نشده"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نوع</TableHead>
                  <TableHead>شماره</TableHead>
                  <TableHead>بانک</TableHead>
                  <TableHead>صاحب</TableHead>
                  <TableHead>سررسید</TableHead>
                  <TableHead className="text-left">مبلغ</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => {
                  const status =
                    STATUSES.find((s) => s.value === c.status) ?? STATUSES[0];
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {c.kind === "received" ? "دریافتی" : "پرداختی"}
                        </Badge>
                      </TableCell>
                      <TableCell className="num">{c.checkNumber}</TableCell>
                      <TableCell>
                        {c.bank}
                        {c.branch ? (
                          <span className="text-[11px] text-muted-foreground">
                            {" "}
                            / {c.branch}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>{c.owner}</TableCell>
                      <TableCell>{c.dueJalali || "—"}</TableCell>
                      <TableCell className="num text-left font-medium">
                        {formatPersianNumber(c.amount)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={c.status}
                          onValueChange={(v) =>
                            update(c.id, {
                              status: v as CheckEntry["status"],
                            })
                          }
                        >
                          <SelectTrigger className="w-36 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="mt-1">
                          <Badge variant={status.tone as never}>
                            {status.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("حذف چک؟")) remove(c.id);
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
