import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDataset } from "@/lib/data";

export default function SourcesPage() {
  const data = getDataset();
  const reviewRows = data.funding_rows.filter((row) => row.needs_review).length;
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">Source Documents</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Sources</h1>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard label="Pages" value={`${data.metadata.page_count}`} detail="Parsed page by page" />
          <MetricCard label="Programs" value={`${data.programs.length}`} detail="Program records" />
          <MetricCard label="Funding rows" value={`${data.funding_rows.length}`} detail="FY/type rows" />
          <MetricCard label="Needs review" value={`${reviewRows}`} detail="Funding rows" tone={reviewRows ? "negative" : "neutral"} />
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
      </div>
    </AppShell>
  );
}
