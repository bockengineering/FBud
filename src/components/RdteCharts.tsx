"use client";

import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type RdteCategory = {
  id: string;
  activity: string;
  name: string;
  label: string;
  fy2027: number;
  discretionary: number;
  mandatory: number;
};

type RdteService = {
  service: string;
  fy2027: number;
};

const colors = ["#22d3ee", "#34d399", "#f59e0b", "#a78bfa", "#f472b6", "#38bdf8", "#fb7185", "#bef264"];

function currency(value?: number | null) {
  const amount = value ?? 0;
  if (Math.abs(amount) >= 1000) return `$${(amount / 1000).toFixed(1)}B`;
  return `$${amount.toFixed(0)}M`;
}

function shortCategory(label: string) {
  return label
    .replace("Advanced component development and prototypes", "Adv. components / prototypes")
    .replace("Operational system development", "Operational systems")
    .replace("System development and demonstration", "System dev / demo")
    .replace("Advanced technology development", "Advanced tech")
    .replace("Software and digital technology pilot programs", "Software pilots");
}

function ChartFrame({ children, className, style }: { children: ReactNode; className: string; style?: CSSProperties }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={className} style={style}>
      {mounted ? children : <div className="h-full rounded-md border border-white/10 bg-black/20" />}
    </div>
  );
}

function useRdteFilterNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };
}

export function RdteCategoryRequestChart({
  categories,
  activeActivity,
  activeActivityName,
}: {
  categories: RdteCategory[];
  activeActivity?: string;
  activeActivityName?: string;
}) {
  const navigate = useRdteFilterNavigation();
  const activeCategoryId = activeActivity && activeActivityName ? `${activeActivity}-${activeActivityName}` : null;
  const data = categories.map((category) => ({
    ...category,
    label: shortCategory(category.label),
    active: `${category.activity}-${category.name}` === activeCategoryId,
  }));
  const onCategoryClick = (category: RdteCategory) => {
    const isActive = `${category.activity}-${category.name}` === activeCategoryId;
    navigate({
      activity: isActive ? null : category.activity,
      activity_name: isActive ? null : category.name,
    });
  };

  return (
    <ChartFrame className="h-[460px] min-h-[460px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => currency(Number(value))} />
          <YAxis type="category" dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} width={188} />
          <Tooltip
            cursor={{ fill: "rgba(34,211,238,0.08)" }}
            contentStyle={{ background: "#0b1620", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e2e8f0" }}
            formatter={(value, name) => [currency(Number(value)), name === "discretionary" ? "Discretionary" : "Mandatory"]}
          />
          <Bar dataKey="discretionary" stackId="request" radius={[4, 0, 0, 4]} onClick={(entry) => onCategoryClick(entry.payload)} className="cursor-pointer">
            {data.map((category) => (
              <Cell key={`${category.id}-disc`} fill={!activeCategoryId || category.active ? "#22d3ee" : "rgba(34,211,238,0.28)"} />
            ))}
          </Bar>
          <Bar dataKey="mandatory" stackId="request" radius={[0, 4, 4, 0]} onClick={(entry) => onCategoryClick(entry.payload)} className="cursor-pointer">
            {data.map((category) => (
              <Cell key={`${category.id}-mand`} fill={!activeCategoryId || category.active ? "#a78bfa" : "rgba(167,139,250,0.28)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function RdteServiceChart({ services, activeService }: { services: RdteService[]; activeService?: string }) {
  const navigate = useRdteFilterNavigation();
  const height = Math.max(340, services.length * 32 + 72);
  const onServiceClick = (service: RdteService) => {
    navigate({ service: service.service === activeService ? null : service.service });
  };

  return (
    <ChartFrame className="min-h-[340px]" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={services} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => currency(Number(value))} />
          <YAxis type="category" dataKey="service" width={176} stroke="#94a3b8" tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(34,211,238,0.08)" }}
            contentStyle={{ background: "#0b1620", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e2e8f0" }}
            formatter={(value) => [currency(Number(value)), "FY2027 request"]}
          />
          <Bar dataKey="fy2027" radius={[0, 4, 4, 0]} onClick={(entry) => onServiceClick(entry.payload)} className="cursor-pointer">
            {services.map((service, index) => (
              <Cell
                key={service.service}
                fill={!activeService || service.service === activeService ? colors[index % colors.length] : "rgba(148,163,184,0.25)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
