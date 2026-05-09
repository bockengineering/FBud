import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { budgetLineSummary, getBudgetDocuments, getDataset, money } from "@/lib/data";

export default function SourcesPage() {
  const data = getDataset();
  const reviewRows = data.funding_rows.filter((row) => row.needs_review).length;
  const budgetDocuments = getBudgetDocuments();
  const lineSummary = budgetLineSummary();
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">Source Documents</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Sources</h1>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard label="Weapons pages" value={`${data.metadata.page_count}`} detail="Parsed page by page" />
          <MetricCard label="Programs" value={`${data.programs.length}`} detail="Program records" />
          <MetricCard label="Budget lines" value={`${lineSummary.lineItemCount}`} detail="R-1 / P-1 / O-1 rows" href="/budget-lines" />
          <MetricCard label="Needs review" value={`${reviewRows + lineSummary.reviewLineItemCount}`} detail="Funding and line rows" tone={reviewRows + lineSummary.reviewLineItemCount ? "negative" : "neutral"} />
        </div>
        <Card className="border-white/10 bg-white/[0.045] shadow-none">
          <CardHeader><CardTitle className="text-white">{data.metadata.title}</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
            <div><span className="text-slate-500">Fiscal year:</span> FY{data.metadata.fiscal_year}</div>
            <div><span className="text-slate-500">Document type:</span> {data.metadata.document_type}</div>
            <div><span className="text-slate-500">Source filename:</span> {data.metadata.source_filename}</div>
            <div><span className="text-slate-500">Parser output:</span> src/data/weapons-data.json</div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.045] shadow-none">
          <CardHeader><CardTitle className="text-white">Ingested Budget Documents</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Appropriation</TableHead>
                  <TableHead>Source file</TableHead>
                  <TableHead className="text-right">Rows</TableHead>
                  <TableHead className="text-right">FY2027 included</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetDocuments.map((document) => (
                  <TableRow key={document.id} className="border-white/10">
                    <TableCell className="font-medium text-slate-100">{document.title}</TableCell>
                    <TableCell><Badge className="bg-white/10 uppercase text-slate-100">{document.document_type}</Badge></TableCell>
                    <TableCell className="text-slate-400">{document.appropriation_type}</TableCell>
                    <TableCell className="text-slate-400">{document.source_filename}</TableCell>
                    <TableCell className="text-right">{document.row_count ?? "n/a"}</TableCell>
                    <TableCell className="text-right text-white">
                      {document.included_in_toa_total_millions ? money(document.included_in_toa_total_millions) : "n/a"}
                    </TableCell>
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
