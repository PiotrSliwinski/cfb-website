import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clínica Ferreira Borges",
  description: "Clínica Dentária em Lisboa - Onde cada sorriso conta uma história",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
