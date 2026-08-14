import React from 'react';

export default function AuroraBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-bg-base transition-colors duration-500 overflow-hidden">
      {/* Capa 1: Malla de degradado Mesh UI base */}
      <div className="absolute inset-0 bg-[image:var(--aurora-mesh)] opacity-100 transition-all duration-700 pointer-events-none" />

      {/* Capa 2: Fluido Flotante Aurora UI (Esfera de Luz A) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-400/20 dark:bg-purple-600/10 animate-aurora-slow filter blur-[90px] pointer-events-none" />

      {/* Capa 3: Fluido Flotante Aurora UI (Esfera de Luz B) */}
      <div className="absolute bottom-[10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-fuchsia-300/10 dark:bg-indigo-900/15 animate-aurora-fast animate-fluid-pulse filter blur-[100px] pointer-events-none" />

      {/* Capa 4: Contenido real con posicionamiento relativo superior */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}