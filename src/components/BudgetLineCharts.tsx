"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { BudgetLineItem } from "@/lib/types";

function currency(value?: number | null) {
  const amount = value ?? 0;
  if (Math.abs(amount) >= 1000) return `$${(amount / 1000).toFixed(1)}B`;
  return `$${amount.toFixed(1)}M`;
}

export function BudgetLineAmountTrend({ item }: { item: BudgetLineItem }) {
  const data = [
    { year: "FY25", amount: item.fy2025_total_amount_millions ?? 0 },
    { year: "FY26", amount: item.fy2026_total_amount_millions ?? 0 },
    { year: "FY27", amount: item.fy2027_total_amount_millions ?? item.amount_millions ?? 0 },
  ];

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => currency(Number(value))} />
          <Tooltip
            cursor={{ fill: "rgba(34,211,238,0.08)" }}
            contentStyle={{ background: "#0b1620", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e2e8f0" }}
            formatter={(value) => [currency(Number(value)), "Amount"]}
          />
          <Bar dataKey="amount" fill="#22d3ee" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BudgetLineRequestSplit({ item }: { item: BudgetLineItem }) {
  const data = [
    {
      stage: "FY27 request",
      discretionary: item.fy2027_discretionary_request_amount_millions ?? 0,
      mandatory: item.fy2027_mandatory_request_amount_millions ?? 0,
    },
  ];

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 12, left: 24, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => currency(Number(value))} />
          <YAxis type="category" dataKey="stage" stroke="#94a3b8" tickLine={false} axisLine={false} width={96} />
          <Tooltip
            cursor={{ fill: "rgba(34,211,238,0.08)" }}
            contentStyle={{ background: "#0b1620", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e2e8f0" }}
            formatter={(value, name) => [currency(Number(value)), name === "discretionary" ? "Discretionary" : "Mandatory"]}
          />
          <Bar dataKey="discretionary" stackId="request" fill="#22d3ee" radius={[4, 0, 0, 4]} />
          <Bar dataKey="mandatory" stackId="request" fill="#a78bfa" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
