import "./globals.css";
import Providers from "./providers";
import { Metadata } from "next";

// 1. Definimos los metadatos de forma oficial (Next.js se encarga de inyectar el favicon perfectamente)
export const metadata: Metadata = {
  title: "ELIGE 2026 - Congreso Internacional de Gestión Empresarial",
  description: "Congreso Internacional de Gestión Empresarial",
  icons: {
    icon: [
      {
        url: "/logo.png",
        href: "/logo.png",
      },
    ],
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
        {/* Cargamos las fuentes externas */}
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