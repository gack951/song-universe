import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SONG UNIVERSE",
  description: "Pixel 9 Proのブラウザー内AIが、保存されないインストゥルメンタル音楽を生成し続けます。",
  manifest: "/manifest.webmanifest",
  themeColor: "#0b090e",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  openGraph: { title: "SONG UNIVERSE", description: "一期一会の無限音楽", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "SONG UNIVERSE", description: "一期一会の無限音楽", images: ["/og.png"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
