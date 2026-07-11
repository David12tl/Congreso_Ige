// Component ported from https://codepen.io/JuanFuentes/full/rgXKGQ

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';

interface TextPressureProps {
  text?: string;
  fontFamily?: string;
  fontUrl?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  className?: string;
  minFontSize?: number;
}

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance: number, maxDist: number, minVal: number, maxVal: number): number => {
  const ratio = Math.min(1, Math.max(0, distance / maxDist));
  // Inversión: cuando ratio es 0 (mouse encima), devuelve minVal. Cuando ratio es 1 (lejos), devuelve maxVal.
  return minVal + ratio * (maxVal - minVal);
};

const debounce = (func: (...args: unknown[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: unknown, ...args: unknown[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args as []);
    }, delay);
  };
};

const TextPressure: React.FC<TextPressureProps> = ({
  text = 'Compressa',
  fontFamily = 'Roboto Flex',
  fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap',
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = '#FFFFFF',
  strokeColor = '#FF0000',
  strokeWidth = 2,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);
  // 🚀 OPTIMIZACIÓN: Almacenar las geometrías de las letras para evitar reflows.
  const charGeometriesRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  }[]>([]);

  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });

  const [fontSize, setFontSize] = useState(24); // Default to a small size
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);

  const chars = text.split('');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    if (containerRef.current) {
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + width / 2;
      mouseRef.current.y = top + height / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    }; // Se agregó el array de dependencias vacío
  }, []);

  const setSize = useCallback(() => {
    if (!containerRef.current || !titleRef.current) return;

    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();

    // 🚀 RESPONSIVE: Fórmula mejorada para el tamaño de fuente.
    // Se ajusta mejor al ancho, usando una base y un factor de crecimiento.
    const baseSize = 24; // Tamaño mínimo absoluto
    const newFontSize = baseSize + (containerW / chars.length) * 1.5;

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

      // 🚀 OPTIMIZACIÓN: Calcular y guardar la geometría de cada letra una sola vez.
      charGeometriesRef.current = spansRef.current.map(span => {
        if (!span) return { x: 0, y: 0, width: 0, height: 0 };
        const rect = span.getBoundingClientRect();
        return {
          x: rect.left, y: rect.top,
          width: rect.width, height: rect.height
        };
      }); // Se corrigió la sintaxis del cierre de .map()
    });
  }, [chars.length, scale]);

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100); // Se corrigió el nombre de la función
    debouncedSetSize();
    window.addEventListener('resize', debouncedSetSize);
    return () => window.removeEventListener('resize', debouncedSetSize);
  }, [setSize]);

  useEffect(() => {
    let rafId: number;
    const animate = () => {
      // 🚀 Se movió la lógica de animación de vuelta a su useEffect

      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

      if (titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = titleRect.width / 2;

        // eslint-disable-next-line security/detect-object-injection
        spansRef.current.forEach((span, i) => {
          if (!span || !charGeometriesRef.current[i]) return;

          // eslint-disable-next-line security/detect-object-injection
          const rect = charGeometriesRef.current[i];
          const charCenter = {
            x: rect.x + rect.width / 2, // Usamos la geometría cacheada
            y: rect.y + rect.height / 2  // Usamos la geometría cacheada
          };

          const d = dist(mouseRef.current, charCenter);

          const wdth = width ? Math.floor(getAttr(d, maxDist, 5, 200)) : 100;
          const wght = weight ? Math.floor(getAttr(d, maxDist, 100, 900)) : 400;
          const italVal = italic ? getAttr(d, maxDist, 0, 1).toFixed(2) : '0';
          const alphaVal = alpha ? getAttr(d, maxDist, 0, 1).toFixed(2) : '1';

          if (span.style.fontVariationSettings !== `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`) {
            span.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;
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
  }, [width, weight, italic, alpha]);

  const styleElement = useMemo(() => {
    return (
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('${fontUrl}');
            .stroke span {
              position: relative;
              color: ${textColor};
            }
            .stroke span::after {
              content: attr(data-char);
              position: absolute;
              left: 0;
              top: 0;
              color: transparent;
              z-index: -1;
              -webkit-text-stroke-width: ${strokeWidth}px;
              -webkit-text-stroke-color: ${strokeColor};
            }
          `,
        }}
      />
    );
  }, [fontUrl, textColor, strokeColor, strokeWidth]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-transparent">
      {styleElement}
      <h1
        ref={titleRef}
        className={`text-pressure-title ${className} ${
          flex ? 'flex justify-between' : ''
        } ${stroke ? 'stroke' : ''} uppercase text-center`}
        style={{
          fontFamily,
          fontSize: fontSize,
          lineHeight,
          transform: `scale(1, ${scaleY})`,
          transformOrigin: 'center top',
          margin: 0,
          fontWeight: 100,
          color: stroke ? undefined : textColor
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={el => {
              // eslint-disable-next-line security/detect-object-injection
              spansRef.current[i] = el;
            }}
            data-char={char}
            className="inline-block"
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default TextPressure;