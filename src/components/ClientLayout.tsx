"use client";

import { LanguageProvider } from "@/lib/language-context";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </LanguageProvider>
  );
}
