import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { AppropriationsTracker } from "@/components/AppropriationsTracker";
import { BudgetLineItemsPanel } from "@/components/BudgetLineItemsPanel";
import { FundingBars, FundingSplit } from "@/components/FundingCharts";
import { MetricCard } from "@/components/MetricCard";
import { RelatedPrograms } from "@/components/RelatedPrograms";
import { SourceDrawer } from "@/components/SourceDrawer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { delta, getProgram, money, pct, source } from "@/lib/data";

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = getProgram(id);
  if (!program) notFound();
  const prime = program.prime_contractors[0]?.name ?? "Not parsed";
  const sourceBase = {
    programName: program.name,
    pageLabel: program.page_label,
    pdfPageNumber: program.pdf_page_number,
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="text-sm text-slate-400">
          <Link href="/dashboard" className="hover:text-cyan-200">Dashboard</Link> /{" "}
          <Link href={`/mission-areas/${program.mission_area_id}`} className="hover:text-cyan-200">{program.mission_area}</Link> /{" "}
          <span className="text-slate-200">{program.short_name}</span>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-cyan-400/10 text-cyan-200">{program.mission_area}</Badge>
                <Badge variant="outline" className="border-white/10 text-slate-300">{program.service_or_component}</Badge>
                <SourceDrawer
                  {...sourceBase}
                  sectionLabel="Program Source Page"
                  triggerLabel={source(program.page_label)}
                />
                {program.needs_review ? <Badge className="bg-orange-400/10 text-orange-200">Parser review</Badge> : null}
              </div>
              <h1 className="mt-4 text-4xl font-semibold text-white">{program.name}</h1>
              <p className="mt-4 text-lg leading-8 text-slate-300">{program.description}</p>
              <div className="mt-3">
                <SourceDrawer
                  {...sourceBase}
                  sectionLabel="Description Evidence"
                  triggerLabel="View description source"
                  variant="ghost"
                />
              </div>
            </section>
            <div className="grid gap-3 md:grid-cols-3">
              <MetricCard label="FY2025 actual" value={money(program.computed.fy2025_total)} detail={source(program.page_label)} />
              <MetricCard label="FY2026 enacted/current" value={money(program.computed.fy2026_total)} detail={source(program.page_label)} />
              <MetricCard label="FY2027 request" value={money(program.computed.fy2027_total)} detail={source(program.page_label)} />
            </div>
            <AppropriationsTracker program={program} />
            <SourceDrawer
              {...sourceBase}
              sectionLabel="Funding Table Evidence"
              triggerLabel="Open funding table source"
            />
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-white/10 bg-white/[0.045] shadow-none">
                <CardHeader><CardTitle className="text-white">Total Funding Trend</CardTitle></CardHeader>
                <CardContent><FundingBars program={program} /></CardContent>
              </Card>
              <Card className="border-white/10 bg-white/[0.045] shadow-none">
                <CardHeader><CardTitle className="text-white">RDT&E vs Procurement</CardTitle></CardHeader>
                <CardContent><FundingSplit program={program} /></CardContent>
              </Card>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-white/10 bg-white/[0.045] shadow-none">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-white">Mission</CardTitle>
                    <SourceDrawer
                      {...sourceBase}
                      sectionLabel="Mission Evidence"
                      triggerLabel="Source"
                      variant="ghost"
                    />
                  </div>
                </CardHeader>
                <CardContent className="text-slate-300">{program.mission || "Mission text was not confidently parsed."}</CardContent>
              </Card>
              <Card className="border-white/10 bg-white/[0.045] shadow-none">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-white">FY2027 Program</CardTitle>
                    <SourceDrawer
                      {...sourceBase}
                      sectionLabel="FY2027 Program Evidence"
                      triggerLabel="Source"
                      variant="ghost"
                    />
                  </div>
                </CardHeader>
                <CardContent className="text-slate-300">{program.fy2027_program_summary || "FY2027 program text was not confidently parsed."}</CardContent>
              </Card>
            </div>
            <Card className="border-white/10 bg-white/[0.045] shadow-none">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-white">Prime Contractors</CardTitle>
                  <SourceDrawer
                    {...sourceBase}
                    sectionLabel="Prime Contractor Evidence"
                    triggerLabel="Source"
                    variant="ghost"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {program.prime_contractors.map((contractor) => (
                  <Link key={contractor.name} href={`/contractors/${contractor.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}>
                    <Badge className="bg-slate-200/10 text-slate-100">{contractor.name}</Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
            <BudgetLineItemsPanel programId={program.id} />
            <RelatedPrograms programId={program.id} />
            <Collapsible>
              <Card className="border-white/10 bg-white/[0.045] shadow-none">
                <CardHeader>
                  <CollapsibleTrigger className="text-left">
                    <CardTitle className="text-white">Raw Source Excerpt</CardTitle>
                    <p className="mt-1 text-sm text-slate-400">{source(program.page_label)}</p>
                  </CollapsibleTrigger>
                  <div className="pt-2">
                    <SourceDrawer
                      {...sourceBase}
                      sectionLabel="Full Raw Page Evidence"
                      triggerLabel="Open PDF drawer"
                    />
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-md border border-white/10 bg-black/30 p-4 text-xs leading-5 text-slate-300">{program.source_text}</pre>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
          <aside className="xl:sticky xl:top-24 xl:self-start">
            <Card className="border-white/10 bg-white/[0.06] shadow-none">
              <CardContent className="space-y-4 p-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">FY2027 total</div>
                  <div className="mt-1 text-3xl font-semibold text-white">{money(program.computed.fy2027_total)}</div>
                </div>
                <Separator className="bg-white/10" />
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">26 to 27</span><span>{delta(program.computed.absolute_change_26_to_27)} ({pct(program.computed.percent_change_26_to_27)})</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">RDT&E share</span><span>{program.computed.rdte_share_fy2027.toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Proc share</span><span>{program.computed.procurement_share_fy2027.toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Mandatory share</span><span>{program.computed.mandatory_share_fy2027.toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Prime</span><span className="text-right">{prime}</span></div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Source</span>
                    <SourceDrawer
                      {...sourceBase}
                      sectionLabel="Program Source Page"
                      triggerLabel={program.page_label}
                      variant="link"
                    />
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
