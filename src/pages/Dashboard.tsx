import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCollection } from "@/lib/hooks";
import type {
  Sale,
  Purchase,
  Customer,
  Supplier,
  Product,
  CheckEntry,
  CoinEntry,
} from "@/lib/types";
import {
  formatGram,
  formatPersianNumber,
  formatRial,
  toPersianDigits,
} from "@/lib/jalali";
import { useMemo } from "react";
import {
  Coins,
  FileCheck,
  Package,
  ShoppingBag,
  ShoppingCart,
  Users,
  Scale,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { items: sales } = useCollection<Sale>("sales");
  const { items: purchases } = useCollection<Purchase>("purchases");
  const { items: customers } = useCollection<Customer>("customers");
  const { items: suppliers } = useCollection<Supplier>("suppliers");
  const { items: products } = useCollection<Product>("products");
  const { items: checks } = useCollection<CheckEntry>("checks");
  const { items: coins } = useCollection<CoinEntry>("coins");

  const stats = useMemo(() => {
    const totalSales = sales.reduce((s, x) => s + x.total, 0);
    const totalPurchases = purchases.reduce((s, x) => s + x.totalAmount, 0);
    const goldInInventory = products.reduce(
      (s, p) => s + Math.max(0, p.grossWeight - p.stoneWeight),
      0
    );
    const pendingChecks = checks.filter((c) => c.status === "pending").length;
    const coinQty = coins.reduce(
      (s, c) => s + (c.direction === "in" ? c.quantity : -c.quantity),
      0
    );
    return {
      totalSales,
      totalPurchases,
      goldInInventory,
      pendingChecks,
      coinQty,
    };
  }, [sales, purchases, products, checks, coins]);

  const quickActions = [
    { to: "/sales", label: "فروش جدید", icon: ShoppingCart, variant: "gold" as const },
    { to: "/purchases", label: "خرید جدید", icon: ShoppingBag, variant: "default" as const },
    { to: "/customers", label: "مشتری جدید", icon: Users, variant: "outline" as const },
    { to: "/inventory", label: "کالای جدید", icon: Package, variant: "outline" as const },
    { to: "/coins", label: "ثبت سکه", icon: Coins, variant: "outline" as const },
    { to: "/checks", label: "ثبت چک", icon: FileCheck, variant: "outline" as const },
    { to: "/calculator", label: "ماشین حساب", icon: Scale, variant: "outline" as const },
  ];

  return (
    <>
      <PageHeader
        title="داشبورد"
        description="نمای کلی عملیات فروشگاه طلا و جواهر"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {quickActions.map((a) => {
          const Icon = a.icon;
          return (
            <Button asChild key={a.to} variant={a.variant} size="sm">
              <Link to={a.to}>
                <Icon className="h-4 w-4" />
                {a.label}
              </Link>
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="مجموع فروش"
          value={formatRial(stats.totalSales)}
          icon={<ShoppingCart className="h-5 w-5" />}
          hint={`${toPersianDigits(sales.length)} فاکتور`}
        />
        <StatCard
          title="مجموع خرید"
          value={formatRial(stats.totalPurchases)}
          icon={<ShoppingBag className="h-5 w-5" />}
          hint={`${toPersianDigits(purchases.length)} فاکتور`}
        />
        <StatCard
          title="موجودی طلا"
          value={formatGram(stats.goldInInventory, 3)}
          icon={<Scale className="h-5 w-5" />}
          hint={`${toPersianDigits(products.length)} قلم کالا`}
        />
        <StatCard
          title="سکه در حساب"
          value={`${toPersianDigits(stats.coinQty)} عدد`}
          icon={<Coins className="h-5 w-5" />}
          hint={`${toPersianDigits(coins.length)} تراکنش`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">آخرین فروش‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <EmptyRow label="فروشی ثبت نشده است" />
            ) : (
              <ul className="space-y-2 text-sm">
                {sales.slice(0, 5).map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <div className="font-medium">
                        {s.customerName ?? "مشتری متفرقه"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        فاکتور {toPersianDigits(s.invoiceNumber)} · {s.jalaliDate}
                      </div>
                    </div>
                    <div className="num text-sm font-medium">
                      {formatPersianNumber(s.total)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">هشدارها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Alert
              label="چک‌های در انتظار وصول"
              value={`${toPersianDigits(stats.pendingChecks)} فقره`}
              tone="warning"
            />
            <Alert
              label="تعداد مشتریان ثبت شده"
              value={`${toPersianDigits(customers.length)} نفر`}
              tone="default"
            />
            <Alert
              label="تعداد تأمین‌کنندگان"
              value={`${toPersianDigits(suppliers.length)} مورد`}
              tone="default"
            />
            <Alert
              label="موجودی ریالی تقریبی"
              value={formatRial(stats.totalSales - stats.totalPurchases)}
              tone="success"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  icon,
  hint,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">{title}</div>
          <div className="num mt-1 text-base font-semibold">{value}</div>
          {hint ? (
            <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function Alert({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "default" | "warning" | "success";
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4 text-muted-foreground" />
        <span>{label}</span>
      </div>
      <Badge
        variant={
          tone === "warning"
            ? "warning"
            : tone === "success"
              ? "success"
              : "secondary"
        }
      >
        <span className="num">{value}</span>
      </Badge>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
      {label}
    </div>
  );
}
