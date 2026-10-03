import { useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection } from "@/lib/hooks";
import type { Sale, Purchase, Product, LedgerEntry } from "@/lib/types";
import {
  formatGram,
  formatPersianNumber,
  formatRial,
} from "@/lib/jalali";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  const { items: sales } = useCollection<Sale>("sales");
  const { items: purchases } = useCollection<Purchase>("purchases");
  const { items: products } = useCollection<Product>("products");
  const { items: ledger } = useCollection<LedgerEntry>("ledger");

  const byDay = useMemo(() => {
    const map = new Map<string, { date: string; sales: number; purchases: number }>();
    for (const s of sales) {
      const prev = map.get(s.jalaliDate) ?? {
        date: s.jalaliDate,
        sales: 0,
        purchases: 0,
      };
      prev.sales += s.total;
      map.set(s.jalaliDate, prev);
    }
    for (const p of purchases) {
      const prev = map.get(p.jalaliDate) ?? {
        date: p.jalaliDate,
        sales: 0,
        purchases: 0,
      };
      prev.purchases += p.totalAmount;
      map.set(p.jalaliDate, prev);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.date < b.date ? 1 : -1
    );
  }, [sales, purchases]);

  const byKarat = useMemo(() => {
    const map = new Map<number, { karat: number; net: number; count: number }>();
    for (const p of products) {
      const net = Math.max(0, p.grossWeight - p.stoneWeight);
      const prev = map.get(p.karat) ?? { karat: p.karat, net: 0, count: 0 };
      prev.net += net;
      prev.count += 1;
      map.set(p.karat, prev);
    }
    return Array.from(map.values()).sort((a, b) => b.karat - a.karat);
  }, [products]);

  const perParty = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        rialDebit: number;
        rialCredit: number;
        goldDebit: number;
        goldCredit: number;
      }
    >();
    for (const e of ledger) {
      const prev = map.get(e.partyName) ?? {
        name: e.partyName,
        rialDebit: 0,
        rialCredit: 0,
        goldDebit: 0,
        goldCredit: 0,
      };
      prev.rialDebit += e.rialDebit;
      prev.rialCredit += e.rialCredit;
      prev.goldDebit += e.goldDebit;
      prev.goldCredit += e.goldCredit;
      map.set(e.partyName, prev);
    }
    return Array.from(map.values());
  }, [ledger]);

  return (
    <>
      <PageHeader
        title="گزارش‌ها"
        description="گزارش روزانه فروش و خرید، تحلیل عیار و خلاصه حساب‌ها"
      />
      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">فروش و خرید روزانه</TabsTrigger>
          <TabsTrigger value="karat">موجودی به تفکیک عیار</TabsTrigger>
          <TabsTrigger value="party">خلاصه حساب‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">فروش و خرید بر اساس روز</CardTitle>
            </CardHeader>
            <CardContent>
              {byDay.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
                  داده‌ای برای نمایش نیست
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>تاریخ</TableHead>
                      <TableHead className="text-left">مجموع فروش</TableHead>
                      <TableHead className="text-left">مجموع خرید</TableHead>
                      <TableHead className="text-left">اختلاف</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byDay.map((d) => (
                      <TableRow key={d.date}>
                        <TableCell>{d.date}</TableCell>
                        <TableCell className="num text-left">
                          {formatRial(d.sales)}
                        </TableCell>
                        <TableCell className="num text-left">
                          {formatRial(d.purchases)}
                        </TableCell>
                        <TableCell className="num text-left font-medium">
                          {formatRial(d.sales - d.purchases)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="karat">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">موجودی طلا به تفکیک عیار</CardTitle>
            </CardHeader>
            <CardContent>
              {byKarat.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
                  کالایی ثبت نشده
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>عیار</TableHead>
                      <TableHead>تعداد قلم</TableHead>
                      <TableHead className="text-left">مجموع وزن خالص</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byKarat.map((k) => (
                      <TableRow key={k.karat}>
                        <TableCell>
                          <Badge variant="secondary">
                            {formatPersianNumber(k.karat)}
                          </Badge>
                        </TableCell>
                        <TableCell className="num">
                          {formatPersianNumber(k.count)}
                        </TableCell>
                        <TableCell className="num text-left font-medium">
                          {formatGram(k.net, 3)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="party">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">خلاصه حساب‌های طرفین</CardTitle>
            </CardHeader>
            <CardContent>
              {perParty.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
                  داده‌ای برای نمایش نیست
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام</TableHead>
                      <TableHead className="text-left">بدهکار ریال</TableHead>
                      <TableHead className="text-left">بستانکار ریال</TableHead>
                      <TableHead className="text-left">بدهکار طلا</TableHead>
                      <TableHead className="text-left">بستانکار طلا</TableHead>
                      <TableHead className="text-left">مانده ریال</TableHead>
                      <TableHead className="text-left">مانده طلا</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perParty.map((p) => (
                      <TableRow key={p.name}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="num text-left">
                          {formatPersianNumber(p.rialDebit)}
                        </TableCell>
                        <TableCell className="num text-left">
                          {formatPersianNumber(p.rialCredit)}
                        </TableCell>
                        <TableCell className="num text-left">
                          {formatPersianNumber(p.goldDebit, 3)}
                        </TableCell>
                        <TableCell className="num text-left">
                          {formatPersianNumber(p.goldCredit, 3)}
                        </TableCell>
                        <TableCell className="num text-left font-medium">
                          {formatPersianNumber(p.rialDebit - p.rialCredit)}
                        </TableCell>
                        <TableCell className="num text-left font-medium">
                          {formatPersianNumber(
                            p.goldDebit - p.goldCredit,
                            3
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
