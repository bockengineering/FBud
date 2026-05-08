import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { ProgramCard } from "@/components/ProgramCard";
import { contractorPrograms, getContractor, money } from "@/lib/data";

export default async function ContractorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contractor = getContractor(id);
  if (!contractor) notFound();
  const programs = contractorPrograms(contractor).sort((a, b) => b.computed.fy2027_total - a.computed.fy2027_total);
  const total = programs.reduce((sum, program) => sum + program.computed.fy2027_total, 0);
  const missions = new Set(programs.map((program) => program.mission_area));

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="text-sm text-slate-400"><Link href="/dashboard" className="hover:text-cyan-200">Dashboard</Link> / <Link href="/contractors" className="hover:text-cyan-200">Contractors</Link></div>
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">Contractor</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{contractor.name}</h1>
          <p className="mt-2 max-w-3xl text-slate-400">Associated program funding shown here is not contractor revenue or awarded contract value.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard label="Associated FY2027 funding" value={money(total)} detail="Across linked programs" />
          <MetricCard label="Programs" value={`${programs.length}`} detail="Prime-contractor mentions" />
          <MetricCard label="Mission exposure" value={`${missions.size}`} detail="Distinct portfolios" />
        </div>
        <div className="grid gap-3 xl:grid-cols-2">{programs.map((program) => <ProgramCard key={program.id} program={program} />)}</div>
      </div>
    </AppShell>
  );
}
