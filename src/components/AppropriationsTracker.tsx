import { CheckCircle2, CircleDashed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { delta, money, pct, programAppropriationStages } from "@/lib/data";
import type { Program } from "@/lib/types";

export function AppropriationsTracker({ program }: { program: Program }) {
  const stages = programAppropriationStages(program);

  return (
    <Card className="border-white/10 bg-white/[0.045] shadow-none">
      <CardHeader>
        <CardTitle className="text-white">Appropriations Tracker</CardTitle>
        <p className="text-sm text-slate-400">
          Tracks this program from the FY2027 President&apos;s Budget request through House, Senate, conference, and final enacted amounts.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 lg:grid-cols-5">
          {stages.map((stage) => (
            <div key={stage.id} className="rounded-md border border-white/10 bg-black/20 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{stage.chamber}</div>
                  <div className="mt-1 font-medium text-white">{stage.label}</div>
                </div>
                {stage.status === "loaded" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                ) : (
                  <CircleDashed className="h-4 w-4 text-slate-500" />
                )}
              </div>
              <div className="mt-4 text-2xl font-semibold text-white">
                {stage.amount_millions === null ? "Pending" : money(stage.amount_millions)}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                {stage.delta_from_request_millions === null
                  ? "Awaiting source document"
                  : `${delta(stage.delta_from_request_millions)} (${pct(stage.percent_delta_from_request ?? 0)}) vs request`}
              </div>
              <Badge className="mt-3 bg-white/8 text-slate-300">
                {stage.source_label ?? "No mark loaded"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
