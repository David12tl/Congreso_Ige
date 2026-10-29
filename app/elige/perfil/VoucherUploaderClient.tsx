'use client'

import React, { useState, useRef, useTransition } from 'react'
import { 
  HiOutlineCloudUpload, 
  HiCheckCircle, 
  HiExclamationCircle, 
  HiOutlineRefresh 
} from 'react-icons/hi'
import { subirVoucherAccion } from './VoucherUploader'
import { GlassCard } from '@/components/ui/GlassCard'

const MAX_FILE_SIZE_BYTES = 4_718_592 // 4.5 MB

interface VoucherUploaderProps {
  userId: string
  matricula: string
}

export function VoucherUploader({ userId, matricula }: VoucherUploaderProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [subidoExitosamente, setSubidoExitosamente] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const formRef = useRef<HTMLFormElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleReset = () => {
    setSubidoExitosamente(false)
    setStatus('idle')
    setMessage('')
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (formRef.current) {
      formRef.current.reset()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) {
      setSelectedFile(null)
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      setStatus('error')
      setMessage(`El archivo seleccionado es muy pesado (${fileSizeMB} MB). El tamaño máximo permitido es de 4.5 MB.`)
      e.target.value = '' // Cancelar y limpiar selección
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    // Limpiar alertas de error previas si el archivo ahora es válido
    if (status === 'error') {
      setStatus('idle')
      setMessage('')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('idle')
    setMessage('')

    if (!userId || userId.trim() === '') {
      setStatus('error')
      setMessage('Error: No se encontró el identificador del usuario (userId).')
      return
    }

    if (!matricula || matricula.trim() === '') {
      setStatus('error')
      setMessage('Error: No se encontró la matrícula del usuario.')
      return
    }

    const fileToUpload = selectedFile || fileInputRef.current?.files?.[0]

    if (!fileToUpload || fileToUpload.size === 0) {
      setStatus('error')
      setMessage('Por favor, selecciona un archivo válido antes de enviar.')
      return
    }

    // Validación de tamaño máximo (4.5 MB) previo al envío
    if (fileToUpload.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMB = (fileToUpload.size / (1024 * 1024)).toFixed(2)
      setStatus('error')
      setMessage(`El archivo seleccionado es muy pesado (${fileSizeMB} MB). El tamaño máximo permitido es de 4.5 MB.`)
      return
    }

    const formData = new FormData()
    formData.set('userId', userId)
    formData.set('matricula', matricula)
    formData.set('archivo', fileToUpload)
    formData.set('file', fileToUpload)

    startTransition(async () => {
      const result = await subirVoucherAccion(formData)
      if (result.success) {
        setStatus('success')
        setSubidoExitosamente(true)
        setMessage(result.message || 'Comprobante de pago subido correctamente.')
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        if (formRef.current) {
          formRef.current.reset()
        }
      } else {
        setStatus('error')
        setSubidoExitosamente(false)
        setMessage(result.error || result.message || 'Error al procesar el comprobante.')
      }
    })
  }

  return (
    <GlassCard className="p-6 bg-white dark:bg-[#2a2a2f] border border-[#cbd5e1] dark:border-slate-700 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <HiOutlineCloudUpload className="w-5 h-5 text-[#1e3a8a]" />
          <h3 className="text-sm font-bold text-[#0f172a] dark:text-white uppercase tracking-wider">
            Comprobante de Pago
          </h3>
        </div>

        {subidoExitosamente ? (
          <div className="flex flex-col gap-4 py-2 animate-fadeIn">
            <div className="rounded-xl px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 flex items-start gap-3">
              <HiCheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{message || 'Comprobante de pago subido correctamente.'}</p>
                <p className="text-xs text-green-600 dark:text-green-400/80 mt-1">
                  Tu comprobante ha sido registrado y está en revisión para validación.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm px-6 py-3 transition-all border border-slate-300 dark:border-slate-600 shadow-sm cursor-pointer"
            >
              <HiOutlineRefresh className="w-4 h-4" />
              Subir otro comprobante
            </button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label htmlFor="archivo" className="text-xs font-semibold text-[#475569] dark:text-slate-400 uppercase tracking-widest">
              Seleccionar archivo (JPG, PNG, PDF - Máx. 4.5 MB)
            </label>
            <input
              ref={fileInputRef}
              id="archivo"
              name="archivo"
              type="file"
              accept="image/*,application/pdf"
              required
              onChange={handleFileChange}
              className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 rounded-xl bg-[#1e3a8a] text-white font-semibold text-sm px-6 py-3 disabled:opacity-50 transition-all shadow-sm hover:bg-[#1e3a8a]/90 cursor-pointer"
            >
              {isPending ? 'Subiendo...' : 'Subir Comprobante'}
            </button>
          </form>
        )}

        {!subidoExitosamente && status === 'error' && (
          <div className="mt-2 rounded-xl px-4 py-2 text-sm font-medium border bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800">
            <div className="flex items-center gap-2">
              <HiExclamationCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
