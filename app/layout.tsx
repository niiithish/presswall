import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { PresswallAppNav } from "@/components/presswall/app-nav";
import { SessionBootstrap } from "@/components/session-bootstrap";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Presswall",
    description: "As seen on press logos for your Shopify storefront",
    icons: {
      icon: "/brand/black-back.png",
      apple: "/brand/black-back.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <meta
          content={process.env.SHOPIFY_API_KEY ?? ""}
          name="shopify-api-key"
        />
        <script
          async={false}
          src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
        />
      </head>
      <body>
        <PresswallAppNav />
        <SessionBootstrap />
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
