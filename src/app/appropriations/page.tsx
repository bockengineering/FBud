import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { appropriationsSummary, getDataset, money } from "@/lib/data";

export default function AppropriationsPage() {
  const data = getDataset();
  const summary = appropriationsSummary();
  const topPrograms = [...data.programs].sort((a, b) => b.computed.fy2027_total - a.computed.fy2027_total).slice(0, 25);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">Legislative Tracking</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Appropriations Tracker</h1>
          <p className="mt-2 max-w-4xl text-slate-400">
            Tracks programs and future budget line items from the FY2027 President&apos;s Budget request into House and Senate marks, conference agreement, and final enacted funding.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard label="PB request baseline" value={money(summary.requestTotal)} detail="FY2027 Weapons Book programs" />
          <MetricCard label="Tracked programs" value={`${summary.trackedPrograms}`} detail="Program-level baselines" />
          <MetricCard label="Loaded marks" value={`${summary.loadedMarks}`} detail="PB request records" />
          <MetricCard label="Pending marks" value={`${summary.pendingStages}`} detail="House, Senate, conference, enacted" />
        </div>
        <Card className="border-white/10 bg-white/[0.045] shadow-none">
          <CardHeader>
            <CardTitle className="text-white">Legislative Stage Model</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-5">
            {[
              ["President's Budget", "Loaded", "Baseline request from the Weapons Book."],
              ["House Mark", "Pending", "Appropriations bill, report, or table markups."],
              ["Senate Mark", "Pending", "Senate bill, report, or table markups."],
              ["Conference / JES", "Pending", "Conference agreement and explanatory statement."],
              ["Final Enacted", "Pending", "Public law and enacted account/line-item amounts."],
            ].map(([label, status, detail]) => (
              <div key={label} className="rounded-md border border-white/10 bg-black/20 p-3">
                <div className="font-medium text-white">{label}</div>
                <Badge className={status === "Loaded" ? "mt-3 bg-emerald-400/10 text-emerald-200" : "mt-3 bg-white/8 text-slate-300"}>{status}</Badge>
                <p className="mt-3 text-sm text-slate-400">{detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.045] shadow-none">
          <CardHeader>
            <CardTitle className="text-white">Top Program Baselines</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Program</TableHead>
                  <TableHead>Mission Area</TableHead>
                  <TableHead className="text-right">PB Request</TableHead>
                  <TableHead className="text-right">House</TableHead>
                  <TableHead className="text-right">Senate</TableHead>
                  <TableHead className="text-right">Enacted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPrograms.map((program) => (
                  <TableRow key={program.id} className="border-white/10">
                    <TableCell>
                      <Link href={`/programs/${program.id}`} className="font-medium text-cyan-200 hover:text-cyan-100">
                        {program.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-400">{program.mission_area}</TableCell>
                    <TableCell className="text-right text-white">{money(program.computed.fy2027_total)}</TableCell>
                    <TableCell className="text-right text-slate-500">Pending</TableCell>
                    <TableCell className="text-right text-slate-500">Pending</TableCell>
                    <TableCell className="text-right text-slate-500">Pending</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
