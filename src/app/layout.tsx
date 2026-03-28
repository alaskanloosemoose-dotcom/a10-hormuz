import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A10 Hormuz - Naval Combat Simulator",
  description: "A retro-styled naval combat game built with Next.js and Three.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="crt-overlay scanline"></div>
        {children}
      </body>
    </html>
  );
}
