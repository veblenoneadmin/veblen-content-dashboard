import type { Metadata } from "next";
import "./globals.css";
import { DashboardProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Veblen Group — Content Dashboard",
  description: "Content Management Dashboard for Veblen Group digital marketing agency",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ backgroundColor: '#111111' }}>
      <body style={{ backgroundColor: '#111111', color: '#FFFFFF', fontFamily: "'DM Sans', sans-serif", margin: 0, padding: 0 }}>
        <DashboardProvider>
          {children}
        </DashboardProvider>
      </body>
    </html>
  );
}
