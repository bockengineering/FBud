"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { MissionArea, ProgramComputed } from "@/lib/types";

const currency = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

type FundingChartProgram = {
  page_label: string;
  computed: ProgramComputed;
};

export function FundingBars({ program }: { program: FundingChartProgram }) {
  const rows = [
    { year: "FY2025", total: program.computed.fy2025_total, page: program.page_label },
    { year: "FY2026", total: program.computed.fy2026_total, page: program.page_label },
    { year: "FY2027", total: program.computed.fy2027_total, page: program.page_label },
  ];
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={rows}>
        <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
        <XAxis dataKey="year" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${value / 1000}B`} />
        <Tooltip formatter={(value) => `$${currency.format(Number(value))}M`} contentStyle={{ background: "#0b1621", border: "1px solid rgba(255,255,255,.12)" }} />
        <Bar dataKey="total" fill="#22d3ee" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FundingSplit({ program }: { program: FundingChartProgram }) {
  const rows = [
    { year: "FY2025", rdte: program.computed.fy2025_rdte, procurement: program.computed.fy2025_procurement },
    { year: "FY2026", rdte: program.computed.fy2026_rdte, procurement: program.computed.fy2026_procurement },
    { year: "FY2027", rdte: program.computed.fy2027_rdte, procurement: program.computed.fy2027_procurement },
  ];
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={rows}>
        <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
        <XAxis dataKey="year" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${value / 1000}B`} />
        <Tooltip formatter={(value) => `$${currency.format(Number(value))}M`} contentStyle={{ background: "#0b1621", border: "1px solid rgba(255,255,255,.12)" }} />
        <Bar dataKey="rdte" stackId="a" fill="#60a5fa" radius={[0, 0, 0, 0]} />
        <Bar dataKey="procurement" stackId="a" fill="#34d399" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MissionBreakdown({ missions }: { missions: MissionArea[] }) {
  const colors = ["#22d3ee", "#34d399", "#f59e0b", "#f472b6", "#a78bfa", "#fb7185", "#38bdf8", "#bef264"];
  return (
    <ResponsiveContainer width="100%" height={290}>
      <PieChart>
        <Pie
          data={missions}
          dataKey="fy2027_total_amount_millions"
          nameKey="name"
          innerRadius={58}
          outerRadius={105}
          paddingAngle={2}
        >
          {missions.map((mission, index) => (
            <Cell key={mission.id} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${currency.format(Number(value))}M`} contentStyle={{ background: "#0b1621", border: "1px solid rgba(255,255,255,.12)" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
