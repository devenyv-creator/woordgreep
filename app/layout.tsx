import type { Metadata } from "next";
import { Alegreya } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

const alegreya = Alegreya({
  subsets: ["latin"],
  variable: "--font-alegreya",
});

export const metadata: Metadata = {
  title: "Woordgreep",
  description: "Dagelijkse Nederlandse woordpuzzel",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
return (
  <html lang="nl">
    <head>
      <Script
        async
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1828611231115211"
      />
    </head>

    <body className={alegreya.variable}>
      {children}
      <Analytics />
    </body>

    <GoogleAnalytics gaId="G-5Q453WR3BZ" />
  </html>
);}