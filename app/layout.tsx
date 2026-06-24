import type { Metadata } from "next";
import { Alegreya } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import "./globals.css";

const alegreya = Alegreya({
  subsets: ["latin"],
  variable: "--font-alegreya",
});

export const metadata: Metadata = {
  title: "Woordgreep",
  description: "Dagelijkse Nederlandse woordpuzzel",

  other: {
    "google-adsense-account": "ca-pub-1828611231115211",
  },

  manifest: "/manifest.json",

  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        <script
          data-grow-initializer=""
          dangerouslySetInnerHTML={{
            __html: `!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTpkMzhmMjZhNC03Y2RiLTRiYTktYmVkZS1iNGRiYmZkZDQ5NDM=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();`,
          }}
        />
      </head>

      <body className={alegreya.variable}>
        {children}

        <Analytics />
        <GoogleAnalytics gaId="G-5Q453WR3BZ" />

        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1828611231115211"
        />
      </body>
    </html>
  );
}