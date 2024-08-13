import type { Metadata } from "next";
import dynamic from 'next/dynamic'
// Providers
import { ThemeProvider } from "@/components/theme-provider"
import { PHProvider } from './providers'
// Styles
import { Inter } from "next/font/google";
import "./globals.css";
// Components
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] });

const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
  ssr: false,
})

export const metadata: Metadata = {
  title: "CustomTCG.art",
  description: "Generate art for custom TCG cards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <PHProvider>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <PostHogPageView /> 
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </PHProvider>
    </html>
  );
}
