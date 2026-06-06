import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import AnimatedBackground from "@/src/components/ui/AnimatedBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ELIGE",
  icons: {
       icon: "/favicon.ico", // O '/icon.png'
       shortcut: "/favicon.ico",
       apple: "/apple-touch-icon.png", // Opcional, para dispositivos iOS
     }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`} suppressHydrationWarning>
        <AnimatedBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}