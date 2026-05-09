import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { MissionBreakdown } from "@/components/FundingCharts";
import { MetricCard } from "@/components/MetricCard";
import { ProgramCard } from "@/components/ProgramCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { budgetLineSummary, delta, getDataset, money, summary } from "@/lib/data";

export default function DashboardPage() {
  const data = getDataset();
  const totals = summary();
  const lineSummary = budgetLineSummary();
  const topPrograms = [...data.programs].sort((a, b) => b.computed.fy2027_total - a.computed.fy2027_total).slice(0, 10);
  const increases = [...data.programs].sort((a, b) => b.computed.absolute_change_26_to_27 - a.computed.absolute_change_26_to_27).slice(0, 6);
  const decreases = [...data.programs].sort((a, b) => a.computed.absolute_change_26_to_27 - b.computed.absolute_change_26_to_27).slice(0, 6);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">FY2027 Weapons Book</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Defense budget navigator</h1>
          <p className="mt-2 max-w-3xl text-slate-400">
            Executive map of weapon-system program funding across FY2025 actuals, FY2026 enacted/current funding, and the FY2027 President&apos;s Budget request.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard label="FY2027 total" value={money(totals.totalFy2027)} detail="Across extracted programs" />
          <MetricCard label="Programs" value={`${totals.programCount}`} detail="Parsed program pages" href="/programs" />
          <MetricCard label="Budget lines" value={`${lineSummary.lineItemCount}`} detail="R-1 / P-1 / O-1 rows" href="/budget-lines" />
          <MetricCard label="Mission areas" value={`${totals.missionCount}`} detail="Portfolio chapters" href="/mission-areas" />
          <MetricCard label="RDT&E" value={money(totals.rdteFy2027)} detail="Parsed FY2027 split" href="/programs?funding=rdte" />
          <MetricCard label="Procurement" value={money(totals.procurementFy2027)} detail="Parsed FY2027 split" href="/programs?funding=procurement" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_1.25fr]">
          <Card className="border-white/10 bg-white/[0.045] shadow-none">
            <CardHeader>
              <CardTitle className="text-white">Mission-Area Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <MissionBreakdown missions={data.mission_areas} />
              <div className="grid gap-2">
                {data.mission_areas
                  .sort((a, b) => b.fy2027_total_amount_millions - a.fy2027_total_amount_millions)
                  .map((mission) => (
                    <Link key={mission.id} href={`/mission-areas/${mission.id}`} className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/7">
                      <span className="text-slate-200">{mission.name}</span>
                      <span className="font-medium text-white">{money(mission.fy2027_total_amount_millions)}</span>
                    </Link>
                  ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.045] shadow-none">
            <CardHeader>
              <CardTitle className="text-white">Top 10 Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead>Program</TableHead>
                    <TableHead>Mission</TableHead>
                    <TableHead className="text-right">FY2027</TableHead>
                    <TableHead className="text-right">26 to 27</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPrograms.map((program) => (
                    <TableRow key={program.id} className="border-white/10">
                      <TableCell><Link className="font-medium text-cyan-200 hover:text-cyan-100" href={`/programs/${program.id}`}>{program.short_name}</Link></TableCell>
                      <TableCell className="text-slate-400">{program.mission_area}</TableCell>
                      <TableCell className="text-right text-white">{money(program.computed.fy2027_total)}</TableCell>
                      <TableCell className="text-right">{delta(program.computed.absolute_change_26_to_27)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Biggest Increases</h2>
              <Link href="/programs?cohort=growth&sort=growth" className="text-sm text-cyan-300">Open cohort</Link>
            </div>
            <div className="grid gap-3">
              {increases.map((program) => <ProgramCard key={program.id} program={program} />)}
            </div>
          </section>
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Biggest Declines</h2>
              <Link href="/programs?cohort=decline&sort=decline" className="text-sm text-cyan-300">Open cohort</Link>
            </div>
            <div className="grid gap-3">
              {decreases.map((program) => <ProgramCard key={program.id} program={program} />)}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
