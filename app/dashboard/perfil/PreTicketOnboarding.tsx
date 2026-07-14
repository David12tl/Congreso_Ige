'use client'

import React, { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
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
        setErrorMsg('Error al procesar tu pre-registro. Es posible que ya tengas un ticket asignado.')
      } else {
        setStep('success')
      }
    })
  }

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white border border-emerald-200 rounded-[24px] p-6 text-center text-[#0f172a] shadow-sm">
        <HiCheckCircle className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
        <h3 className="text-base font-black uppercase tracking-wider text-emerald-700">¡Pre-registro Exitoso!</h3>
        <p className="text-xs text-slate-500 mt-2 font-light">
          Tus datos se enviaron a la lista de espera de <span className="text-[#0f172a] font-bold">/dashboard/mi-ua</span>.
        </p>
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-xl mt-4 font-light">
          Por favor acude a la taquilla física o con el encargado de tu unidad para seleccionar tu asiento y realizar tu pago.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-[24px] p-6 text-[#0f172a] shadow-sm">
      {step === 'selection' ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-emerald-700">Tipo de Asistente</h2>
            <p className="text-xs text-slate-500 mt-1 font-light">Selecciona tu perfil para iniciar tu registro al evento</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setType('alumno'); setStep('form') }}
              className="flex flex-col items-center justify-center p-5 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-xl transition group text-center"
            >
              <HiUser className="w-8 h-8 text-slate-400 group-hover:text-emerald-700 transition mb-2" />
              <span className="text-xs font-bold text-slate-700 block">Comunidad Interna</span>
              <span className="text-[10px] text-slate-500 mt-0.5 font-light">(Alumnos / Docentes)</span>
            </button>

            <button
              onClick={() => { setType('empresa'); setStep('form') }}
              className="flex flex-col items-center justify-center p-5 bg-slate-50 border border-slate-200 hover:border-cyan-500 rounded-xl transition group text-center"
            >
              <HiOfficeBuilding className="w-8 h-8 text-slate-400 group-hover:text-cyan-700 transition mb-2" />
              <span className="text-xs font-bold text-slate-700 block">Externos</span>
              <span className="text-[10px] text-slate-500 mt-0.5 font-light">(Escuelas / Empresas)</span>
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-2">
            <h3 className="font-black uppercase tracking-wider text-emerald-700">
              Pre-Registro: {type === 'alumno' ? 'Interno' : 'Externo'}
            </h3>
            <button
              type="button"
              onClick={() => setStep('selection')}
              className="text-[10px] text-slate-500 hover:underline font-light"
            >
              Cambiar tipo
            </button>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-[11px] font-light">
              <HiExclamationCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Campo Común: Nombre */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-light"
              placeholder="Ej. Juan Pérez López"
            />
          </div>

          {/* Campos condicionales para INTERNOS (Alumnos) */}
          {type === 'alumno' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Matrícula</label>
                  <input
                    type="text"
                    required
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-light"
                    placeholder="Matrícula escolar"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-light"
                    placeholder="10 dígitos"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Carrera</label>
                  <input
                    type="text"
                    required
                    value={carrera}
                    onChange={(e) => setCarrera(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-light"
                    placeholder="Ej. Ing. Sistemas"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Semestre</label>
                  <input
                    type="text"
                    required
                    value={semestre}
                    onChange={(e) => setSemestre(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-light"
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
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Institución / Escuela u Organización</label>
                <input
                  type="text"
                  required
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all font-light"
                  placeholder="Nombre de la escuela o empresa de procedencia"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Teléfono de Contacto</label>
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all font-light"
                  placeholder="Número a 10 dígitos"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 rounded-xl bg-[#0B2545] text-white font-semibold text-sm px-6 py-3 disabled:opacity-50 transition-all shadow-sm"
          >
            {isPending ? 'Procesando...' : 'Completar Pre-Registro'}
          </button>
        </form>
      )}
    </div>
  )
}