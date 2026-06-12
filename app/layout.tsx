import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Cormorant_Garamond } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { NoiseOverlay } from "@/components/noise-overlay";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Marketme | Your AI Marketing Manager",
  description: "Automate campaigns, generate leads, and analyze performance effortlessly with Marketme.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${cormorant.variable} h-full antialiased scheme-dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans relative transition-colors duration-500 ease-in-out">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-9999 focus:px-4 focus:py-2 focus:bg-blue-500 focus:text-white focus:font-bold focus:text-sm focus:tracking-wide">Skip to content</a>
        <NoiseOverlay />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <main id="main-content" className="flex-1 relative z-10 w-full">
            <TooltipProvider>{children}</TooltipProvider>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
