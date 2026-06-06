'use client';

import React, { useEffect, useRef, useCallback } from 'react';

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  pulse: number;
  phase: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbsRef = useRef<Orb[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);
  const isDarkRef = useRef(true);

  const getColors = useCallback((isDark: boolean): string[] => {
    if (isDark) {
      return [
        'rgba(124, 58, 237, {a})',   // purple-600
        'rgba(99, 102, 241, {a})',   // indigo-500
        'rgba(139, 92, 246, {a})',   // violet-500
        'rgba(59, 130, 246, {a})',   // blue-500
        'rgba(167, 139, 250, {a})',  // violet-300
      ];
    }
    return [
      'rgba(196, 180, 222, {a})',   // light purple
      'rgba(167, 139, 250, {a})',   // light violet
      'rgba(199, 210, 254, {a})',   // light indigo
      'rgba(191, 219, 254, {a})',   // light blue
      'rgba(221, 214, 254, {a})',   // light lavender
    ];
  }, []);

  const initOrbs = useCallback((w: number, h: number, isDark: boolean) => {
    const colors = getColors(isDark);
    const count = isDark ? 6 : 4;
    const orbs: Orb[] = [];

    for (let i = 0; i < count; i++) {
      orbs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: isDark
          ? 150 + Math.random() * 250
          : 120 + Math.random() * 180,
        color: colors[i % colors.length],
        pulse: 0.8 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      });
    }

    orbsRef.current = orbs;
  }, [getColors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const isDark = document.documentElement.classList.contains('dark');
      isDarkRef.current = isDark;
      initOrbs(canvas.width, canvas.height, isDark);
    };

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark !== isDarkRef.current) {
        isDarkRef.current = isDark;
        initOrbs(canvas.width, canvas.height, isDark);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('mouseleave', onLeave);

    let time = 0;

    const animate = () => {
      time += 0.005;
      const w = canvas.width;
      const h = canvas.height;
      const mouse = mouseRef.current;
      const orbs = orbsRef.current;

      ctx.clearRect(0, 0, w, h);

      for (const orb of orbs) {
        // Gentle drift
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Subtle mouse attraction
        const dx = mouse.x - orb.x;
        const dy = mouse.y - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 400) {
          const force = (400 - dist) / 400 * 0.02;
          orb.vx += dx * force;
          orb.vy += dy * force;
        }

        // Damping
        orb.vx *= 0.98;
        orb.vy *= 0.98;

        // Boundaries with soft bounce
        if (orb.x < -orb.radius) orb.x = w + orb.radius;
        if (orb.x > w + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = h + orb.radius;
        if (orb.y > h + orb.radius) orb.y = -orb.radius;

        // Pulse
        const pulseScale = 1 + Math.sin(time * 2 + orb.phase) * 0.15;
        const alpha = (0.12 + Math.sin(time * 1.5 + orb.phase) * 0.06)
          * (isDarkRef.current ? 1 : 0.6);

        const r = orb.radius * pulseScale;
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
        const colorStr = orb.color.replace('{a}', String(alpha));
        gradient.addColorStop(0, colorStr);
        gradient.addColorStop(0.4, orb.color.replace('{a}', String(alpha * 0.5)));
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('mouseleave', onLeave);
      observer.disconnect();
    };
  }, [initOrbs]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}