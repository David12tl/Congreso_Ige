import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  // Título e información optimizada para reflejar el tono del 1er Congreso Internacional 
  title: "ELIGE 2026 — 1er Congreso Internacional en Gestión Empresarial",
  description: "Un espacio internacional de aprendizaje, inspiración y transferencia tecnológica en la región centro de Veracruz.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Añadimos clases base de Material Design 3 al HTML/Body para que no haya saltos de color (Flicker) al cargar
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}