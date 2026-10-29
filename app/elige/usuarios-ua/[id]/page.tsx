'use client'

import React, { useEffect, useState, useMemo, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  HiOutlineFolderOpen, 
  HiOutlineArrowLeft, 
  HiOutlineCheck, 
  HiOutlineX, 
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineClock
} from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'
import { 
  obtenerComprobantesPorUsuario, 
  cambiarEstadoComprobante,
  ComprobanteItem 
} from '../../../../src/hooks/adminVoucherActions'
import { createClient } from '@/lib/supabase/client'

interface Comprobante {
  id: string
  matricula: string
  file_url: string
  file_path?: string
  ruta_archivo: string
  signedUrl: string | null
  estado: string
  created_at: string | null
  profile_id: string
}

export default function DetalleUsuarioVouchersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(params)
  const supabase = useMemo(() => createClient(), [])
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Resuelve las URLs firmadas utilizando el cliente Supabase para cada comprobante
  const resolverComprobantesConSignedUrls = async (items: ComprobanteItem[]): Promise<Comprobante[]> => {
    return Promise.all(
      items.map(async (comp) => {
        const rawPath = comp.ruta_archivo || comp.file_path || comp.file_url || ''
        let cleanPath = rawPath.trim()
        if (cleanPath.includes('/vouchers/')) {
          cleanPath = cleanPath.split('/vouchers/').pop() || cleanPath
        } else if (cleanPath.startsWith('vouchers/')) {
          cleanPath = cleanPath.replace(/^vouchers\//, '')
        }
        cleanPath = cleanPath.split('?')[0]

        let signedUrl = comp.signedUrl

        try {
          if (cleanPath) {
            const { data: signData, error: signError } = await supabase.storage
              .from('vouchers')
              .createSignedUrl(cleanPath, 3600)

            if (signError) {
              console.error(`[Cliente Admin] Error en createSignedUrl para ruta_archivo "${cleanPath}":`, signError.message)
            } else if (signData?.signedUrl) {
              signedUrl = signData.signedUrl
            }
          }
        } catch (err) {
          console.error(`[Cliente Admin] Excepción obteniendo signedUrl para "${cleanPath}":`, err)
        }

        console.log(`[Cliente Admin Voucher] ruta_archivo: "${cleanPath}", signedUrl: "${signedUrl ?? 'NO_URL'}"`)

        return {
          ...comp,
          ruta_archivo: cleanPath,
          signedUrl: signedUrl || comp.file_url
        }
      })
    )
  }

  useEffect(() => {
    let isMounted = true

    const cargarDatosIniciales = async () => {
      const data = await obtenerComprobantesPorUsuario(userId)
      const conUrls = await resolverComprobantesConSignedUrls(data)
      if (isMounted) {
        setComprobantes(conUrls)
        setLoading(false)
      }
    }

    cargarDatosIniciales()

    return () => {
      isMounted = false
    }
  }, [userId])

  const handleEstado = async (comprobanteId: string, nuevoEstado: 'aprobado' | 'rechazado') => {
    setUpdatingId(comprobanteId)
    const res = await cambiarEstadoComprobante(comprobanteId, nuevoEstado, userId)
    if (res.success) {
      const dataActualizada = await obtenerComprobantesPorUsuario(userId)
      const conUrls = await resolverComprobantesConSignedUrls(dataActualizada)
      setComprobantes(conUrls)
    }
    setUpdatingId(null)
  }

  const matricula = comprobantes[0]?.matricula || 'Alumno'

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-[#1e3a8a] rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Cargando expediente...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-900 dark:text-slate-100">
      
      {/* Regresar a la lista */}
      <div className="flex items-center justify-between">
        <Link 
          href="/elige/usuarios-ua"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold uppercase tracking-wider transition-all"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Volver a Usuarios
        </Link>
      </div>

      {/* Encabezado con icono de Carpeta Abierta */}
      <GlassCard className="p-6 bg-white dark:bg-[#2a2a2f] border border-slate-200 dark:border-slate-700" glowColor="cyan">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20 shadow-sm">
            <HiOutlineFolderOpen className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Expediente: <span className="text-[#1e3a8a] dark:text-blue-400">{matricula}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              ID Usuario: {userId} • {comprobantes.length} comprobante(s) registrado(s)
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Galería de tarjetas */}
      {comprobantes.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#2a2a2f] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-sm text-slate-400 italic">Esta carpeta no contiene comprobantes subidos aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {comprobantes.map((comp) => {
            const isPdf = comp.ruta_archivo.toLowerCase().endsWith('.pdf') || comp.file_url.toLowerCase().includes('.pdf')
            const srcUrl = comp.signedUrl || comp.file_url

            return (
              <GlassCard 
                key={comp.id} 
                className="p-4 bg-white dark:bg-[#2a2a2f] border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                glowColor={comp.estado === 'aprobado' ? 'emerald' : comp.estado === 'rechazado' ? 'amber' : 'purple'}
              >
                <div>
                  {/* Previsualización */}
                  {isPdf ? (
                    <div className="w-full h-44 bg-red-50 dark:bg-red-950/30 rounded-xl flex flex-col items-center justify-center text-red-600 border border-red-200 dark:border-red-900/50 p-4 text-center">
                      <HiOutlineDocumentText className="w-12 h-12 mb-2" />
                      <span className="text-xs font-bold">Documento PDF</span>
                      <a
                        href={srcUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                      >
                        <HiOutlineEye className="w-4 h-4" /> Abrir PDF
                      </a>
                    </div>
                  ) : (
                    <div className="w-full h-44 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800">
                      <Image 
                        src={srcUrl} 
                        alt="Voucher de pago" 
                        fill 
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                      <button 
                        type="button"
                        onClick={() => setPreviewUrl(srcUrl)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold text-xs gap-1 cursor-pointer"
                      >
                        <HiOutlineEye className="w-5 h-5" /> Ampliar
                      </button>
                    </div>
                  )}

                  {/* Estatus y Fecha */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      comp.estado === 'aprobado'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                        : comp.estado === 'rechazado'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                    }`}>
                      <HiOutlineClock className="w-3 h-3" />
                      {comp.estado}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {comp.created_at ? new Date(comp.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleEstado(comp.id, 'aprobado')}
                    disabled={updatingId === comp.id || comp.estado === 'aprobado'}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <HiOutlineCheck className="w-4 h-4" />
                    Aprobar
                  </button>

                  <button
                    onClick={() => handleEstado(comp.id, 'rechazado')}
                    disabled={updatingId === comp.id || comp.estado === 'rechazado'}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <HiOutlineX className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}

      {/* Modal de Imagen Ampliada */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full rounded-2xl overflow-hidden flex items-center justify-center">
            <Image 
              src={previewUrl} 
              alt="Vista ampliada" 
              fill 
              unoptimized
              className="object-contain" 
            />
          </div>
        </div>
      )}

    </div>
  )
}
