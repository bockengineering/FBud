import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { delta, money, pct, source } from "@/lib/data";
import type { Program } from "@/lib/types";

export function ProgramCard({ program }: { program: Program }) {
  const contractor = program.prime_contractors[0]?.name ?? "Contractor pending";
  const change = program.computed.absolute_change_26_to_27;
  return (
    <Link href={`/programs/${program.id}`}>
      <Card className="h-full border-white/10 bg-white/[0.045] shadow-none transition hover:border-cyan-300/40 hover:bg-white/[0.07]">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="line-clamp-2 font-semibold text-white">{program.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{program.mission_area}</p>
            </div>
            <Badge variant="outline" className="border-white/10 text-slate-300">
              {source(program.page_label)}
            </Badge>
          </div>
          <p className="mt-4 line-clamp-2 text-sm text-slate-300">{program.description || program.mission}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-slate-500">FY2027</div>
              <div className="font-semibold text-white">{money(program.computed.fy2027_total)}</div>
            </div>
            <div>
              <div className="text-slate-500">26 to 27</div>
              <div className={change >= 0 ? "font-semibold text-emerald-300" : "font-semibold text-orange-300"}>
                {delta(change)} {pct(program.computed.percent_change_26_to_27)}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="bg-blue-400/10 text-blue-200">RDT&E {money(program.computed.fy2027_rdte)}</Badge>
            <Badge className="bg-emerald-400/10 text-emerald-200">Proc {money(program.computed.fy2027_procurement)}</Badge>
          </div>
          <div className="mt-3 text-xs text-slate-500">{contractor}</div>
        </CardContent>
      </Card>
    </Link>
  );
}
