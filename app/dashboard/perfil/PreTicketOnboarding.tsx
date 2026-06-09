'use client'

import React, { useState, useTransition } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { HiUser, HiOfficeBuilding, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'

export function PreTicketOnboarding({ userId, userEmail }: { userId: string; userEmail: string }) {
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  
  const [step, setStep] = useState<'selection' | 'form' | 'success'>('selection')
  const [type, setType] = useState<'alumno' | 'empresa'>('alumno')

  // Estados del Formulario
  const [nombre, setNombre] = useState('')
  const [matricula, setMatricula] = useState('')
  const [carrera, setCarrera] = useState('')
  const [semestre, setSemestre] = useState('')
  const [empresa, setEmpresa] = useState('') // Escuela / Organización
  const [telefono, setTelefono] = useState('')

  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!nombre.trim()) {
      setErrorMsg('El nombre es obligatorio.')
      return
    }

    startTransition(async () => {
      // 1. Estructuramos la data exactamente como la necesita la BD
      const payload = {
        buyer_id: userId,
        email: userEmail,
        type: type,
        nombre: nombre.trim(),
        telefono: telefono.trim() || null,
        estatus_pago: 'pending', 
        matricula: type === 'alumno' ? matricula.trim() : null,
        carrera: type === 'alumno' ? carrera.trim() : null,
        semestre: type === 'alumno' ? semestre.trim() : null,
        empresa: type === 'empresa' ? empresa.trim() : null,
      }

      // 2. Relajamos el tipado de la tabla para que acepte 'estatus_pago' como string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ticketsTable = supabase.from('tickets') as any

      // 3. Insertamos de forma segura
      const { error } = await ticketsTable.insert([payload])

      if (error) {
        console.error(error)
        setErrorMsg('Error al procesar tu pre-registro. Es posible que ya tengas un ticket asignado.')
      } else {
        setStep('success')
      }
    })
  }

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 text-center text-white shadow-xl">
        <HiCheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-base font-black uppercase tracking-wider text-emerald-400">¡Pre-registro Exitoso!</h3>
        <p className="text-xs text-gray-400 mt-2">
          Tus datos se enviaron a la lista de espera de <span className="text-white font-bold">/dashboard/mi-ua</span>.
        </p>
        <p className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mt-4">
          Por favor acude a la taquilla física o con el encargado de tu unidad para seleccionar tu asiento y realizar tu pago.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-white/10 rounded-2xl p-6 text-white shadow-xl">
      {step === 'selection' ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-emerald-400">Tipo de Asistente</h2>
            <p className="text-xs text-gray-400 mt-1">Selecciona tu perfil para iniciar tu registro al evento</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setType('alumno'); setStep('form') }}
              className="flex flex-col items-center justify-center p-5 bg-slate-950 border border-white/5 hover:border-emerald-500/50 rounded-xl transition group text-center"
            >
              <HiUser className="w-8 h-8 text-slate-400 group-hover:text-emerald-400 transition mb-2" />
              <span className="text-xs font-bold text-white block">Comunidad Interna</span>
              <span className="text-[10px] text-gray-500 mt-0.5">(Alumnos / Docentes)</span>
            </button>

            <button
              onClick={() => { setType('empresa'); setStep('form') }}
              className="flex flex-col items-center justify-center p-5 bg-slate-950 border border-white/5 hover:border-cyan-500/50 rounded-xl transition group text-center"
            >
              <HiOfficeBuilding className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 transition mb-2" />
              <span className="text-xs font-bold text-white block">Externos</span>
              <span className="text-[10px] text-gray-500 mt-0.5">(Escuelas / Empresas)</span>
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-2">
            <h3 className="font-black uppercase tracking-wider text-emerald-400">
              Pre-Registro: {type === 'alumno' ? 'Interno' : 'Externo'}
            </h3>
            <button
              type="button"
              onClick={() => setStep('selection')}
              className="text-[10px] text-gray-400 hover:underline"
            >
              Cambiar tipo
            </button>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-[11px]">
              <HiExclamationCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Campo Común: Nombre */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              placeholder="Ej. Juan Pérez López"
            />
          </div>

          {/* Campos condicionales para INTERNOS (Alumnos) */}
          {type === 'alumno' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Matrícula</label>
                  <input
                    type="text"
                    required
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Matrícula escolar"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="10 dígitos"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Carrera</label>
                  <input
                    type="text"
                    required
                    value={carrera}
                    onChange={(e) => setCarrera(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Ej. Ing. Sistemas"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Semestre</label>
                  <input
                    type="text"
                    required
                    value={semestre}
                    onChange={(e) => setSemestre(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Ej. 6to"
                  />
                </div>
              </div>
            </>
          )}

          {/* Campos condicionales para EXTERNOS (Empresas/Escuelas externas) */}
          {type === 'empresa' && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Institución / Escuela u Organización</label>
                <input
                  type="text"
                  required
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Nombre de la escuela o empresa de procedencia"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Teléfono de Contacto</label>
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Número a 10 dígitos"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-black uppercase tracking-widest py-3 disabled:opacity-50 transition-all shadow-lg"
          >
            {isPending ? 'Procesando...' : 'Completar Pre-Registro'}
          </button>
        </form>
      )}
    </div>
  )
}