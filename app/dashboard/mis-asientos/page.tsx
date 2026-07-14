'use client'

import React, { useEffect, useState } from 'react'
import { HiOutlineTicket, HiOutlineMap, HiOutlineExclamationCircle } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'
import { getMisAsientos, AsientoInfo } from './actions'

export default function MisAsientosPage() {
  const [asientos, setAsientos] = useState<AsientoInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadAsientos() {
      try {
        const data = await getMisAsientos()
        if (isMounted) {
          setAsientos(data)
        }
      } catch (err) {
        console.error('Error cargando asientos:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadAsientos()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
        <p className="text-slate-500 font-light text-xs uppercase tracking-widest">Cargando tus asientos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] text-2xl md:text-3xl">
            <HiOutlineTicket className="inline-block w-8 h-8 mr-3 text-blue-700" />
            Mis{' '}
            <span className="text-blue-700">
              Asientos
            </span>
          </h1>
          <p className="text-slate-500 text-sm font-light mt-1">USUARIO // SELECCIÓN_DE_ESPACIOS</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-blue-700 text-xs font-bold uppercase tracking-widest">{asientos.length} asientos</span>
        </div>
      </header>

      {/* Asientos Grid */}
      {asientos.length === 0 ? (
        <GlassCard className="p-12 flex flex-col items-center justify-center text-center" glowColor="amber">
          <HiOutlineExclamationCircle className="w-16 h-16 text-amber-700 mb-4" />
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">Sin asientos asignados</h2>
          <p className="text-slate-500 font-light max-w-md">
            Aún no has seleccionado tus asientos. Dirígete al módulo de generación de QR
            para elegir tus espacios preferidos.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {asientos.map((asiento) => (
            <GlassCard key={asiento.id} className="p-6" glowColor="blue">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <HiOutlineMap className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0f172a]">{asiento.zona}</h3>
                  <p className="text-xs text-slate-500 font-light">Fila {asiento.fila}, Asiento {asiento.numero}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-light">Estado</span>
                  <span className="text-blue-700 font-bold uppercase">{asiento.estado}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-light">Tipo</span>
                  <span className="text-slate-700 font-light">{asiento.tipo}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}