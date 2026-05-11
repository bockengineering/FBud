import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBudgetDocument, getBudgetLineItems, getDataset, lineItemRequestTotal, money, programForBudgetLineItem, source } from "@/lib/data";

export default function ReviewPage() {
  const data = getDataset();
  const programs = data.programs.filter((program) => program.needs_review);
  const rows = data.funding_rows.filter((row) => row.needs_review);
  const lineItems = getBudgetLineItems().filter((item) => item.needs_review);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">Parser QA</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Review Queue</h1>
          <p className="mt-2 text-slate-400">Rows here preserve the raw source text and should be checked before downstream analysis.</p>
          <Button asChild className="mt-4 bg-cyan-300 text-slate-950 hover:bg-cyan-200">
            <Link href="/curation">Open curation workspace</Link>
          </Button>
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
        <Card className="border-white/10 bg-white/[0.045] shadow-none">
          <CardHeader><CardTitle className="text-white">Budget Line Items Needing Review</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Line item</TableHead>
                  <TableHead>Doc</TableHead>
                  <TableHead>FY2027</TableHead>
                  <TableHead>Linked program</TableHead>
                  <TableHead>Source row</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.slice(0, 75).map((item) => {
                  const linkedProgram = programForBudgetLineItem(item);
                  const document = getBudgetDocument(item.document_id);
                  return (
                    <TableRow key={item.id} className="border-white/10">
                      <TableCell>
                        <Link href={`/budget-lines/${item.id}`} className="font-medium text-cyan-200">{item.line_item_name || "Untitled line item"}</Link>
                      </TableCell>
                      <TableCell className="uppercase text-slate-400">{item.document_type}</TableCell>
                      <TableCell>{money(lineItemRequestTotal(item))}</TableCell>
                      <TableCell>
                        {linkedProgram ? <Link href={`/programs/${linkedProgram.id}`} className="text-cyan-200">{linkedProgram.short_name}</Link> : <span className="text-slate-500">Unlinked</span>}
                        <div className="mt-1">
                          <Link href={`/curation?line=${item.id}`} className="text-xs text-cyan-300 hover:text-cyan-100">Curate</Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500">{document?.source_filename} · {item.source_page}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {lineItems.length > 75 ? <p className="mt-4 text-sm text-slate-500">Showing 75 of {lineItems.length} review rows.</p> : null}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
