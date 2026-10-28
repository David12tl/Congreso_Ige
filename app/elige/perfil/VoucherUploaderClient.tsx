'use client'

import React, { useState, useTransition } from 'react'
import { HiOutlineCloudUpload, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'
import { subirVoucherAccion } from './VoucherUploader'
import { GlassCard } from '@/components/ui/GlassCard'

interface VoucherUploaderProps {
  userId: string
  matricula: string
}

export function VoucherUploader({ userId, matricula }: VoucherUploaderProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('idle')
    setMessage('')

    const formData = new FormData(e.currentTarget as HTMLFormElement)
    formData.append('userId', userId)
    formData.append('matricula', matricula)

    startTransition(async () => {
      const result = await subirVoucherAccion(formData)
      if (result.success) {
        setStatus('success')
        setMessage(result.message)
        ;(e.currentTarget as HTMLFormElement).reset()
      } else {
        setStatus('error')
        setMessage(result.message)
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
          <label className="text-xs font-semibold text-[#475569] dark:text-slate-400 uppercase tracking-widest">
            Seleccionar archivo (JPG, PNG, PDF)
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            required
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
