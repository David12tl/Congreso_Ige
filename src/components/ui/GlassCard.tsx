/**
 * GlassCard — Componente de tarjeta compartido para el dashboard.
 *
 * Usa un Map para la resolución del color de borde, eliminando el patrón
 * Record<string, string>[key] que dispara "security/detect-object-injection".
 */

type GlowColor = 'blue' | 'purple' | 'amber' | 'cyan' | 'emerald' | 'rose'

const GLOW_CLASS_MAP = new Map<GlowColor, string>([
  ['blue',    'border-blue-200 shadow-sm dark:border-blue-900/60 dark:shadow-none'],
  ['purple',  'border-purple-200 shadow-sm dark:border-purple-900/60 dark:shadow-none'],
  ['amber',   'border-amber-200 shadow-sm dark:border-amber-900/60 dark:shadow-none'],
  ['cyan',    'border-cyan-200 shadow-sm dark:border-cyan-900/60 dark:shadow-none'],
  ['emerald', 'border-emerald-200 shadow-sm dark:border-emerald-900/60 dark:shadow-none'],
  ['rose',    'border-rose-200 shadow-sm dark:border-rose-900/60 dark:shadow-none'],
])

const DEFAULT_GLOW_CLASS = 'border-slate-200 shadow-sm dark:border-slate-700 dark:shadow-none'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: GlowColor
}

export function GlassCard({ children, className = '', glowColor = 'cyan' }: GlassCardProps) {
  const borderClass = GLOW_CLASS_MAP.get(glowColor) ?? DEFAULT_GLOW_CLASS

  return (
    <div
      className={`relative rounded-[24px] border bg-white dark:bg-[#2a2a2f] overflow-hidden transition-all duration-300 ${borderClass} ${className}`}
    >
      {children}
    </div>
  )
}

export type { GlowColor }
