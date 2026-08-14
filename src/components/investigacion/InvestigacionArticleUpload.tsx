'use client'

import React, { useState, useTransition, useEffect, useRef } from 'react'
import { HiDocumentText, HiUpload, HiCheckCircle, HiExclamationCircle, HiCurrencyDollar } from 'react-icons/hi'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

interface ArticleSubmissionData {
  nombreAutor: string
  email: string
  telefono: string
  institucion: string
  tituloArticulo: string
  resumen: string
  archivo: File | null
  pdfUrl?: string
}

export function InvestigacionArticleUpload({ userId, userEmail }: { userId: string; userEmail: string }) {
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<'form' | 'success' | 'payment_success' | 'payment_cancelled'>('form')
  const [email, setEmail] = useState(userEmail || '')
  const [nombreAutor, setNombreAutor] = useState('')
  const [telefono, setTelefono] = useState('')
  const [institucion, setInstitucion] = useState('')
  const [tituloArticulo, setTituloArticulo] = useState('')
  const [resumen, setResumen] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const initializedRef = useRef(false)

  // Detectar parámetros de retorno de Stripe (solo una vez)
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const status = searchParams.get('status')
    if (status === 'success') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep('payment_success')
    } else if (status === 'cancelled') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep('payment_cancelled')
    }
  }, [searchParams])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type !== 'application/pdf') {
        setErrorMsg('Por favor selecciona un archivo en formato PDF.')
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMsg('El archivo no debe superar los 10 MB.')
        return
      }
      setErrorMsg(null)
      setArchivo(selectedFile)
      setFileName(selectedFile.name)
    }
  }

  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase()
  }

  const uploadPDFToStorage = async (file: File): Promise<{ url: string; path: string; error?: string }> => {
    try {
      const supabase = createClient()
      const timestamp = Date.now()
      const cleanFileName = sanitizeFileName(file.name)
      const filePath = `articulos_pdf/${timestamp}_${cleanFileName}`

      setUploadProgress('Subiendo PDF a almacenamiento seguro...')

      const { data, error } = await supabase.storage
        .from('articulos_pdf')
        .upload(filePath, file, {
          contentType: 'application/pdf',
          upsert: false,
        })

      if (error) {
        console.error('Error subiendo PDF:', error)
        return { url: '', path: '', error: error.message }
      }

      const { data: publicUrlData } = supabase.storage
        .from('articulos_pdf')
        .getPublicUrl(data.path)

      return {
        url: publicUrlData.publicUrl,
        path: data.path,
      }
    } catch (error) {
      console.error('Error en uploadPDFToStorage:', error)
      return {
        url: '',
        path: '',
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!archivo) {
      setErrorMsg('Debes adjuntar el archivo PDF de tu artículo de investigación.')
      return
    }

    startTransition(async () => {
      try {
        // 1. Subir PDF a Supabase Storage
        const uploadResult = await uploadPDFToStorage(archivo)
        if (uploadResult.error) {
          setErrorMsg(`Error al subir el PDF: ${uploadResult.error}`)
          setUploadProgress('')
          return
        }

        setUploadProgress('Registrando información y preparando pago...')

        // 2. Enviar datos al endpoint de Stripe Checkout
        const payload: ArticleSubmissionData = {
          nombreAutor: nombreAutor.trim(),
          email: email.trim(),
          telefono: telefono.trim(),
          institucion: institucion.trim(),
          tituloArticulo: tituloArticulo.trim(),
          resumen: resumen.trim(),
          archivo: archivo,
          pdfUrl: uploadResult.url,
        }

        const response = await fetch('/api/checkout-investigacion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al procesar la solicitud')
        }

        const data = await response.json()

        // 3. Redirigir al usuario a la pasarela de Stripe
        setUploadProgress('')
        window.location.href = data.url
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Error al procesar la solicitud. Intenta de nuevo.')
        setUploadProgress('')
      }
    })
  }

  const resetForm = () => {
    setStep('form')
    setNombreAutor('')
    setTelefono('')
    setInstitucion('')
    setTituloArticulo('')
    setResumen('')
    setArchivo(null)
    setFileName('')
    setErrorMsg(null)
    setUploadProgress('')
  }

  if (step === 'payment_success') {
    return (
      <div className="max-w-2xl mx-auto animate-fadeIn">
        <div className="bg-white rounded-3xl border border-[#cbd5e1] shadow-lg p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiCheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-[#0f172a] mb-3">¡Pago Exitoso!</h2>
          <p className="text-sm text-[#475569] mb-2">
            Tu artículo de investigación ha sido registrado y tu pago de $600 MXN ha sido procesado exitosamente.
          </p>
          <p className="text-xs text-[#475569] mb-6">
            Recibirás un correo de confirmación con los detalles de tu envío y la información del pago.
          </p>
          <button
            onClick={resetForm}
            className="px-6 py-3 bg-[#1e3a8a] hover:bg-[#172554] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            Registrar Otro Artículo
          </button>
        </div>
      </div>
    )
  }

  if (step === 'payment_cancelled') {
    return (
      <div className="max-w-2xl mx-auto animate-fadeIn">
        <div className="bg-white rounded-3xl border border-[#cbd5e1] shadow-lg p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiExclamationCircle className="w-12 h-12 text-amber-600" />
          </div>
          <h2 className="text-3xl font-black text-[#0f172a] mb-3">Pago Cancelado</h2>
          <p className="text-sm text-[#475569] mb-2">
            Tu transacción ha sido cancelada. Puedes intentar nuevamente cuando estés listo.
          </p>
          <p className="text-xs text-[#475569] mb-6">
            Si tienes preguntas, no dudes en contactarnos.
          </p>
          <button
            onClick={resetForm}
            className="px-6 py-3 bg-[#1e3a8a] hover:bg-[#172554] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            Intentar Nuevamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      {/* Costo Destacado */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
        <HiCurrencyDollar className="w-6 h-6 text-amber-700 shrink-0" />
        <div>
          <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Costo de Publicación</p>
          <p className="text-lg font-black text-amber-700">$600 MXN</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos del Formulario */}
        <div className="bg-white rounded-3xl border border-[#cbd5e1] shadow-sm p-6 md:p-8 space-y-5">
          <h3 className="text-lg font-black text-[#0f172a] uppercase tracking-wider border-b-2 border-[#1e3a8a] pb-2">
            Información del Autor
          </h3>

          <div>
            <label htmlFor="nombreAutor" className="block text-[10px] text-[#475569] uppercase tracking-widest font-bold mb-1.5">
              Nombre Completo <span className="text-[#7f1d1d]">*</span>
            </label>
            <input
              id="nombreAutor"
              type="text"
              value={nombreAutor}
              onChange={(e) => setNombreAutor(e.target.value)}
              required
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-sm text-[#0f172a] focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none"
              placeholder="Nombre completo del autor"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-[10px] text-[#475569] uppercase tracking-widest font-bold mb-1.5">
              Correo Electrónico <span className="text-[#7f1d1d]">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-sm text-[#0f172a] focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label htmlFor="telefono" className="block text-[10px] text-[#475569] uppercase tracking-widest font-bold mb-1.5">
              Teléfono <span className="text-[#7f1d1d]">*</span>
            </label>
            <input
              id="telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-sm text-[#0f172a] focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none"
              placeholder="Teléfono de contacto"
            />
          </div>

          <div>
            <label htmlFor="institucion" className="block text-[10px] text-[#475569] uppercase tracking-widest font-bold mb-1.5">
              Institución <span className="text-[#7f1d1d]">*</span>
            </label>
            <input
              id="institucion"
              type="text"
              value={institucion}
              onChange={(e) => setInstitucion(e.target.value)}
              required
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-sm text-[#0f172a] focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none"
              placeholder="Institución académica o de procedencia"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#cbd5e1] shadow-sm p-6 md:p-8 space-y-5">
          <h3 className="text-lg font-black text-[#0f172a] uppercase tracking-wider border-b-2 border-[#1e3a8a] pb-2">
            Datos del Artículo
          </h3>

          <div>
            <label htmlFor="tituloArticulo" className="block text-[10px] text-[#475569] uppercase tracking-widest font-bold mb-1.5">
              Título del Artículo <span className="text-[#7f1d1d]">*</span>
            </label>
            <input
              id="tituloArticulo"
              type="text"
              value={tituloArticulo}
              onChange={(e) => setTituloArticulo(e.target.value)}
              required
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-sm text-[#0f172a] focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none"
              placeholder="Título completo del artículo"
            />
          </div>

          <div>
            <label htmlFor="resumen" className="block text-[10px] text-[#475569] uppercase tracking-widest font-bold mb-1.5">
              Resumen <span className="text-[#7f1d1d]">*</span>
            </label>
            <textarea
              id="resumen"
              value={resumen}
              onChange={(e) => setResumen(e.target.value)}
              required
              rows={4}
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-sm text-[#0f172a] focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none resize-none"
              placeholder="Resumen breve del artículo de investigación"
            />
          </div>

          <div>
            <label htmlFor="archivo" className="block text-[10px] text-[#475569] uppercase tracking-widest font-bold mb-1.5">
              Archivo PDF del Artículo <span className="text-[#7f1d1d]">*</span>
            </label>
            <div className="relative">
              <input
                id="archivo"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <label
                htmlFor="archivo"
                className="flex items-center justify-center gap-2 w-full bg-[#f8fafc] border-2 border-dashed border-[#cbd5e1] rounded-xl px-4 py-6 cursor-pointer hover:border-[#1e3a8a] transition-colors"
              >
                <HiUpload className="w-6 h-6 text-[#1e3a8a]" />
                <span className="text-sm text-[#475569]">
                  {fileName ? fileName : 'Haz clic para seleccionar tu archivo PDF (máx. 10 MB)'}
                </span>
              </label>
            </div>
            {fileName && (
              <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1">
                <HiDocumentText className="w-3 h-3" />
                Archivo seleccionado: {fileName}
              </p>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="bg-[#fef2f2] border border-[#fecaca] rounded-2xl p-4 flex items-start gap-3">
            <HiExclamationCircle className="w-5 h-5 text-[#7f1d1d] shrink-0 mt-0.5" />
            <p className="text-sm text-[#7f1d1d] font-medium">{errorMsg}</p>
          </div>
        )}

        {uploadProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin shrink-0" />
            <p className="text-sm text-blue-700 font-medium">{uploadProgress}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#1e3a8a] hover:bg-[#172554] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <HiDocumentText className="w-5 h-5" />
              Registrar y Pagar $600 MXN
            </>
          )}
        </button>
      </form>
    </div>
  )
}