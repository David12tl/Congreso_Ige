import "./globals.css";
import Providers from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Añadimos clases base de Material Design 3 al HTML/Body para que no haya saltos de color (Flicker) al cargar
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <title>ELIGE 2026 - Congreso Internacional de Gestión Empresarial</title>
        
        {/* Favicon Actualizado con soporte para PNG */}
        <link rel="icon" type="image/png" href="/logo.png" />
        
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