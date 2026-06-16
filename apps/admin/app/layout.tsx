import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "ChurchFlow | Administration & Dashboard",
  description: "Portail administratif de ChurchFlow pour la gestion des membres, des groupes, des formations et des finances.",
  icons: {
    icon: "/favicon.ico",
  }
};

import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}


