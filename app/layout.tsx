import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BlackRoad OS",
  description: "Agentic Operating System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100">
        {children}
      </body>
    </html>
  );
}
