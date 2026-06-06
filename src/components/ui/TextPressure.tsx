'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

const dist = (a: Point, b: Point): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance: number, maxDist: number, minVal: number, maxVal: number): number => {
  const val = maxVal - Math.abs((maxVal * distance) / maxDist);
  return Math.max(minVal, val + minVal);
};

const debounce = <T extends (...args: unknown[]) => void>(func: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

interface TextPressureProps {
  text?: string;
  fontFamily?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  className?: string;
  minFontSize?: number;
}

export default function TextPressure({
  text = 'ELIGE 2026',
  fontFamily = 'Compressa VF',
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = 'currentColor',
  className = '',
  minFontSize = 24
}: TextPressureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const spansRef = useRef<HTMLSpanElement[]>([]);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const cursorRef = useRef<Point>({ x: 0, y: 0 });

  const [fontSize, setFontSize] = useState<number>(minFontSize);
  const [scaleY, setScaleY] = useState<number>(1);
  const [lineHeight, setLineHeight] = useState<number>(1);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(
    typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false
  );
  const chars = text.split('');

  useEffect(() => {
    // Detectar si es dispositivo táctil
    const touchQuery = window.matchMedia('(pointer: coarse)');
    const handleTouchChange = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    touchQuery.addEventListener('change', handleTouchChange);

    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
    };
    const handleTouchEnd = () => {
      // Al levantar el dedo, restaurar suavemente al centro del contenedor
      if (containerRef.current) {
        const { left, top, width: w, height: h } = containerRef.current.getBoundingClientRect();
        cursorRef.current.x = left + w / 2;
        cursorRef.current.y = top + h / 2;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    if (containerRef.current) {
      const { left, top, width: w, height: h } = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + w / 2;
      mouseRef.current.y = top + h / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }
    return () => {
      touchQuery.removeEventListener('change', handleTouchChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const setSize = useCallback(() => {
    if (!containerRef.current || !titleRef.current) return;
    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();
    let newFontSize = containerW / (chars.length / 2);
    newFontSize = Math.max(newFontSize, minFontSize);
    setFontSize(newFontSize);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current) return;
      const textRect = titleRef.current.getBoundingClientRect();
      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
    });
  }, [chars.length, minFontSize, scale]);

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100);
    debouncedSetSize();
    window.addEventListener('resize', debouncedSetSize);
    // También recalcular en orientation change (móviles al girar)
    const handleOrientationChange = () => {
      setTimeout(debouncedSetSize, 150);
    };
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('resize', debouncedSetSize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [setSize]);

  useEffect(() => {
    // ─── BLOQUEO PARA MÓVILES (<768px) ──────────────────────────
    // En pantallas pequeñas la animación cinética se desactiva por completo:
    // todas las letras se fijan a valores base (peso normal, ancho normal, sin inclinación, opacidad 1)
    // para evitar procesamiento extra y que el botón Login no se rompa.
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      spansRef.current.forEach(span => {
        if (!span) return;
        span.style.fontVariationSettings = `'wght' 400, 'wdth' 100, 'ital' 0`;
        span.style.opacity = '1';
      });
      return; // Salimos del efecto sin lanzar el requestAnimationFrame
    }

    let rafId: number;
    // Umbral de píxeles: ignoramos movimientos menores a 4px para evitar recálculos innecesarios
    const MOVEMENT_THRESHOLD = 4;
    let lastProcessedX = mouseRef.current.x;
    let lastProcessedY = mouseRef.current.y;

    const animate = () => {
      // En dispositivos táctiles usar amortiguación más fuerte (divisor mayor)
      const damping = isTouchDevice ? 25 : 15;
      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / damping;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / damping;

      // Saltar recálculo si el cambio de posición es insignificante (< umbral de píxeles)
      const dx = mouseRef.current.x - lastProcessedX;
      const dy = mouseRef.current.y - lastProcessedY;
      const movedDistance = Math.sqrt(dx * dx + dy * dy);

      if (movedDistance >= MOVEMENT_THRESHOLD && titleRef.current) {
        lastProcessedX = mouseRef.current.x;
        lastProcessedY = mouseRef.current.y;

        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = titleRect.width / 2;

        spansRef.current.forEach(span => {
          if (!span) return;
          const rect = span.getBoundingClientRect();
          const charCenter: Point = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
          const d = dist(mouseRef.current, charCenter);

          const wdth = width ? Math.floor(getAttr(d, maxDist, 5, 200)) : 100;
          const wght = weight ? Math.floor(getAttr(d, maxDist, 100, 900)) : 400;
          const italVal = italic ? getAttr(d, maxDist, 0, 1).toFixed(2) : '0';
          const alphaVal = alpha ? getAttr(d, maxDist, 0, 1).toFixed(2) : '1';

          const newFontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;
          if (span.style.fontVariationSettings !== newFontVariationSettings) {
            span.style.fontVariationSettings = newFontVariationSettings;
          }
          if (alpha && span.style.opacity !== alphaVal) {
            span.style.opacity = alphaVal;
          }
        });
      }
      rafId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(rafId);
  }, [width, weight, italic, alpha, isTouchDevice]);

  // CSS movido a app/globals.css para evitar inyección de <style> tags inline
  // que causan errores de hidratación y scripts fantasmas en Next.js
  const dynamicClassName = [className, flex ? 'flex-pressure' : '', stroke ? 'stroke-pressure' : ''].filter(Boolean).join(' ');

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', background: 'transparent' }}>
      <h1
        ref={titleRef}
        className={dynamicClassName}
        style={{
          fontFamily,
          textTransform: 'uppercase',
          fontSize: fontSize,
          lineHeight,
          transform: `scale(1, ${scaleY})`,
          transformOrigin: 'center top',
          margin: 0,
          textAlign: 'center',
          userSelect: 'none',
          whiteSpace: 'nowrap' as const,
          fontWeight: 100,
          width: '100%',
          color: textColor === 'currentColor' ? 'var(--aurora-text)' : textColor
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={(el: HTMLSpanElement | null) => {
              if (el) spansRef.current[i] = el;
            }}
            data-char={char}
            style={{ display: 'inline-block' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>
    </div>
  );
}