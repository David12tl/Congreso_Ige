'use client'

import { useState, useTransition } from 'react'
import { searchDocentes, generarTokenParaDocente } from './actions'
import { HiUserCircle, HiCheckCircle, HiExclamationCircle, HiTicket } from 'react-icons/hi'

interface Docente {
  buyer_id: string
  nombre: string
  email: string
  departamento: string
}

export default function GenerarGafetesDocentesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Docente[]>([])
  const [isSearching, startSearchTransition] = useTransition()
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; token?: string } | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    setResults([])
    if (!searchTerm.trim()) return

    startSearchTransition(async () => {
      const searchResults = await searchDocentes(searchTerm)
      if (searchResults.length === 0) {
        setFeedback({ type: 'error', message: 'No se encontraron docentes sin gafete con ese criterio.' })
      }
      setResults(searchResults as Docente[])
    })
  }

  const handleGenerateGafete = (docente: Docente) => {
    setGeneratingId(docente.buyer_id)
    setFeedback(null)

    startSearchTransition(async () => {
      const result = await generarTokenParaDocente(docente.buyer_id)
      if (result.success && result.token) {
        setFeedback({
          type: 'success',
          message: `Gafete generado para ${docente.nombre}.`,
          token: result.token,
        })
        // Eliminar al docente de la lista de resultados para no generarle otro token
        setResults(prev => prev.filter(d => d.buyer_id !== docente.buyer_id))
      } else {
        // Si el error es que el docente ya tiene un token, lo mostramos.
        if (result.message?.includes('ya tiene un token generado')) {
          setFeedback({ type: 'error', message: `Error: ${docente.nombre} ya tiene un token.`, token: result.token })
        } else {
          setFeedback({ type: 'error', message: result.message || 'Ocurrió un error inesperado.' })
        }
      }
      setGeneratingId(null)
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Generador de Gafetes para Docentes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Busca un docente registrado para generar su token de acceso como organizador.</p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o correo electrónico..."
            className="w-full bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E23]/50"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-2.5 bg-[#8B1E23] text-white font-semibold text-sm rounded-xl disabled:opacity-50 transition-all shadow-sm"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {feedback && (
          <div className={`mb-6 p-4 rounded-xl border ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <div className="flex items-start gap-3">
              {feedback.type === 'success' ? <HiCheckCircle className="w-5 h-5 text-emerald-500" /> : <HiExclamationCircle className="w-5 h-5 text-red-500" />}
              <div>
                <p className="font-semibold text-sm">{feedback.message}</p>
                {feedback.token && (
                  <div className="mt-2">
                    <p className="text-xs">Token de Acceso:</p>
                    <p className="font-mono font-bold text-lg tracking-widest">{feedback.token}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {isSearching && results.length === 0 && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8B1E23] mx-auto"></div>
            </div>
          )}

          {results.map((docente) => (
            <div key={docente.buyer_id} className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <HiUserCircle className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{docente.nombre}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{docente.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Departamento: {docente.departamento}</p>
                </div>
              </div>
              <button
                onClick={() => handleGenerateGafete(docente)}
                disabled={isSearching || generatingId === docente.buyer_id}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg disabled:opacity-60 transition"
              >
                {generatingId === docente.buyer_id ? (
                  'Generando...'
                ) : (
                  <>
                    <HiTicket className="w-4 h-4" />
                    Generar Gafete
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}