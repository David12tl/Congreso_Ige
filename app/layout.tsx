import "./globals.css";
import Providers from "./providers";
import { Metadata } from "next";

// 1. Definimos los metadatos de forma estática y limpia. 
// Aquí le añadimos la versión para engañar al navegador sin usar funciones impuras.
export const metadata: Metadata = {
  title: "ELIGE 2026 - Congreso Internacional de Gestión Empresarial",
  description: "Congreso Internacional de Gestión Empresarial",
  icons: {
    icon: [
      {
        url: "/logo.png?v=3",
        href: "/logo.png?v=3",
      },
    ],
    shortcut: ["/logo.png?v=3"],
    apple: ["/logo.png?v=3"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Dejamos el <head> libre de etiquetas de iconos manuales para que Next.js inserte las de arriba */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}