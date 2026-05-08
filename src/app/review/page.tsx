import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDataset, money, source } from "@/lib/data";

export default function ReviewPage() {
  const data = getDataset();
  const programs = data.programs.filter((program) => program.needs_review);
  const rows = data.funding_rows.filter((row) => row.needs_review);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">Parser QA</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Review Queue</h1>
          <p className="mt-2 text-slate-400">Rows here preserve the raw source text and should be checked before downstream analysis.</p>
        </div>
        <Card className="border-white/10 bg-white/[0.045] shadow-none">
          <CardHeader><CardTitle className="text-white">Programs Needing Review</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Program</TableHead>
                  <TableHead>Mission</TableHead>
                  <TableHead>FY2027</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id} className="border-white/10">
                    <TableCell><Link href={`/programs/${program.id}`} className="font-medium text-cyan-200">{program.name}</Link></TableCell>
                    <TableCell className="text-slate-400">{program.mission_area}</TableCell>
                    <TableCell>{money(program.computed.fy2027_total)}</TableCell>
                    <TableCell><Badge className="bg-orange-400/10 text-orange-200">{(program.confidence_score * 100).toFixed(0)}%</Badge></TableCell>
                    <TableCell>{source(program.page_label)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.045] shadow-none">
          <CardHeader><CardTitle className="text-white">Funding Rows Needing Review</CardTitle></CardHeader>
          <CardContent className="text-slate-300">{rows.length} RDT&E or Procurement split rows require table-level validation. Total rows are sourced from the summary index.</CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
