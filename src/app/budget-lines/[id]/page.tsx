import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { BudgetLineAmountTrend, BudgetLineRequestSplit } from "@/components/BudgetLineCharts";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { delta, getBudgetDocument, getBudgetLineItem, lineItemDelta, lineItemRequestTotal, money, programForBudgetLineItem } from "@/lib/data";

function documentLabel(type: string) {
  if (type === "r1") return "R-1";
  if (type === "p1") return "P-1";
  if (type === "o1") return "O-1";
  return type;
}

function rawPretty(rawText: string | null) {
  if (!rawText) return "Raw row not available.";
  try {
    return JSON.stringify(JSON.parse(rawText), null, 2);
  } catch {
    return rawText;
  }
}

export default async function BudgetLineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getBudgetLineItem(id);
  if (!item) notFound();

  const document = getBudgetDocument(item.document_id);
  const linkedProgram = programForBudgetLineItem(item);
  const quantity = item.fy2027_total_quantity ?? item.quantity;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="text-sm text-slate-400">
          <Link href="/dashboard" className="hover:text-cyan-200">Dashboard</Link> /{" "}
          <Link href="/budget-lines" className="hover:text-cyan-200">Budget Lines</Link> /{" "}
          <span className="text-slate-200">{item.line_number || item.program_element}</span>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-cyan-400/10 text-cyan-200">{documentLabel(item.document_type)}</Badge>
                <Badge variant="outline" className="border-white/10 text-slate-300">{item.appropriation_type}</Badge>
                <Badge variant="outline" className="border-white/10 text-slate-300">{item.service_or_component}</Badge>
                {!item.include_in_toa ? <Badge className="bg-orange-400/10 text-orange-200">Memo / non-add</Badge> : null}
                {item.needs_review ? <Badge className="bg-orange-400/10 text-orange-200">Needs review</Badge> : null}
              </div>
              <h1 className="mt-4 text-4xl font-semibold text-white">{item.line_item_name}</h1>
              <p className="mt-3 max-w-3xl text-slate-400">
                {document?.title ?? "Budget display"} row {item.source_page?.replace(/^.* row /, "") || "n/a"}.
                Values are request/enacted display amounts in millions, not awards or contractor revenue.
              </p>
              <Button asChild className="mt-4 bg-cyan-300 text-slate-950 hover:bg-cyan-200">
                <Link href={`/curation?line=${item.id}`}>Curate link or fields</Link>
              </Button>
            </section>

            <div className="grid gap-3 md:grid-cols-4">
              <MetricCard label="FY2025 total" value={money(item.fy2025_total_amount_millions ?? 0)} detail="Display total" />
              <MetricCard label="FY2026 total" value={money(item.fy2026_total_amount_millions ?? 0)} detail="Enacted plus spend plan" />
              <MetricCard label="FY2027 request" value={money(lineItemRequestTotal(item))} detail={item.include_in_toa ? "Included in TOA" : "Memo/non-add row"} />
              <MetricCard label="26 to 27" value={delta(lineItemDelta(item))} detail="FY2027 request minus FY2026 total" tone={lineItemDelta(item) < 0 ? "negative" : "positive"} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-white/10 bg-white/[0.045] shadow-none">
                <CardHeader><CardTitle className="text-white">Funding Trend</CardTitle></CardHeader>
                <CardContent><BudgetLineAmountTrend item={item} /></CardContent>
              </Card>
              <Card className="border-white/10 bg-white/[0.045] shadow-none">
                <CardHeader><CardTitle className="text-white">FY2027 Request Split</CardTitle></CardHeader>
                <CardContent><BudgetLineRequestSplit item={item} /></CardContent>
              </Card>
            </div>

            <Card className="border-white/10 bg-white/[0.045] shadow-none">
              <CardHeader><CardTitle className="text-white">Budget Line Context</CardTitle></CardHeader>
              <CardContent className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                <div><span className="text-slate-500">Service / agency:</span> {item.service_or_component || "n/a"}</div>
                <div><span className="text-slate-500">Organization code:</span> {item.organization || "n/a"}</div>
                <div><span className="text-slate-500">Appropriation account:</span> {item.appropriation_account}</div>
                <div><span className="text-slate-500">Account title:</span> {item.account_title}</div>
                <div><span className="text-slate-500">Budget activity:</span> {item.budget_activity} {item.budget_activity_name}</div>
                <div><span className="text-slate-500">Subactivity:</span> {item.budget_subactivity || "n/a"} {item.budget_subactivity_name}</div>
                <div><span className="text-slate-500">PE/BLI/SAG:</span> {item.program_element || "n/a"}</div>
                <div><span className="text-slate-500">Line number:</span> {item.line_number || "n/a"}</div>
                <div><span className="text-slate-500">Cost type:</span> {item.cost_type_title || item.cost_type || "n/a"}</div>
                <div><span className="text-slate-500">Classification:</span> {item.classification || "n/a"}</div>
              </CardContent>
            </Card>

            {quantity ? (
              <Card className="border-white/10 bg-white/[0.045] shadow-none">
                <CardHeader><CardTitle className="text-white">Quantity Baseline</CardTitle></CardHeader>
                <CardContent className="grid gap-3 text-sm text-slate-300 md:grid-cols-3">
                  <div><span className="text-slate-500">FY2025:</span> {item.fy2025_total_quantity ?? "n/a"}</div>
                  <div><span className="text-slate-500">FY2026:</span> {item.fy2026_total_quantity ?? "n/a"}</div>
                  <div><span className="text-slate-500">FY2027:</span> {quantity}</div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="border-white/10 bg-white/[0.045] shadow-none">
              <CardHeader><CardTitle className="text-white">Legislative Tracking</CardTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-5">
                {[
                  ["President's Budget", money(lineItemRequestTotal(item)), "Loaded"],
                  ["House Mark", "Pending", "Awaiting bill/report"],
                  ["Senate Mark", "Pending", "Awaiting bill/report"],
                  ["Conference", "Pending", "Awaiting JES"],
                  ["Final Enacted", "Pending", "Awaiting public law"],
                ].map(([label, value, detail]) => (
                  <div key={label} className="rounded-md border border-white/10 bg-black/20 p-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
                    <div className="mt-2 text-lg font-semibold text-white">{value}</div>
                    <div className="mt-1 text-xs text-slate-400">{detail}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Collapsible>
              <Card className="border-white/10 bg-white/[0.045] shadow-none">
                <CardHeader>
                  <CollapsibleTrigger className="text-left">
                    <CardTitle className="text-white">Raw Source Row</CardTitle>
                    <p className="mt-1 text-sm text-slate-400">{document?.source_filename} · {item.source_page}</p>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-md border border-white/10 bg-black/30 p-4 text-xs leading-5 text-slate-300">{rawPretty(item.raw_text)}</pre>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <Card className="border-white/10 bg-white/[0.06] shadow-none">
              <CardContent className="space-y-4 p-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">FY2027 request</div>
                  <div className="mt-1 text-3xl font-semibold text-white">{money(lineItemRequestTotal(item))}</div>
                </div>
                <Separator className="bg-white/10" />
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Document</span><span>{documentLabel(item.document_type)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">TOA status</span><span>{item.include_in_toa ? "Included" : "Memo/non-add"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Source</span><span className="text-right">{document?.source_filename}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Row</span><span>{item.source_page}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Confidence</span><span>{((item.confidence_score ?? 0) * 100).toFixed(0)}%</span></div>
                  <div>
                    <div className="text-slate-400">Linked program</div>
                    {linkedProgram ? (
                      <Link href={`/programs/${linkedProgram.id}`} className="mt-1 block text-cyan-200 hover:text-cyan-100">
                        {linkedProgram.name}
                      </Link>
                    ) : (
                      <div className="mt-1 text-slate-500">No Weapons Book link yet</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
