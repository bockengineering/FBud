"use client";

import { ExternalLink, FileText } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function SourceDrawer({
  programName,
  sectionLabel,
  pageLabel,
  pdfPageNumber,
  triggerLabel = "Source",
  variant = "outline",
  className,
}: {
  programName: string;
  sectionLabel: string;
  pageLabel: string;
  pdfPageNumber: number | null;
  triggerLabel?: string;
  variant?: "outline" | "ghost" | "link";
  className?: string;
}) {
  const page = pdfPageNumber ?? 1;
  const pdfUrl = `/api/source-pdf#page=${page}&zoom=page-width&navpanes=0&toolbar=0`;
  const pageImageUrl = `/source-pages/page-${page}.jpg`;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={cn(
            "gap-2 border-white/10 bg-white/5 text-slate-100 hover:bg-white/10",
            variant === "ghost" && "border-transparent bg-transparent text-cyan-200 hover:bg-cyan-300/10",
            variant === "link" && "h-auto border-0 bg-transparent p-0 text-cyan-300 underline-offset-4 hover:bg-transparent hover:underline",
            className,
          )}
        >
          <FileText className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="!w-[98vw] !max-w-[98vw] border-white/10 bg-[#071018] p-0 text-slate-100 sm:!max-w-[98vw] lg:!w-[min(1400px,96vw)] lg:!max-w-[min(1400px,96vw)]"
      >
        <SheetHeader className="border-b border-white/10 px-5 py-4">
          <div className="flex flex-col gap-3 pr-10 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <SheetTitle className="text-lg text-white">{sectionLabel}</SheetTitle>
              <SheetDescription className="mt-1 text-slate-400">
                {programName} · Weapons Book p. {pageLabel} · PDF page {page}
              </SheetDescription>
            </div>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
            >
              Open PDF page
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-auto bg-[#111827] p-4 xl:p-6">
          <div className="mx-auto max-w-[1120px] rounded-sm bg-white p-2 shadow-2xl">
            <Image
              src={pageImageUrl}
              alt={`${programName} source page ${pageLabel}`}
              width={1224}
              height={1584}
              className="h-auto w-full"
              unoptimized
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
