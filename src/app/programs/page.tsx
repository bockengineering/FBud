import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { ProgramCard } from "@/components/ProgramCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { filteredPrograms, getDataset } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  const result = Array.isArray(value) ? value[0] : value;
  return result === "all" ? undefined : result;
}

export default async function ProgramsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const data = getDataset();
  const filters = {
    q: one(params.q),
    mission: one(params.mission),
    service: one(params.service),
    contractor: one(params.contractor),
    review: one(params.review),
    cohort: one(params.cohort),
    funding: one(params.funding),
    sort: one(params.sort),
  };
  const programs = filteredPrograms(filters);
  const services = Array.from(new Set(data.programs.map((program) => program.service_or_component).filter(Boolean))).sort();

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">Program Explorer</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Programs</h1>
            <p className="mt-2 text-slate-400">{programs.length} matching weapon-system programs.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              <Link href="/programs?cohort=growth&sort=growth">Growth</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              <Link href="/programs?cohort=decline&sort=decline">Declines</Link>
            </Button>
          </div>
        </div>
        <form className="grid gap-3 rounded-md border border-white/10 bg-white/[0.045] p-3 md:grid-cols-2 xl:grid-cols-6">
          <Input name="q" defaultValue={filters.q} placeholder="Search programs..." className="border-white/10 bg-black/20 xl:col-span-2" />
          <Select name="mission" defaultValue={filters.mission || "all"}>
            <SelectTrigger className="border-white/10 bg-black/20"><SelectValue placeholder="Mission area" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All missions</SelectItem>
              {data.mission_areas.map((mission) => <SelectItem key={mission.id} value={mission.id}>{mission.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select name="service" defaultValue={filters.service || "all"}>
            <SelectTrigger className="border-white/10 bg-black/20"><SelectValue placeholder="Service" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              {services.map((service) => <SelectItem key={service} value={service}>{service}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select name="sort" defaultValue={filters.sort || "fy2027"}>
            <SelectTrigger className="border-white/10 bg-black/20"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fy2027">FY2027 total</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
              <SelectItem value="decline">Decline</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="mission">Mission</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200">Apply</Button>
        </form>
        <div className="flex flex-wrap gap-2">
          {filters.funding ? <Badge className="bg-cyan-400/10 text-cyan-200">Funding: {filters.funding}</Badge> : null}
          {filters.review ? <Badge className="bg-orange-400/10 text-orange-200">Needs review</Badge> : null}
          {filters.contractor ? <Badge className="bg-slate-400/10 text-slate-200">Contractor: {filters.contractor}</Badge> : null}
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {programs.map((program) => <ProgramCard key={program.id} program={program} />)}
        </div>
      </div>
    </AppShell>
  );
}
