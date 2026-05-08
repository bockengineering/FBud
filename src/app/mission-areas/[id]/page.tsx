import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { ProgramCard } from "@/components/ProgramCard";
import { getMissionArea, missionPrograms, money } from "@/lib/data";

export default async function MissionAreaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mission = getMissionArea(id);
  if (!mission) notFound();
  const programs = missionPrograms(mission);
  const top = [...programs].sort((a, b) => b.computed.fy2027_total - a.computed.fy2027_total).slice(0, 8);
  const increases = [...programs].sort((a, b) => b.computed.absolute_change_26_to_27 - a.computed.absolute_change_26_to_27).slice(0, 4);
  const declines = [...programs].sort((a, b) => a.computed.absolute_change_26_to_27 - b.computed.absolute_change_26_to_27).slice(0, 4);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="text-sm text-slate-400"><Link href="/dashboard" className="hover:text-cyan-200">Dashboard</Link> / <Link href="/mission-areas" className="hover:text-cyan-200">Mission Areas</Link></div>
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">Mission Area</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{mission.name}</h1>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard label="FY2027 total" value={money(mission.fy2027_total_amount_millions)} detail="Associated program funding" />
          <MetricCard label="Programs" value={`${programs.length}`} detail="Parsed from Weapons Book" href={`/programs?mission=${mission.id}`} />
          <MetricCard label="Source chapter" value={mission.source_page || "n/a"} detail="Mission intro page" />
        </div>
        <section>
          <h2 className="mb-3 text-xl font-semibold text-white">Top Programs</h2>
          <div className="grid gap-3 xl:grid-cols-2">{top.map((program) => <ProgramCard key={program.id} program={program} />)}</div>
        </section>
        <div className="grid gap-4 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Biggest Increases</h2>
            <div className="grid gap-3">{increases.map((program) => <ProgramCard key={program.id} program={program} />)}</div>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Biggest Declines</h2>
            <div className="grid gap-3">{declines.map((program) => <ProgramCard key={program.id} program={program} />)}</div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
