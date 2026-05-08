import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  detail,
  href,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail?: string;
  href?: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  const inner = (
    <Card className="h-full border-white/10 bg-white/[0.045] shadow-none transition hover:border-cyan-300/40 hover:bg-white/[0.07]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{label}</p>
          {href ? <ArrowUpRight className="h-4 w-4 text-slate-500" /> : null}
        </div>
        <div
          className={cn(
            "mt-3 text-2xl font-semibold text-white",
            tone === "positive" && "text-emerald-300",
            tone === "negative" && "text-orange-300",
          )}
        >
          {value}
        </div>
        {detail ? <p className="mt-2 text-sm text-slate-400">{detail}</p> : null}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
