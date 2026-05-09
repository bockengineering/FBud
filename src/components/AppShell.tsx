import Link from "next/link";
import { BarChart3, Building2, FileSearch, Files, Landmark, LayoutDashboard, ListTree, Radar, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/programs", label: "Programs", icon: Radar },
  { href: "/budget-lines", label: "Budget Lines", icon: ListTree },
  { href: "/appropriations", label: "Appropriations", icon: Landmark },
  { href: "/mission-areas", label: "Mission Areas", icon: BarChart3 },
  { href: "/contractors", label: "Contractors", icon: Building2 },
  { href: "/review", label: "Review", icon: FileSearch },
  { href: "/sources", label: "Sources", icon: Files },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#071018] text-slate-100">
        <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/10 bg-[#08131d]/95 px-5 py-5 backdrop-blur md:block">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-400 text-slate-950">
              <Radar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold">FBud</div>
              <div className="text-xs text-slate-400">Weapons budget map</div>
            </div>
          </Link>
          <nav className="mt-8 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/7 hover:text-white"
              >
                <item.icon className="h-4 w-4 text-cyan-300" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-5 left-5 right-5 rounded-md border border-white/10 bg-white/[0.04] p-4 text-xs text-slate-400">
            FY2027 values are budget request/program funding, not contract awards or contractor revenue.
          </div>
        </aside>
        <div className="md:pl-72">
          <header className="sticky top-0 z-10 border-b border-white/10 bg-[#071018]/85 px-4 py-3 backdrop-blur md:px-8">
            <form action="/programs" className="relative max-w-3xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                name="q"
                placeholder="Search F-35, AMRAAM, hypersonic, shipbuilding, Northrop..."
                className="h-11 border-white/10 bg-white/[0.05] pl-9 text-slate-100 placeholder:text-slate-500"
              />
            </form>
          </header>
          <main className="px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
