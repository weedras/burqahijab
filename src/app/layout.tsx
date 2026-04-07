import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, DM_Serif_Display } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "BurqaHijab.shop — Where Modesty Meets Luxury",
  description: "Discover Premium Abayas & Hijabs Crafted for the Modern Woman. Shop luxury modest fashion with worldwide shipping from Pakistan.",
  keywords: ["abayas", "hijabs", "modest fashion", "luxury abaya", "Islamic clothing", "burqa", "premium hijab", "Pakistan", "modest wear"],
  authors: [{ name: "BurqaHijab.shop" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "BurqaHijab.shop — Where Modesty Meets Luxury",
    description: "Discover Premium Abayas & Hijabs Crafted for the Modern Woman",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BurqaHijab.shop — Where Modesty Meets Luxury",
    description: "Discover Premium Abayas & Hijabs Crafted for the Modern Woman",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cormorant.variable} ${dmSerif.variable} antialiased bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
