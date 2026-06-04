'use client'

import React, { useState, useEffect, useTransition, useCallback } from 'react'
import { createClient } from '@/src/lib/supabase/client' 
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'




import

 

TeatroMap

 

from

 

'../../../src/components/ui/MapaTeatro'


 

interface PurchaseInsert {
  stripe_session_id: string;
  total: number;
  status: string;
}

interface TokenInsert {
  token_code: string;
  event_id: string; 
  zone_id: string;  
  creado_por: string;
  status: string;
  created_at?: string;
}

export default function GeneradorTokensPage() {
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()

  // Estado compartido con el mapa interactivo
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<string[]>([]) 
  const [stats, setStats] = useState({ total: 0, disponibles: 0, usados: 0 })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [tokensGenerados, setTokensGenerados] = useState<string[]>([])
  const [mostrarExito, setMostrarExito] = useState(false)

  // Cargar estadísticas del panel
  const cargarEstadisticas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tokens_canje')
        .select('status')

      if (error) throw error

      if (data) {
        const tokens = data as { status: string }[]
        const total = tokens.length
        const disponibles = tokens.filter((t) => t.status === 'disponible').length
        const usados = total - disponibles
        setStats({ total, disponibles, usados })
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err)
    }
  }, [supabase])

  useEffect(() => {
    cargarEstadisticas()
  }, [cargarEstadisticas])

  // FUNCIÓN PRINCIPAL
  const handleGenerarTokens = () => {
    if (asientosSeleccionados.length === 0) {
      setErrorMsg('Por favor, selecciona al menos un asiento en el mapa antes de generar los tokens.')
      return
    }

    startTransition(async () => {
      try {
        setErrorMsg(null)
        setMostrarExito(false)

        // 1. Obtener datos del encargado activo
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData?.user) {
          setErrorMsg('Error de autenticación: No se detectó un encargado activo.')
          return
        }
        const creadoPorUuid = authData.user.id

        // 2. RECOLECTOR DE IDS REALES (Evita el error de Foreign Key Constraint 23503)
        // Vamos a traer dinámicamente un ID real de la tabla 'zones' y de 'events'
        const { data: listaZonas } = await supabase.from('zones').select('id').limit(1)
        const { data: listaEventos } = await supabase.from('events').select('id').limit(1)

        const ID_ZONA_REAL_RESPALDO = listaZonas?.[0]?.id
        const ID_EVENTO_REAL_RESPALDO = listaEventos?.[0]?.id

        if (!ID_ZONA_REAL_RESPALDO || !ID_EVENTO_REAL_RESPALDO) {
          setErrorMsg('Error de configuración: Asegúrate de tener al menos una Zona y un Evento creados en tu base de datos de Supabase antes de generar tokens.')
          return
        }

        // 3. Consulta defensiva a la tabla de tickets
        const { data: dataTickets, error: errorTickets } = await supabase
          .from('tickets')
          .select('*')
          .limit(1)

        if (errorTickets) {
          console.warn('Advertencia en tabla tickets (esperado en desarrollo):', errorTickets.message)
        }

        const filasPurchasesAInsertar: PurchaseInsert[] = []
        const mapaTokenAData: Record<string, { zone_id: string; event_id: string }> = {}
        const nuevosCodigos: string[] = []

        // 4. Mapeo seguro utilizando los IDs existentes de tu Postgres
        const ticketsConsultados = (dataTickets || []) as Record<string, any>[]
        
        const registrosAProcesar = ticketsConsultados.length > 0 
          ? ticketsConsultados 
          : asientosSeleccionados.map((idString) => ({
              name: idString,
              zone_id: ID_ZONA_REAL_RESPALDO, // 👈 ID Real inyectado
              event_id: ID_EVENTO_REAL_RESPALDO // 👈 ID Real inyectado
            }))

        registrosAProcesar.forEach((ticket) => {
          const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
          let tokenAleatorio = 'TK-'
          for (let i = 0; i < 6; i++) {
            tokenAleatorio += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
          }

          nuevosCodigos.push(tokenAleatorio)
          
          mapaTokenAData[tokenAleatorio] = {
            zone_id: String(ticket.zone_id || ID_ZONA_REAL_RESPALDO),
            event_id: String(ticket.event_id || ID_EVENTO_REAL_RESPALDO)
          }

          filasPurchasesAInsertar.push({
            stripe_session_id: tokenAleatorio,
            total: 350, 
            status: 'completed'
          })
        })

        // 5. Inserción masiva en la tabla PURCHASES
        const { data: dataCompras, error: errorCompras } = await supabase
          .from('purchases')
          .insert(filasPurchasesAInsertar)
          .select('stripe_session_id, created_at')

        if (errorCompras || !dataCompras) {
          console.error('Error al registrar compras:', errorCompras)
          setErrorMsg(`Error crítico en compras: ${errorCompras?.message || 'No se pudo procesar'}`)
          return
        }

        const comprasRegistradas = dataCompras as { stripe_session_id: string; created_at: string }[]

        // 6. Mapear compras registradas e insertarlas en la tabla TOKENS_CANJE
        const filasTokensAInsertar: TokenInsert[] = comprasRegistradas.map((compra) => {
          const tokenUnico = compra.stripe_session_id
          const dataTicket = mapaTokenAData[tokenUnico]

          return {
            token_code: tokenUnico,
            event_id: dataTicket.event_id, 
            zone_id: dataTicket.zone_id,   
            creado_por: creadoPorUuid,
            status: 'disponible',
            created_at: compra.created_at 
          }
        })

        const { error: insertTokensError } = await supabase
          .from('tokens_canje')
          .insert(filasTokensAInsertar)

        if (insertTokensError) {
          console.error('Error al insertar tokens_canje:', insertTokensError)
          setErrorMsg(`Error al generar tokens_canje en Postgres: ${insertTokensError.message}`)
          return
        }

        // 7. Éxito absoluto y reseteo
        setTokensGenerados(nuevosCodigos)
        setMostrarExito(true)
        setAsientosSeleccionados([]) 
        await cargarEstadisticas() 

      } catch (err) {
        console.error('Error general capturado:', err)
        setErrorMsg('Ocurrió un error inesperado al procesar la solicitud.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-8">
      {/* PANEL DE CONTROL DE ESTADÍSTICAS */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-black uppercase tracking-wider text-emerald-400">
          Administrador de Accesos y Canjes
        </h1>
        <p className="text-xs text-gray-400 mt-1">Generación inmediata de códigos de verificación</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Tokens Totales</p>
          <p className="text-2xl font-black mt-1 text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-900 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Disponibles</p>
          <p className="text-2xl font-black mt-1 text-emerald-400">{stats.disponibles}</p>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Utilizados</p>
          <p className="text-2xl font-black mt-1 text-cyan-400">{stats.usados}</p>
        </div>
      </div>

      {/* RENDERIZADO DEL MAPA INTERACTIVO */}
      <div className="w-full">
        <TeatroMap 
          color="#10b981" 
          asientosSeleccionados={asientosSeleccionados} 
          setAsientosSeleccionados={setAsientosSeleccionados} 
        />
      </div>

      {/* PANEL DEL RESUMEN E INSERCIÓN */}
      <div className="max-w-xl mx-auto bg-slate-900 border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="text-center space-y-1">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-300">
            Confirmación de Registro
          </h2>
          <p className="text-xs text-gray-500">
            Se generará una transacción de compra individual por cada lugar seleccionado en el mapa de arriba.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <HiExclamationCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
          </div>
        )}

        <button
          type="button"
          disabled={isPending || asientosSeleccionados.length === 0}
          onClick={handleGenerarTokens}
          className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 disabled:from-slate-800 disabled:to-slate-800 text-black disabled:text-gray-500 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {isPending ? 'Emitiendo Credenciales...' : `Generar ${asientosSeleccionados.length} Token(s)`}
        </button>

        {mostrarExito && tokensGenerados.length > 0 && (
          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            <div className="flex items-center gap-2 text-emerald-400 border-b border-white/5 pb-2">
              <HiCheckCircle className="w-5 h-5" />
              <h4 className="text-xs font-black uppercase tracking-wider">¡Tokens autorizados con éxito!</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-center">
              {tokensGenerados.map((token, idx) => (
                <div key={idx} className="bg-slate-900 border border-white/5 rounded-lg py-2 text-xs font-bold text-white tracking-widest">
                  {token}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}