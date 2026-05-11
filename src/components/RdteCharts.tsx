"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type RdteCategory = {
  id: string;
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

function ChartFrame({ children, className }: { children: ReactNode; className: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={className}>
      {mounted ? children : <div className="h-full rounded-md border border-white/10 bg-black/20" />}
    </div>
  );
}

export function RdteCategoryRequestChart({ categories }: { categories: RdteCategory[] }) {
  const data = categories.map((category) => ({
    ...category,
    label: shortCategory(category.label),
  }));

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
          <Bar dataKey="discretionary" stackId="request" fill="#22d3ee" radius={[4, 0, 0, 4]} />
          <Bar dataKey="mandatory" stackId="request" fill="#a78bfa" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function RdteServiceChart({ services }: { services: RdteService[] }) {
  return (
    <ChartFrame className="h-[340px] min-h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={services} margin={{ top: 8, right: 16, left: 0, bottom: 36 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="service" stroke="#94a3b8" tickLine={false} axisLine={false} angle={-18} textAnchor="end" height={62} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => currency(Number(value))} />
          <Tooltip
            cursor={{ fill: "rgba(34,211,238,0.08)" }}
            contentStyle={{ background: "#0b1620", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e2e8f0" }}
            formatter={(value) => [currency(Number(value)), "FY2027 request"]}
          />
          <Bar dataKey="fy2027" radius={[4, 4, 0, 0]}>
            {services.map((service, index) => (
              <Cell key={service.service} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
