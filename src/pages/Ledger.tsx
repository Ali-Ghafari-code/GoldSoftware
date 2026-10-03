import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { useCollection } from "@/lib/hooks";
import type { LedgerEntry } from "@/lib/types";
import { formatPersianNumber } from "@/lib/jalali";
import { BookOpen } from "lucide-react";

export default function LedgerPage() {
  const { items } = useCollection<LedgerEntry>("ledger");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter(
      (e) =>
        e.partyName.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
  }, [items, query]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, e) => ({
        rialDebit: acc.rialDebit + e.rialDebit,
        rialCredit: acc.rialCredit + e.rialCredit,
        goldDebit: acc.goldDebit + e.goldDebit,
        goldCredit: acc.goldCredit + e.goldCredit,
      }),
      { rialDebit: 0, rialCredit: 0, goldDebit: 0, goldCredit: 0 }
    );
  }, [filtered]);

  return (
    <>
      <PageHeader
        title="دفتر طلا و ریال"
        description="گزارش حرکت ریالی و طلایی بین حساب‌ها"
      />
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Input
              placeholder="جستجو بر اساس نام یا شرح..."
              className="max-w-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Badge variant="outline">
              {formatPersianNumber(filtered.length)} رکورد
            </Badge>
          </div>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-6 w-6" />}
              title="تراکنشی ثبت نشده"
              description="هر فروش و خرید به‌طور خودکار یک سند در این دفتر ایجاد می‌کند"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>طرف حساب</TableHead>
                  <TableHead>شرح</TableHead>
                  <TableHead className="text-left">بدهکار ریال</TableHead>
                  <TableHead className="text-left">بستانکار ریال</TableHead>
                  <TableHead className="text-left">بدهکار طلا</TableHead>
                  <TableHead className="text-left">بستانکار طلا</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.jalaliDate}</TableCell>
                    <TableCell>
                      <div className="font-medium">{e.partyName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {e.partyType === "customer" ? "مشتری" : "تأمین‌کننده"}
                      </div>
                    </TableCell>
                    <TableCell>{e.description}</TableCell>
                    <TableCell className="num text-left">
                      {formatPersianNumber(e.rialDebit)}
                    </TableCell>
                    <TableCell className="num text-left">
                      {formatPersianNumber(e.rialCredit)}
                    </TableCell>
                    <TableCell className="num text-left">
                      {formatPersianNumber(e.goldDebit, 3)}
                    </TableCell>
                    <TableCell className="num text-left">
                      {formatPersianNumber(e.goldCredit, 3)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-medium">
                    مجموع
                  </TableCell>
                  <TableCell className="num text-left">
                    {formatPersianNumber(totals.rialDebit)}
                  </TableCell>
                  <TableCell className="num text-left">
                    {formatPersianNumber(totals.rialCredit)}
                  </TableCell>
                  <TableCell className="num text-left">
                    {formatPersianNumber(totals.goldDebit, 3)}
                  </TableCell>
                  <TableCell className="num text-left">
                    {formatPersianNumber(totals.goldCredit, 3)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
