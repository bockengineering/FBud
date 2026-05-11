import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  budgetLineSummary,
  delta,
  filteredBudgetLineItems,
  getBudgetDocuments,
  getBudgetLineItems,
  lineItemDelta,
  lineItemRequestTotal,
  money,
  programForBudgetLineItem,
} from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  const result = Array.isArray(value) ? value[0] : value;
  return result === "all" ? undefined : result;
}

function documentLabel(type: string) {
  if (type === "r1") return "R-1";
  if (type === "p1") return "P-1";
  if (type === "o1") return "O-1";
  return type;
}

export default async function BudgetLinesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = {
    q: one(params.q),
    document: one(params.document),
    appropriation: one(params.appropriation),
    service: one(params.service),
    activity: one(params.activity),
    activityName: one(params.activity_name),
    linked: one(params.linked),
    toa: one(params.toa),
    sort: one(params.sort),
  };
  const items = filteredBudgetLineItems(filters);
  const visibleItems = items.slice(0, 150);
  const documents = getBudgetDocuments().filter((document) => document.document_type !== "weapons_book");
  const summary = budgetLineSummary();
  const allItems = getBudgetLineItems();
  const services = Array.from(new Set(allItems.flatMap((item) => (item.service_or_component ? [item.service_or_component] : [])))).sort();
  const appropriations = Array.from(new Set(allItems.flatMap((item) => (item.appropriation_type ? [item.appropriation_type] : [])))).sort();
  const activities = Array.from(
    new Map(
      allItems.flatMap((item) =>
        item.budget_activity && item.budget_activity_name
          ? [[item.budget_activity, `${item.budget_activity} ${item.budget_activity_name}`] as const]
          : [],
      ),
    ).entries(),
  ).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">Budget-Line Drilldown</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">R-1 / P-1 / O-1 line items</h1>
            <p className="mt-2 max-w-3xl text-slate-400">
              The Weapons Book stays as the executive program map. These display rows provide the appropriation, account, activity, line number, and request baseline for deeper tracking.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              <Link href="/curation">Curate</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              <Link href="/budget-lines?linked=linked">Linked</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              <Link href="/budget-lines?linked=unlinked">Unlinked</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Display documents" value={`${summary.documentCount}`} detail="R-1, P-1, O-1" href="/sources" />
          <MetricCard label="Line items" value={`${summary.lineItemCount}`} detail={`${summary.includedLineItemCount} included in TOA`} />
          <MetricCard label="FY2027 included TOA" value={money(summary.fy2027IncludedTotal)} detail="Display rows marked Add/Y" />
          <MetricCard label="Linked rows" value={`${summary.linkedLineItemCount}`} detail="Tied to Weapons Book programs" />
          <MetricCard label="Needs review" value={`${summary.reviewLineItemCount}`} detail="Parser or source checks" tone={summary.reviewLineItemCount ? "negative" : "neutral"} href="/review" />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard label="RDT&E baseline" value={money(summary.rdteTotal)} detail="R-1 included rows" href="/rdte" />
          <MetricCard label="Procurement baseline" value={money(summary.procurementTotal)} detail="P-1 included rows" href="/budget-lines?document=p1" />
          <MetricCard label="O&M baseline" value={money(summary.omTotal)} detail="O-1 included rows" href="/budget-lines?document=o1" />
        </div>

        <form className="grid gap-3 rounded-md border border-white/10 bg-white/[0.045] p-3 md:grid-cols-2 xl:grid-cols-9">
          <Input name="q" defaultValue={filters.q} placeholder="Search line, PE/BLI, account, linked program..." className="border-white/10 bg-black/20 xl:col-span-2" />
          <Select name="document" defaultValue={filters.document || "all"}>
            <SelectTrigger className="border-white/10 bg-black/20"><SelectValue placeholder="Document" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All docs</SelectItem>
              {documents.map((document) => <SelectItem key={document.id} value={document.document_type}>{documentLabel(document.document_type)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select name="appropriation" defaultValue={filters.appropriation || "all"}>
            <SelectTrigger className="border-white/10 bg-black/20"><SelectValue placeholder="Appropriation" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {appropriations.map((appropriation) => <SelectItem key={appropriation} value={appropriation}>{appropriation}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select name="activity" defaultValue={filters.activity || "all"}>
            <SelectTrigger className="border-white/10 bg-black/20"><SelectValue placeholder="Activity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All activities</SelectItem>
              {activities.map(([activity, label]) => <SelectItem key={activity} value={activity}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select name="service" defaultValue={filters.service || "all"}>
            <SelectTrigger className="border-white/10 bg-black/20"><SelectValue placeholder="Service / agency" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services / agencies</SelectItem>
              {services.map((service) => <SelectItem key={service} value={service}>{service}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select name="linked" defaultValue={filters.linked || "all"}>
            <SelectTrigger className="border-white/10 bg-black/20"><SelectValue placeholder="Link status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All link states</SelectItem>
              <SelectItem value="linked">Linked</SelectItem>
              <SelectItem value="unlinked">Unlinked</SelectItem>
            </SelectContent>
          </Select>
          <Select name="sort" defaultValue={filters.sort || "fy2027"}>
            <SelectTrigger className="border-white/10 bg-black/20"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fy2027">FY2027 request</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
              <SelectItem value="decline">Decline</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="document">Document</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200">Apply</Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {filters.document ? <Badge className="bg-cyan-400/10 text-cyan-200">Document: {documentLabel(filters.document)}</Badge> : null}
          {filters.activity ? <Badge className="bg-cyan-400/10 text-cyan-200">Activity: {filters.activityName ?? filters.activity}</Badge> : null}
          {filters.linked ? <Badge className="bg-slate-400/10 text-slate-200">Link status: {filters.linked}</Badge> : null}
          {filters.q ? <Badge className="bg-slate-400/10 text-slate-200">Search: {filters.q}</Badge> : null}
        </div>

        <Card className="border-white/10 bg-white/[0.045] shadow-none">
          <CardHeader>
            <CardTitle className="text-white">{items.length} matching budget lines</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Line item</TableHead>
                  <TableHead>Doc</TableHead>
                  <TableHead>Service / agency</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">FY2027</TableHead>
                  <TableHead className="text-right">26 to 27</TableHead>
                  <TableHead>Linked program</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleItems.map((item) => {
                  const linkedProgram = programForBudgetLineItem(item);
                  return (
                    <TableRow key={item.id} className="border-white/10">
                      <TableCell>
                        <Link href={`/budget-lines/${item.id}`} className="font-medium text-cyan-200 hover:text-cyan-100">
                          {item.line_item_name || "Untitled line item"}
                        </Link>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span>Line {item.line_number || "n/a"}</span>
                          {item.program_element ? <span>{item.program_element}</span> : null}
                          {!item.include_in_toa ? <span className="text-orange-200">memo/non-add</span> : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-white/10 uppercase text-slate-100">{documentLabel(item.document_type)}</Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">{item.service_or_component}</TableCell>
                      <TableCell className="text-slate-400">{item.appropriation_account}</TableCell>
                      <TableCell className="text-right text-white">{money(lineItemRequestTotal(item))}</TableCell>
                      <TableCell className="text-right">{delta(lineItemDelta(item))}</TableCell>
                      <TableCell>
                        {linkedProgram ? (
                          <Link href={`/programs/${linkedProgram.id}`} className="text-cyan-200 hover:text-cyan-100">
                            {linkedProgram.short_name}
                          </Link>
                        ) : (
                          <span className="text-slate-500">Unlinked</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {items.length > visibleItems.length ? (
              <p className="mt-4 text-sm text-slate-500">Showing the first {visibleItems.length} rows. Use search and filters to narrow the table.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
