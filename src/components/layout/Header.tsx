import { formatJalaliDateTime, formatPersianNumber } from "@/lib/jalali";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { loadSettings } from "@/lib/storage";
import type { AppSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/seed";

export function Header() {
  const [now, setNow] = useState(() => new Date());
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadSettings<AppSettings>(DEFAULT_SETTINGS)
  );

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    const reload = () =>
      setSettings(loadSettings<AppSettings>(DEFAULT_SETTINGS));
    const onStorage = () => reload();
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(t);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-3">
        <div className="text-sm font-semibold">{settings.companyName}</div>
        {settings.branch ? (
          <Badge variant="outline" className="text-[11px]">
            {settings.branch}
          </Badge>
        ) : null}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div>
          قیمت ۱۸ عیار:{" "}
          <span className="font-medium text-foreground num">
            {formatPersianNumber(settings.pricePerGram18)}
          </span>{" "}
          ریال/گرم
        </div>
        <div>{formatJalaliDateTime(now)}</div>
      </div>
    </header>
  );
}
