import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Users,
  Truck,
  Package,
  BookOpen,
  Coins,
  FileCheck,
  BarChart3,
  Settings,
  Calculator,
  Gem,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "main" | "operations" | "finance" | "admin";
}

const items: NavItem[] = [
  { to: "/", label: "داشبورد", icon: LayoutDashboard, group: "main" },
  { to: "/sales", label: "فروش", icon: ShoppingCart, group: "operations" },
  { to: "/purchases", label: "خرید", icon: ShoppingBag, group: "operations" },
  { to: "/inventory", label: "انبار و ویترین", icon: Package, group: "operations" },
  { to: "/customers", label: "مشتریان", icon: Users, group: "operations" },
  { to: "/suppliers", label: "تأمین‌کنندگان", icon: Truck, group: "operations" },
  { to: "/ledger", label: "دفتر طلا و ریال", icon: BookOpen, group: "finance" },
  { to: "/coins", label: "سکه", icon: Coins, group: "finance" },
  { to: "/checks", label: "چک‌ها", icon: FileCheck, group: "finance" },
  { to: "/calculator", label: "ماشین حساب طلا", icon: Calculator, group: "finance" },
  { to: "/reports", label: "گزارش‌ها", icon: BarChart3, group: "admin" },
  { to: "/settings", label: "تنظیمات", icon: Settings, group: "admin" },
];

const groups: Array<{ key: NavItem["group"]; label: string }> = [
  { key: "main", label: "اصلی" },
  { key: "operations", label: "عملیات" },
  { key: "finance", label: "مالی و حساب" },
  { key: "admin", label: "پیکربندی" },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col border-l bg-card">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold-400 text-primary">
          <Gem className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold">مدیریت طلا و جواهر</div>
          <div className="text-xs text-muted-foreground">نسخه نمایشی</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map((group) => (
          <div key={group.key}>
            <div className="px-2 pb-2 text-[11px] font-semibold text-muted-foreground">
              {group.label}
            </div>
            <ul className="space-y-1">
              {items
                .filter((i) => i.group === group.key)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.to === "/"}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-accent"
                          )
                        }
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t px-5 py-3 text-[11px] text-muted-foreground">
        داده‌ها در مرورگر ذخیره می‌شود (بدون سرور)
      </div>
    </aside>
  );
}
