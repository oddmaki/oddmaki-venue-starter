import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { venueConfig } from "@/config/venue.config";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { CategoryNav } from "@/components/category-nav";
import { NavigationProgress } from "@/components/navigation-progress";

export const metadata: Metadata = {
  title: {
    default: venueConfig.branding.name,
    template: `%s - ${venueConfig.branding.name}`,
  },
  description: venueConfig.branding.description,
  icons: {
    icon: venueConfig.branding.favicon,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <NavigationProgress />
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <CategoryNav />
            <main className="container mx-auto max-w-7xl pt-2 px-3 sm:px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-3">
              <span className="text-default-500 text-sm">
                Powered by the OddMaki Protocol
              </span>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
