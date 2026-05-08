import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { getDataset, money, missionPrograms } from "@/lib/data";

export default function MissionAreasPage() {
  const data = getDataset();
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">Portfolios</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Mission Areas</h1>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {data.mission_areas
            .sort((a, b) => b.fy2027_total_amount_millions - a.fy2027_total_amount_millions)
            .map((mission) => {
              const programs = missionPrograms(mission).sort((a, b) => b.computed.fy2027_total - a.computed.fy2027_total);
              return (
                <Link key={mission.id} href={`/mission-areas/${mission.id}`} className="rounded-md border border-white/10 bg-white/[0.045] p-4 transition hover:border-cyan-300/40 hover:bg-white/[0.07]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{mission.name}</h2>
                      <p className="mt-1 text-sm text-slate-400">{programs.length} programs</p>
                    </div>
                    <div className="text-right text-2xl font-semibold text-white">{money(mission.fy2027_total_amount_millions)}</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                    {programs.slice(0, 4).map((program) => <span key={program.id} className="rounded border border-white/10 px-2 py-1">{program.short_name}</span>)}
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </AppShell>
  );
}
