'use client'

import React, { useState, useEffect, useTransition, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/src/lib/supabase/client' 
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'

const TeatroMap = dynamic(() => import('../../../src/components/ui/MapaTeatro'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-900 animate-pulse rounded-xl" />
})

interface PurchaseInsert {
  stripe_session_id: string;
  total: number;
  status: string;
}

// 🌟 Interfaz corregida con nombres estándar de columnas para Supabase
interface TokenInsert {
  token_code: string;
  event_id: string; 
  zone_id: string;  
  creado_por: string; // Asegúrate de que en Postgres se llame exactamente 'creado_por'
  status: string;
  total_abonado: number; 
  estado_pago: 'sin_pago' | 'faltante' | 'completado'; 
  created_at?: string;
}

interface TicketRecord {
  zone_id?: string;
  event_id?: string;
  name?: string;
}

export default function GeneradorTokensPage() {
  const supabase = useMemo(() => createClient(), [])
  const [isPending, startTransition] = useTransition()

  // Estado compartido con el mapa interactivo
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<string[]>([]) 
  const [stats, setStats] = useState({ total: 0, disponibles: 0, usados: 0 })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [tokensGenerados, setTokensGenerados] = useState<string[]>([])
  const [mostrarExito, setMostrarExito] = useState(false)

  // Estado: Monto total que el usuario desea abonar en caja
  const [montoAbonoGlobal, setMontoAbonoGlobal] = useState<number>(0)
  const PRECIO_POR_BOLETO = 650

  // Calcular costo total teórico
  const costoTotalTeorico = asientosSeleccionados.length * PRECIO_POR_BOLETO

  // Función auxiliar para determinar el estado de pago individual por asiento
  const calcularEstadoPagoIndividual = (abonoPorAsiento: number) => {
    if (abonoPorAsiento <= 0) return 'sin_pago';
    if (abonoPorAsiento >= PRECIO_POR_BOLETO) return 'completado';
    return 'faltante';
  }

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
    const initFetch = async () => {
      await cargarEstadisticas()
    }
    initFetch()
  }, [cargarEstadisticas])

  // FUNCIÓN PRINCIPAL CORREGIDA
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

        // 2. RECOLECTOR DE IDS REALES
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
          .select('zone_id, event_id, name')
          .limit(1)

        if (errorTickets) {
          console.warn('Advertencia en tabla tickets (esperado en desarrollo):', errorTickets.message)
        }

        const filasPurchasesAInsertar: PurchaseInsert[] = []
        const mapaTokenAData: Record<string, { zone_id: string; event_id: string }> = {}
        const nuevosCodigos: string[] = []

        // 4. Mapeo seguro utilizando los IDs existentes de tu Postgres
        const ticketsConsultados = (dataTickets || []) as TicketRecord[]
        
        const registrosAProcesar = ticketsConsultados.length > 0 
          ? ticketsConsultados 
          : asientosSeleccionados.map((idString) => ({
              name: idString,
              zone_id: ID_ZONA_REAL_RESPALDO, 
              event_id: ID_EVENTO_REAL_RESPALDO 
            }))

        const cantidadAsientos = registrosAProcesar.length
        const abonoPorCadaAsiento = cantidadAsientos > 0 ? (montoAbonoGlobal / cantidadAsientos) : 0
        const estadoDePagoCalculado = calcularEstadoPagoIndividual(abonoPorCadaAsiento)

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
            total: abonoPorCadaAsiento, 
            status: estadoDePagoCalculado === 'completado' ? 'completed' : 'pending'
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
            creado_por: creadoPorUuid, // 🌟 Coincide exactamente con la interfaz y tu tipado de tabla
            status: 'disponible',
            total_abonado: abonoPorCadaAsiento,    
            estado_pago: estadoDePagoCalculado,   
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

        // 7. Éxito absoluto y reseteo de campos
        setTokensGenerados(nuevosCodigos)
        setMostrarExito(true)
        setAsientosSeleccionados([]) 
        setMontoAbonoGlobal(0) 
        await cargarEstadisticas() 

      } catch (err) {
        console.error('Error general capturado:', err)
        setErrorMsg('Ocurrió un error inesperado al procesar la solicitud.')
      }
    })
  }

  const obtenerVisualBadgeStatus = () => {
    if (asientosSeleccionados.length === 0) return { texto: 'ESPERANDO LUGARES', clase: 'bg-slate-800 text-slate-400 border-slate-700/50' };
    if (montoAbonoGlobal <= 0) return { texto: 'SIN PAGO', clase: 'bg-red-500/10 text-red-400 border-red-500/20' };
    if (montoAbonoGlobal >= costoTotalTeorico) return { texto: 'COMPLETADO', clase: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    return { texto: 'PAGO FALTANTE (ANTICIPO)', clase: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  }

  const badgeVisual = obtenerVisualBadgeStatus();

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
            eventId={stats.total > 0 ? "" : "evento-default"} // 🌟 Si tienes una variable con el ID del evento o la consulta de arriba, pásala aquí
          />
        </div>

      {/* PANEL DEL RESUMEN E INSERCIÓN */}
      <div className="max-w-xl mx-auto bg-slate-900 border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="text-center space-y-1 border-b border-white/5 pb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-300">
            Confirmación de Registro y Caja
          </h2>
          <p className="text-xs text-gray-500">
            Cada boleto por asiento seleccionado tiene un valor estándar de <span className="text-white font-bold">$650.00 MXN</span>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-white/5 text-xs">
          <div>
            <span className="text-gray-400 block">Asientos marcados:</span>
            <span className="text-sm font-black text-white">{asientosSeleccionados.length} u.</span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 block">Total a liquidar:</span>
            <span className="text-sm font-black text-emerald-400">${costoTotalTeorico.toFixed(2)} MXN</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="monto_abonado" className="text-xs font-bold text-gray-300 tracking-wide">
            Monto total recibido en caja para esta operación ($):
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-gray-500 font-bold text-sm">$</span>
            <input 
              id="monto_abonado"
              type="number"
              min="0"
              step="0.01"
              disabled={asientosSeleccionados.length === 0}
              value={montoAbonoGlobal === 0 ? '' : montoAbonoGlobal}
              onChange={(e) => setMontoAbonoGlobal(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              placeholder="Ingresa la cantidad que abona el cliente (Ej. 0, 300, 1300...)"
            />
          </div>
        </div>

        <div className="flex justify-between items-center bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
          <div className="flex flex-col text-xs">
            <span className="text-gray-400 font-medium">Estatus resultante de la emisión</span>
            {montoAbonoGlobal > 0 && montoAbonoGlobal < costoTotalTeorico && (
              <span className="text-[10px] text-amber-400/90 mt-0.5 font-mono">
                Deuda restante en sistema: ${(costoTotalTeorico - montoAbonoGlobal).toFixed(2)} MXN
              </span>
            )}
          </div>
          <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full border ${badgeVisual.clase}`}>
            {badgeVisual.texto}
          </span>
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