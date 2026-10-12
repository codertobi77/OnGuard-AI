import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "OnGuard AI — Multimodal AI Platform for Early Skin Cancer Risk Stratification",
  description:
    "OnGuard AI combines dermoscopic image analysis with clinical reasoning to deliver a stratified skin cancer risk report in minutes. Built by LiteTECH Startup for the 2026 Intl CodeTheCure Hackathon.",
  applicationName: "OnGuard AI",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <LanguageProvider>
          <div className="flex min-h-svh w-full flex-col">
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
