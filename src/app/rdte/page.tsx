import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { RdteCategoryRequestChart, RdteServiceChart } from "@/components/RdteCharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  delta,
  lineItemDelta,
  lineItemPercentChange,
  lineItemRequestTotal,
  money,
  pct,
  programForBudgetLineItem,
  rdteCategorySummary,
  rdteLineItemMovers,
  rdteServiceSummary,
  rdteSummary,
  topRdteLineItems,
} from "@/lib/data";
import type { BudgetLineItem } from "@/lib/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type RdtePageFilters = {
  service?: string;
  activity?: string;
  activityName?: string;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function rdteHref(filters: RdtePageFilters) {
  const params = new URLSearchParams();
  if (filters.service) params.set("service", filters.service);
  if (filters.activity) params.set("activity", filters.activity);
  if (filters.activityName) params.set("activity_name", filters.activityName);
  const query = params.toString();
  return query ? `/rdte?${query}` : "/rdte";
}

function categoryHref(activity: string, name: string, filters: RdtePageFilters) {
  const isActive = filters.activity === activity && filters.activityName === name;
  return rdteHref({
    service: filters.service,
    activity: isActive ? undefined : activity,
    activityName: isActive ? undefined : name,
  });
}

function serviceHref(service: string, filters: RdtePageFilters) {
  return rdteHref({
    service: filters.service === service ? undefined : service,
    activity: filters.activity,
    activityName: filters.activityName,
  });
}

function lineItemsHref(filters: RdtePageFilters, linked?: "linked") {
  const params = new URLSearchParams({ document: "r1", toa: "included" });
  if (filters.service) params.set("service", filters.service);
  if (filters.activity) params.set("activity", filters.activity);
  if (filters.activityName) params.set("activity_name", filters.activityName);
  if (linked) params.set("linked", linked);
  return `/budget-lines?${params.toString()}`;
}

function LineItemRow({ item }: { item: BudgetLineItem }) {
  const linkedProgram = programForBudgetLineItem(item);
  return (
    <TableRow className="border-white/10">
      <TableCell>
        <Link href={`/budget-lines/${item.id}`} className="font-medium text-cyan-200 hover:text-cyan-100">
          {item.line_item_name}
        </Link>
        <div className="mt-1 text-xs text-slate-500">
          Line {item.line_number || "n/a"} {item.program_element ? `| ${item.program_element}` : ""}
        </div>
      </TableCell>
      <TableCell className="text-slate-400">{item.budget_activity} {item.budget_activity_name}</TableCell>
      <TableCell className="text-slate-400">{item.service_or_component}</TableCell>
      <TableCell className="text-right text-white">{money(lineItemRequestTotal(item))}</TableCell>
      <TableCell className="text-right">
        {delta(lineItemDelta(item))}
        <div className="text-xs text-slate-500">{pct(lineItemPercentChange(item))}</div>
      </TableCell>
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
}

export default async function RdtePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = {
    service: one(params.service),
    activity: one(params.activity),
    activityName: one(params.activity_name),
  };
  const hasFilters = Boolean(filters.service || filters.activity || filters.activityName);
  const summary = rdteSummary(filters);
  const categories = rdteCategorySummary(filters);
  const services = rdteServiceSummary(filters);
  const topLines = topRdteLineItems(12, filters);
  const movers = rdteLineItemMovers(7, filters);
  const topCategory = categories[0];
  const growthCategory = [...categories].sort((a, b) => b.delta - a.delta)[0];
  const mandatoryCategory = [...categories].sort((a, b) => b.mandatory - a.mandatory)[0];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">RDT&E Shape</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">FY2027 R-1 category map</h1>
            <p className="mt-2 max-w-3xl text-slate-400">
              A category-level view of the R-1 request, grouped by budget activity and tied back to line-item drilldowns. FY2027 is the President&apos;s Budget request.
            </p>
          </div>
          <Link href={lineItemsHref(filters)} className="text-sm text-cyan-300 hover:text-cyan-100">
            Open matching R-1 line items
          </Link>
        </div>

        {hasFilters ? (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/[0.05] p-3">
            <span className="text-sm text-slate-400">Active RDT&E filter:</span>
            {filters.service ? <Badge className="bg-cyan-400/10 text-cyan-200">Service / agency: {filters.service}</Badge> : null}
            {filters.activityName ? <Badge className="bg-cyan-400/10 text-cyan-200">Category: {filters.activity} {filters.activityName}</Badge> : null}
            <Link href="/rdte" className="ml-auto text-sm text-cyan-300 hover:text-cyan-100">Clear filters</Link>
          </div>
        ) : (
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-400">
            Click a category bar or service/agency bar to filter the full page. Click the same bar again to remove that filter.
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="FY2027 R-1 request" value={money(summary.fy2027)} detail={`${summary.rowCount} TOA-included rows`} />
          <MetricCard label="FY2026 to FY2027" value={delta(summary.delta)} detail={pct(summary.percentChange)} tone={summary.delta >= 0 ? "positive" : "negative"} />
          <MetricCard label="Discretionary" value={money(summary.discretionary)} detail="FY2027 request" />
          <MetricCard label="Mandatory" value={money(summary.mandatory)} detail={`${summary.mandatoryShare.toFixed(1)}% of FY2027`} />
          <MetricCard label="Linked to programs" value={`${summary.linkedCount}`} detail={`${summary.categoryCount} R-1 categories`} href={lineItemsHref(filters, "linked")} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.35fr_.9fr]">
          <Card className="border-white/10 bg-white/[0.045] shadow-none">
            <CardHeader>
              <CardTitle className="text-white">FY2027 Request by R-1 Category</CardTitle>
              <p className="text-sm text-slate-400">Stacked by discretionary and mandatory request columns.</p>
            </CardHeader>
            <CardContent>
              <RdteCategoryRequestChart categories={categories} activeActivity={filters.activity} activeActivityName={filters.activityName} />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.045] shadow-none">
            <CardHeader><CardTitle className="text-white">What Is Driving the Shape</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {topCategory ? (
                <Link href={categoryHref(topCategory.activity, topCategory.name, filters)} className="block rounded-md border border-white/10 bg-black/20 p-4 hover:bg-white/[0.06]">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Largest category</div>
                  <div className="mt-2 font-semibold text-white">{topCategory.label}</div>
                  <div className="mt-1 text-sm text-slate-400">{money(topCategory.fy2027)} · {topCategory.share.toFixed(1)}% of filtered R-1</div>
                </Link>
              ) : null}
              {growthCategory ? (
                <Link href={categoryHref(growthCategory.activity, growthCategory.name, filters)} className="block rounded-md border border-white/10 bg-black/20 p-4 hover:bg-white/[0.06]">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Largest growth category</div>
                  <div className="mt-2 font-semibold text-white">{growthCategory.label}</div>
                  <div className="mt-1 text-sm text-emerald-300">{delta(growthCategory.delta)} vs FY2026</div>
                </Link>
              ) : null}
              {mandatoryCategory ? (
                <Link href={categoryHref(mandatoryCategory.activity, mandatoryCategory.name, filters)} className="block rounded-md border border-white/10 bg-black/20 p-4 hover:bg-white/[0.06]">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Most mandatory-funded category</div>
                  <div className="mt-2 font-semibold text-white">{mandatoryCategory.label}</div>
                  <div className="mt-1 text-sm text-slate-400">{money(mandatoryCategory.mandatory)} mandatory request</div>
                </Link>
              ) : null}
              <div className="rounded-md border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-slate-400">
                Starred display categories are preserved from the R-1 workbook instead of forced into standard activity labels, so unusual mandatory or cross-title rows remain auditable.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_.9fr]">
          <Card className="border-white/10 bg-white/[0.045] shadow-none">
            <CardHeader><CardTitle className="text-white">Category Table</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">FY2027</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                    <TableHead className="text-right">26 to 27</TableHead>
                    <TableHead className="text-right">Mandatory</TableHead>
                    <TableHead className="text-right">Rows</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} className="border-white/10">
                      <TableCell>
                        <Link href={categoryHref(category.activity, category.name, filters)} className="font-medium text-cyan-200 hover:text-cyan-100">
                          {category.label}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-white">{money(category.fy2027)}</TableCell>
                      <TableCell className="text-right">{category.share.toFixed(1)}%</TableCell>
                      <TableCell className="text-right">{delta(category.delta)}</TableCell>
                      <TableCell className="text-right">{category.mandatoryShare.toFixed(1)}%</TableCell>
                      <TableCell className="text-right">{category.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.045] shadow-none">
            <CardHeader><CardTitle className="text-white">R-1 Request by Service / Agency</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <RdteServiceChart services={services} activeService={filters.service} />
              <div className="grid gap-2">
                {services.slice(0, 5).map((service) => (
                  <Link key={service.service} href={serviceHref(service.service, filters)} className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/7">
                    <span className="text-slate-200">{service.service}</span>
                    <span className="text-white">{money(service.fy2027)}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/10 bg-white/[0.045] shadow-none">
          <CardHeader>
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <CardTitle className="text-white">Largest RDT&E Line Items</CardTitle>
                <p className="mt-1 text-sm text-slate-400">Top R-1 rows by FY2027 request amount.</p>
              </div>
              <Badge className="bg-cyan-400/10 text-cyan-200">R-1 included rows only</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Line item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Service / agency</TableHead>
                  <TableHead className="text-right">FY2027</TableHead>
                  <TableHead className="text-right">26 to 27</TableHead>
                  <TableHead>Program</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topLines.map((item) => <LineItemRow key={item.id} item={item} />)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/[0.045] shadow-none">
            <CardHeader><CardTitle className="text-white">Biggest RDT&E Increases</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {movers.increases.map((item) => <LineItemRow key={item.id} item={item} />)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.045] shadow-none">
            <CardHeader><CardTitle className="text-white">Biggest RDT&E Declines</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {movers.declines.map((item) => <LineItemRow key={item.id} item={item} />)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
