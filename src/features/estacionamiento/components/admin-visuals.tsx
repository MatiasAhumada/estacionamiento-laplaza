import { Card, CardContent } from "@/components/ui/card";
import { DEMO_CURRENCY, DEMO_LOCALE } from "@/constants/demo.constant";

const money = new Intl.NumberFormat(DEMO_LOCALE, { style: "currency", currency: DEMO_CURRENCY, maximumFractionDigits: 0 });
const dateTime = new Intl.DateTimeFormat(DEMO_LOCALE, { dateStyle: "short", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" });

export function formatMoney(cents: number): string { return money.format(cents / 100); }
export function formatDateTime(value: string): string { return dateTime.format(new Date(value)); }

export function AdminStat({ label, value, detail, accent = false }: Readonly<{ label: string; value: string; detail: string; accent?: boolean }>) {
  return <Card className="gap-2 rounded-2xl border border-border p-4 shadow-sm sm:p-5">
    <p className="text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
    <p className={`font-display text-2xl font-extrabold tabular-nums tracking-tight sm:text-3xl ${accent ? "text-secondary" : "text-primary"}`}>{value}</p>
    <p className="text-xs text-muted-foreground">{detail}</p>
  </Card>;
}

export function AdminPanel({ title, subtitle, children, className = "" }: Readonly<{ title: string; subtitle?: string; children: React.ReactNode; className?: string }>) {
  return <Card className={`gap-4 rounded-2xl border border-border p-5 shadow-sm sm:p-6 ${className}`}>
    <div><h2 className="font-display text-lg font-bold text-primary">{title}</h2>{subtitle ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{subtitle}</p> : null}</div>
    <CardContent className="p-0">{children}</CardContent>
  </Card>;
}

export function AdminBarChart({ values, labels, color = "bg-secondary" }: Readonly<{ values: number[]; labels: string[]; color?: string }>) {
  const max = Math.max(1, ...values);
  return <div className="grid h-44 items-end gap-2" style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }} role="img" aria-label={values.map((value, index) => `${labels[index]}: ${formatMoney(value)}`).join("; ")}>
    {values.map((value, index) => <div className="flex h-full flex-col items-center justify-end gap-2" key={`${labels[index]}-${index}`}>
      <div className="flex w-full flex-1 items-end rounded-t-lg bg-muted/60"><div className={`w-full rounded-t-lg ${color}`} style={{ height: `${Math.max(value > 0 ? 5 : 0, value / max * 100)}%` }} /></div>
      <span className="text-[10px] font-medium text-muted-foreground">{labels[index]}</span>
    </div>)}
  </div>;
}

export function AdminDonut({ segments, center, label }: Readonly<{ segments: { label: string; value: number; color: string }[]; center: string; label: string }>) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-around">
    <div className="relative size-40 shrink-0" role="img" aria-label={`${label}: ${segments.map((item) => `${item.label} ${item.value}`).join(", ")}`}>
      <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="39" fill="none" stroke="#eaf1f5" strokeWidth="16" />
        {segments.map((item, index) => { const length = total > 0 ? item.value / total * 245 : 0; const start = total > 0 ? segments.slice(0, index).reduce((sum, previous) => sum + previous.value, 0) / total * 245 : 0; return <circle key={item.label} cx="50" cy="50" r="39" fill="none" stroke={item.color} strokeWidth="16" strokeDasharray={`${length} ${245 - length}`} strokeDashoffset={-start} />; })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-display text-2xl font-extrabold text-primary">{center}</span><span className="text-[10px] text-muted-foreground">{label}</span></div>
    </div>
    <div className="w-full space-y-2.5">{segments.map((item) => <div className="flex items-center justify-between gap-5 text-xs" key={item.label}><span className="flex items-center gap-2 text-muted-foreground"><span className="size-2.5 rounded-full" style={{ background: item.color }} />{item.label}</span><strong className="tabular-nums text-primary">{item.value}</strong></div>)}</div>
  </div>;
}
