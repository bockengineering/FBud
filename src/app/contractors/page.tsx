import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { contractorPrograms, getDataset, money } from "@/lib/data";

export default function ContractorsPage() {
  const data = getDataset();
  const contractors = data.contractors
    .map((contractor) => {
      const programs = contractorPrograms(contractor);
      return {
        ...contractor,
        programs,
        total: programs.reduce((sum, program) => sum + program.computed.fy2027_total, 0),
        missions: Array.from(new Set(programs.map((program) => program.mission_area))),
      };
    })
    .filter((contractor) => contractor.programs.length)
    .sort((a, b) => b.total - a.total);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">Industrial Exposure</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Contractors</h1>
          <p className="mt-2 max-w-3xl text-slate-400">Totals are associated program funding, not contractor revenue or awarded contract value.</p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {contractors.map((contractor) => (
            <Link key={contractor.id} href={`/contractors/${contractor.id}`}>
              <Card className="border-white/10 bg-white/[0.045] shadow-none transition hover:border-cyan-300/40 hover:bg-white/[0.07]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{contractor.name}</h2>
                      <p className="mt-1 text-sm text-slate-400">{contractor.programs.length} programs</p>
                    </div>
                    <div className="text-right font-semibold text-white">{money(contractor.total)}</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {contractor.missions.slice(0, 4).map((mission) => <Badge key={mission} className="bg-slate-200/10 text-slate-200">{mission}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
