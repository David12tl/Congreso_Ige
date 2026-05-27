'use client'

import { useState } from 'react'
import {
  HiOutlineQrcode,
  HiOutlineCalendar,
  HiOutlineStar,
  HiOutlineCheckCircle,
  HiOutlinePlusCircle,
  HiOutlineLightningBolt,
  HiOutlineUser,
  HiOutlineLocationMarker,
} from 'react-icons/hi'

// ─── Mock data ──────────────────────────────────────────────────────────────
const USER = {
  name: 'David Hernández',
  id: 'IGE-2026-0A3F',
  land: 'Developer Land',
  landColor: 'cyan',
  points: 2480,
  level: 'Platino',
}

const LAND_COLORS: Record<string, { glow: string; bg: string; text: string; border: string }> = {
  cyan: {
    glow: 'rgba(34,211,238,0.3)',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    glow: 'rgba(168,85,247,0.3)',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'rgba(52,211,153,0.3)',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    glow: 'rgba(245,158,11,0.3)',
  },
}

interface ConferenceTalk {
  id: string
  title: string
  speaker: string
  time: string
  location: string
  land: string
}

const RECOMMENDED_TALKS: ConferenceTalk[] = [
  {
    id: 't1',
    title: 'Arquitectura Serverless en la Nube',
    speaker: 'María García',
    time: '09:00 - 10:00',
    location: 'Sala Principal',
    land: 'Developer Land',
  },
  {
    id: 't2',
    title: 'WebSockets: Tiempo Real con Node.js',
    speaker: 'Carlos Mendoza',
    time: '10:30 - 11:30',
    location: 'Sala B',
    land: 'Developer Land',
  },
  {
    id: 't3',
    title: 'Testing Automatizado con Playwright',
    speaker: 'Ana López',
    time: '12:00 - 13:00',
    location: 'Sala A',
    land: 'Developer Land',
  },
  {
    id: 't4',
    title: 'GraphQL vs REST: ¿Cuál Elegir?',
    speaker: 'Roberto Díaz',
    time: '14:00 - 15:00',
    location: 'Sala Principal',
    land: 'Developer Land',
  },
  {
    id: 't5',
    title: 'Kubernetes para Desarrolladores',
    speaker: 'Laura Castillo',
    time: '15:30 - 16:30',
    location: 'Sala B',
    land: 'Developer Land',
  },
]

// ─── Components ─────────────────────────────────────────────────────────────

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden ${className}`}
    >
      {/* Subtle glow top border */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      {children}
    </div>
  )
}

function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  )
}

// ─── Ticket Card ────────────────────────────────────────────────────────────

function TicketCard() {
  const colors = LAND_COLORS[USER.landColor] ?? LAND_COLORS.cyan

  return (
    <GlassCard className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* QR Code placeholder */}
        <div
          className="relative shrink-0 w-28 h-28 md:w-32 md:h-32 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
          style={{ boxShadow: `0 0 30px ${colors.glow}` }}
        >
          {/* Fake QR pattern */}
          <div className="grid grid-cols-5 gap-1 p-2 w-full h-full">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-sm ${i % 3 === 0 || i % 7 === 0 ? 'bg-white/80' : 'bg-transparent'}`}
              />
            ))}
          </div>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
              <HiOutlineQrcode className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="flex-1 text-center md:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border mb-3"
            style={{
              backgroundColor: colors.bg,
              color: colors.text.replace('text-', ''),
              borderColor: colors.border.replace('border-', ''),
              boxShadow: `0 0 12px ${colors.glow}`,
            }}
          >
            <HiOutlineLightningBolt className="w-3.5 h-3.5" />
            {USER.land}
          </div>

          <h2 className="text-2xl font-bold text-white mt-2">{USER.name}</h2>

          <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-400 text-sm">
            <HiOutlineUser className="w-4 h-4" />
            <span className="font-mono tracking-wider">{USER.id}</span>
          </div>

          <p className="text-gray-500 text-xs mt-1">Pase de Acceso — Congreso IGE 2026</p>
        </div>

        {/* Level badge */}
        <div className="shrink-0 text-center">
          <div
            className="w-16 h-16 rounded-full border-2 flex items-center justify-center animate-pulse"
            style={{
              borderColor: colors.glow,
              boxShadow: `0 0 20px ${colors.glow}`,
            }}
          >
            <HiOutlineStar className="w-7 h-7 text-cyan-400" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-cyan-400/70 mt-1 font-semibold">
            {USER.level}
          </p>
        </div>
      </div>
    </GlassCard>
  )
}

// ─── Agenda ─────────────────────────────────────────────────────────────────

function AgendaSection() {
  const [savedTalks, setSavedTalks] = useState<Set<string>>(new Set())

  const toggleTalk = (id: string) => {
    setSavedTalks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <GlassCard className="p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <HiOutlineCalendar className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">Mi Agenda Personalizada</h2>
        <span className="ml-auto text-xs text-gray-500">
          {savedTalks.size} / {RECOMMENDED_TALKS.length} guardadas
        </span>
      </div>

      <div className="space-y-3">
        {RECOMMENDED_TALKS.map((talk) => {
          const isSaved = savedTalks.has(talk.id)
          return (
            <div
              key={talk.id}
              className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300
                ${
                  isSaved
                    ? 'bg-cyan-500/5 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.08)]'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                }`}
            >
              {/* Time column */}
              <div className="shrink-0 w-20 text-right">
                <p className="text-xs font-mono text-cyan-400/80">{talk.time.split(' - ')[0]}</p>
                <p className="text-xs font-mono text-gray-500">{talk.time.split(' - ')[1]}</p>
              </div>

              {/* Vertical line */}
              <div className="shrink-0 relative flex flex-col items-center py-1">
                <div
                  className={`w-3 h-3 rounded-full border-2 transition-all duration-300
                    ${
                      isSaved
                        ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                        : 'bg-transparent border-gray-600'
                    }`}
                />
                <div className="w-px flex-1 bg-white/5 mt-1" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <h3 className={`font-semibold text-sm transition-colors duration-300 ${isSaved ? 'text-white' : 'text-gray-300'}`}>
                  {talk.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <HiOutlineUser className="w-3.5 h-3.5" />
                    {talk.speaker}
                  </span>
                  <span className="flex items-center gap-1">
                    <HiOutlineLocationMarker className="w-3.5 h-3.5" />
                    {talk.location}
                  </span>
                </div>
              </div>

              {/* Add/Remove button */}
              <button
                onClick={() => toggleTalk(talk.id)}
                className={`shrink-0 mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300
                  ${
                    isSaved
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {isSaved ? (
                  <>
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    En Agenda
                  </>
                ) : (
                  <>
                    <HiOutlinePlusCircle className="w-4 h-4" />
                    Añadir
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}

// ─── Points / Gamification ──────────────────────────────────────────────────

function PointsSection() {
  const POINTS_BREAKDOWN = [
    { action: 'Registro en el evento', points: 500, icon: '✨' },
    { action: 'Escaneo: Stand de AWS', points: 250, icon: '☁️' },
    { action: 'Escaneo: Stand de Google Cloud', points: 250, icon: '☁️' },
    { action: 'Escaneo: Stand de GitHub', points: 250, icon: '🐙' },
    { action: 'Encuesta completada', points: 100, icon: '📋' },
    { action: 'Networking: 5 conexiones', points: 150, icon: '🤝' },
  ]

  const totalPossible = POINTS_BREAKDOWN.reduce((acc, p) => acc + p.points, 0)
  const progressPercent = Math.round((USER.points / totalPossible) * 100)

  // Next reward tier
  const tiers = [
    { name: 'Bronce', min: 0, color: 'text-amber-600' },
    { name: 'Plata', min: 1000, color: 'text-gray-300' },
    { name: 'Oro', min: 2000, color: 'text-yellow-400' },
    { name: 'Platino', min: 3000, color: 'text-cyan-400' },
    { name: 'Diamante', min: 5000, color: 'text-purple-400' },
  ]
  const nextTier = tiers.find((t) => t.min > USER.points) ?? tiers[tiers.length - 1]
  const pointsToNext = nextTier ? nextTier.min - USER.points : 0

  return (
    <GlassCard className="p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <HiOutlineLightningBolt className="w-6 h-6 text-amber-400" />
        <h2 className="text-xl font-bold text-white">Puntos & Gamificación</h2>
      </div>

      {/* Main counter */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="relative">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-center animate-pulse"
            style={{
              background: 'conic-gradient(from 0deg, rgba(34,211,238,0.3) 0%, rgba(168,85,247,0.3) 100%)',
              boxShadow: '0 0 40px rgba(34,211,238,0.2), inset 0 0 30px rgba(0,0,0,0.5)',
            }}
          >
            <div className="w-24 h-24 rounded-full bg-slate-950/80 flex flex-col items-center justify-center backdrop-blur-sm">
              <span className="text-3xl font-bold text-white">{USER.points}</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Puntos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Progreso a {nextTier.name}</span>
          <span>{pointsToNext} pts restantes</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #22d3ee, #a855f7)',
              boxShadow: '0 0 10px rgba(34,211,238,0.4)',
            }}
          />
        </div>
      </div>

      {/* Tiers */}
      <div className="flex justify-between mb-6 px-1">
        {tiers.map((tier) => {
          const unlocked = USER.points >= tier.min
          return (
            <div key={tier.name} className="text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 mx-auto
                  ${unlocked ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'bg-white/5 border-white/10 text-gray-600'}`}
              >
                {tier.name[0]}
              </div>
              <p className={`text-[10px] mt-1 ${unlocked ? tier.color : 'text-gray-600'}`}>{tier.name}</p>
            </div>
          )
        })}
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Desglose de Actividad</p>
        {POINTS_BREAKDOWN.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5"
          >
            <span className="text-sm text-gray-300 flex items-center gap-2">
              <span className="text-base">{item.icon}</span>
              {item.action}
            </span>
            <span className="text-xs font-mono text-cyan-400/80">+{item.points}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function UsuarioDashboardPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          <GradientText>Panel de Asistente</GradientText>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenido a tu centro de control del Congreso IGE 2026
        </p>
      </div>

      {/* Ticket */}
      <TicketCard />

      {/* Two-column layout for agenda + points */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AgendaSection />
        </div>
        <div>
          <PointsSection />
        </div>
      </div>
    </div>
  )
}