import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HARMONY — Every Moment Deserves Its Own Music",
  description:
    "Describe a moment. Hear it become music. AI-powered emotional music composition. Free. No account needed.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body
        className="font-sans bg-[#0F0B1E] text-[#FFF7ED] antialiased min-h-screen flex flex-col"
        style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
