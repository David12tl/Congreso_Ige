'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

/* ─── Coordenadas exactas del Teatro Metropolitano, Orizaba, Ver. ─── */
const CENTER: [number, number] = [-97.0982, 18.8605];
const ZOOM = 15;

export default function MapboxMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const { resolvedTheme } = useTheme();

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  /* ─── Inicializar / reinicializar mapa cuando cambia el tema ─── */
  useEffect(() => {
    if (!token) {
      console.warn(
        '[MapboxMap] ⚠️ NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN no está configurado. ' +
        'Agrega tu token público en el archivo .env.local para que el mapa funcione.'
      );
      return;
    }

    mapboxgl.accessToken = token;

    const isDark = resolvedTheme === 'dark';

    // Si ya existe un mapa, destrúyelo para recrearlo con el nuevo estilo
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: isDark
        ? 'mapbox://styles/mapbox/navigation-night-v1'
        : 'mapbox://styles/mapbox/light-v11',
      center: CENTER,
      zoom: ZOOM,
      scrollZoom: false,            // ← evita scroll accidental
      attributionControl: false,     // lo agregamos manualmente más limpio
    });

    /* ─── Controles de navegación (zoom +/-) estilizados ─── */
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'bottom-right'
    );

    map.on('load', () => {
      /* ─── Marcador personalizado con SVG de pulso neón ─── */
      const el = document.createElement('div');
      el.className = 'cursor-pointer group';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <!-- Círculo de pulso animado -->
          <div class="absolute w-10 h-10 rounded-full bg-purple-500/30 animate-ping pointer-events-none"></div>
          <!-- Pin principal con gradiente neón -->
          <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-[0_0_12px_rgba(168,85,247,0.6)] relative z-10">
            <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="url(#pinGrad)" />
            <circle cx="18" cy="18" r="7" fill="white" />
            <defs>
              <linearGradient id="pinGrad" x1="0" y1="0" x2="36" y2="44">
                <stop stop-color="#a855f7" />
                <stop offset="1" stop-color="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      `;
      el.style.width = '36px';
      el.style.height = '44px';

      /* ─── Popup personalizado ─── */
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        maxWidth: '320px',
      }).setHTML(`
        <div class="bg-surface-card border border-purple-500/30 text-text-main p-4 rounded-xl shadow-lg" style="background: var(--aurora-surface, rgba(17,24,39,0.95)); backdrop-filter: blur(12px);">
          <p class="text-sm font-bold tracking-tight">📍 Sede Oficial: Teatro Metropolitano</p>
          <p class="text-xs mt-1 opacity-70">Zona Centro, Estado de Veracruz</p>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(CENTER)
        .setPopup(popup)
        .addTo(map);

      markerRef.current = marker;

      // Abrir popup automáticamente al cargar
      marker.togglePopup();
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [resolvedTheme, token]);

  /* ─── Overlay decorativo de bordes (difuminado) ─── */
  return (
    <div className="scroll-reveal">
      <div className="bg-surface-card border border-border-subtle rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Mapa */}
        <div className="relative h-[350px] md:h-[450px] rounded-2xl overflow-hidden">
          {/* Contenedor interno del mapa */}
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

          {!token && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-card/90 backdrop-blur-sm z-20">
              <div className="text-center px-8 py-12 max-w-md">
                <svg className="w-16 h-16 mx-auto mb-4 text-purple-500/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <p className="text-text-main font-semibold text-lg mb-2">Mapa no disponible</p>
                <p className="text-text-muted text-sm leading-relaxed">
                  Configura tu token de Mapbox en el archivo <code className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code> para ver la ubicación del evento.
                </p>
              </div>
            </div>
          )}

          {/* Overlay sutil superior e inferior para fusión con la interfaz */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-surface-card/60 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface-card/60 to-transparent pointer-events-none z-10" />
        </div>

        {/* Footer sutil con coordenadas */}
        <div className="flex items-center justify-between mt-4 text-[11px] text-text-muted/60 font-mono px-2">
          <span>📍 Teatro Metropolitano, Orizaba</span>
          <span className="hidden sm:inline-block">18.8605° N · 97.0982° O</span>
        </div>
      </div>
    </div>
  );
}