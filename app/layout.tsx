import type { Metadata } from "next";
import { Alegreya } from "next/font/google";

const alegreya = Alegreya({
  subsets: ["latin"],
  variable: "--font-alegreya",
});

export const metadata = {
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
    <html lang="nl" className={alegreya.variable}>
      <body>{children}</body>
    </html>
  );
}