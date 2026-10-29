'use client'

import React, { useState, useTransition } from 'react'
import { HiOutlineCloudUpload, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'
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
  const [message, setMessage] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      setStatus('error')
      setMessage(`El archivo seleccionado es muy pesado (${fileSizeMB} MB). El tamaño máximo permitido es de 4.5 MB.`)
      e.target.value = '' // Cancelar y limpiar selección
      return
    }

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

    const form = e.currentTarget
    const formData = new FormData(form)

    // Garantizar que userId y matricula siempre viajen en el FormData
    formData.set('userId', userId)
    formData.set('matricula', matricula)

    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement | null
    const selectedFile = fileInput?.files?.[0]

    if (!selectedFile || selectedFile.size === 0) {
      setStatus('error')
      setMessage('Por favor, selecciona un archivo válido antes de enviar.')
      return
    }

    // Validación de tamaño máximo (4.5 MB) previo al envío
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2)
      setStatus('error')
      setMessage(`El archivo seleccionado es muy pesado (${fileSizeMB} MB). El tamaño máximo permitido es de 4.5 MB.`)
      return
    }

    // Agregar explícitamente el archivo bajo 'archivo' y 'file' para máxima compatibilidad
    formData.set('archivo', selectedFile)
    formData.set('file', selectedFile)

    startTransition(async () => {
      const result = await subirVoucherAccion(formData)
      if (result.success) {
        setStatus('success')
        setMessage(result.message || 'Comprobante de pago subido correctamente.')
        form.reset()
      } else {
        setStatus('error')
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor="archivo" className="text-xs font-semibold text-[#475569] dark:text-slate-400 uppercase tracking-widest">
            Seleccionar archivo (JPG, PNG, PDF - Máx. 4.5 MB)
          </label>
          <input
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
            className="w-full mt-2 rounded-xl bg-[#1e3a8a] text-white font-semibold text-sm px-6 py-3 disabled:opacity-50 transition-all shadow-sm hover:bg-[#1e3a8a]/90"
          >
            {isPending ? 'Subiendo...' : 'Subir Comprobante'}
          </button>
        </form>

        {status !== 'idle' && (
          <div
            className={`mt-3 rounded-xl px-4 py-2 text-sm font-medium border ${
              status === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {status === 'success' ? (
                <HiCheckCircle className="w-4 h-4" />
              ) : (
                <HiExclamationCircle className="w-4 h-4" />
              )}
              <span>{message}</span>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
