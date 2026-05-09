import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FBud | FY2027 Weapons Budget Navigator",
  description: "Explore FY2027 weapon-system program funding, mission areas, contractors, and source citations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#071018]">{children}</body>
    </html>
  );
}
