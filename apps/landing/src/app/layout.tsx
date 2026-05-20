import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "ChurchFlow SaaS | Gestion Énergique & Moderne de votre Église",
  description: "Découvrez la solution SaaS tout-en-un la plus puissante pour piloter la croissance, l'administration, les finances et la hiérarchie de votre église avec le design premium Metronic.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased text-slate-100 bg-[#090a0f]`}>
        {children}
      </body>
    </html>
  );
}
