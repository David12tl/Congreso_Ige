'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { crearRegistroDocente } from './actions-docente'
import { HiUser, HiOfficeBuilding, HiCheckCircle, HiExclamationCircle, HiLockClosed, HiClock } from 'react-icons/hi'

// Estructura de datos para el formulario local
interface TicketFormData {
  buyer_id: string
  email: string
  type: 'alumno' | 'empresa'
  nombre: string
  telefono: string | null
  estatus_pago: string
  matricula: string | null
  carrera: string | null
  semestre: string | null
  modalidad: 'escolarizado' | 'mixto' | null
  empresa: string | null
  departamento: string | null // Nuevo campo para docentes
}

export function PreTicketOnboarding({ userId, userEmail }: { userId: string; userEmail: string }) {
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  
  // Estados de flujo y control
  const [step, setStep] = useState<'checking' | 'selection' | 'form' | 'success' | 'already_registered' | 'docente_success'>('checking')
  const [type, setType] = useState<'alumno' | 'empresa' | 'docente'>('alumno')
  const [existingStatus, setExistingStatus] = useState<string | null>(null)
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)

  // Estados del Formulario
  const [nombre, setNombre] = useState('')
  const [matricula, setMatricula] = useState('')
  const [carrera, setCarrera] = useState('')
  const [semestre, setSemestre] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [telefono, setTelefono] = useState('')
  const [departamento, setDepartamento] = useState('') // Nuevo estado para el departamento del docente
  const [modalidad, setModalidad] = useState<'escolarizado' | 'mixto'>('escolarizado')

  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // --- CANDADO: Verificar si el usuario ya envió el formulario ---
  useEffect(() => {
    async function verificarRegistroPrevio() {
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('estatus_pago')
          .eq('buyer_id', userId)
          .returns<Array<{ estatus_pago: string }>>()
          .maybeSingle()

        if (error) throw error

        if (data) {
          setExistingStatus(data.estatus_pago)
          setStep('already_registered')
        } else {
          setStep('selection')
        }
      } catch (err) {
        console.error('Error al verificar estatus:', err)
        setStep('selection') 
      }
    }

    if (userId) {
      verificarRegistroPrevio()
    }
  }, [userId, supabase])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!nombre.trim()) {
      setErrorMsg('El nombre es obligatorio.')
      return
    }

    startTransition(async () => {
      // --- LÓGICA DIFERENCIADA PARA DOCENTES ---
      if (type === 'docente') {
        if (!departamento.trim()) {
          setErrorMsg('El departamento es obligatorio para docentes.')
          return
        }
        const result = await crearRegistroDocente({
          userId,
          userEmail,
          nombre: nombre.trim(),
          telefono: telefono.trim() || null,
          departamento: departamento.trim(),
        })

        if (result.success && result.token) {
          setGeneratedToken(result.token)
          setStep('docente_success')
        } else {
          setErrorMsg(result.message)
        }
      } else {
        // --- Lógica original para alumnos y externos ---
        const payload: Omit<TicketFormData, 'type' | 'departamento' | 'estatus_pago'> & { type: 'alumno' | 'empresa' } = {
          buyer_id: userId,
          email: userEmail,
          type: type as 'alumno' | 'empresa',
          nombre: nombre.trim(),
          telefono: telefono.trim() || null,
          matricula: type === 'alumno' ? matricula.trim() : null,
          carrera: type === 'alumno' ? carrera.trim() : null,
          semestre: type === 'alumno' ? semestre.trim() : null,
          modalidad: type === 'alumno' ? modalidad : null,
          empresa: type === 'empresa' ? empresa.trim() : null,
        }

        const { error } = await supabase.from('tickets').insert(payload)

        if (error) {
          setErrorMsg('Error al procesar tu pre-registro. Es posible que ya tengas un ticket asignado.')
        } else {
          setStep('success')
        }
      }
    })
  }

  // 1. Pantalla de carga
  if (step === 'checking') {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-[#2a2a2f] border border-slate-100 rounded-[24px] p-8 text-center shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B1E23] mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-light">Verificando estatus...</p>
      </div>
    )
  }

  // 2. CANDADO: Usuario ya registrado
  if (step === 'already_registered') {
    const isPendingApproval = existingStatus === 'pending'

    return (
      <div className="max-w-md mx-auto bg-white dark:bg-[#2a2a2f] border border-slate-200 dark:border-slate-700 rounded-[24px] p-6 text-center text-[#1E2A39] dark:text-white shadow-sm animate-fadeIn">
        {isPendingApproval ? (
          <>
            <HiClock className="w-12 h-12 text-amber-500 mx-auto mb-3 animate-pulse" />
            <h3 className="text-base font-black uppercase tracking-wider text-amber-700">Registro en Espera</h3>
            <p className="text-xs text-[#7D7D7D] dark:text-slate-400 mt-2 font-light">
              Ya hemos recibido tu solicitud. Actualmente se encuentra en <strong>Lista de Espera</strong>.
            </p>
            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl mt-4 font-light">
              Por favor acude con el encargado de tu unidad para validar tus datos, elegir tu asiento y realizar el pago.
            </p>
          </>
        ) : (
          <>
            <HiLockClosed className="w-12 h-12 text-cyan-600 mx-auto mb-3" />
            <h3 className="text-base font-black uppercase tracking-wider text-cyan-700">Registro Procesado</h3>
            <p className="text-xs text-[#7D7D7D] dark:text-slate-400 mt-2 font-light">
              Tu solicitud ya cuenta con una respuesta en el sistema.
            </p>
            <div className="text-[11px] text-cyan-900 bg-cyan-50 border border-cyan-200 p-3 rounded-xl mt-4 font-normal">
              Estatus: <span className="uppercase font-bold tracking-wider">{existingStatus}</span>
            </div>
          </>
        )}
      </div>
    )
  }

  // 3. Éxito después de enviar
  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-[#2a2a2f] border border-emerald-500 rounded-[24px] p-6 text-center text-[#1E2A39] dark:text-white shadow-sm animate-fadeIn">
        <HiCheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-base font-black uppercase tracking-wider text-emerald-700">¡Pre-registro Exitoso!</h3>
        <p className="text-xs text-[#7D7D7D] dark:text-slate-400 mt-2 font-light">
          Tus datos se enviaron a la lista de espera.
        </p>
        <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl mt-4 font-light">
          Por favor acude con el encargado de tu unidad para seleccionar tu asiento y realizar tu pago.
        </p>
      </div>
    )
  }

  // 3.5 Éxito para Docentes (con token)
  if (step === 'docente_success') {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-[#2a2a2f] border border-emerald-500 rounded-[24px] p-6 text-center text-[#1E2A39] dark:text-white shadow-sm animate-fadeIn">
        <HiCheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-base font-black uppercase tracking-wider text-emerald-700">¡Registro de Docente Exitoso!</h3>
        <p className="text-xs text-[#7D7D7D] dark:text-slate-400 mt-2 font-light">
          Se ha generado tu token de acceso para tu gafete de organizador.
        </p>
        <div className="text-center bg-emerald-50 border border-emerald-200 p-4 rounded-xl mt-4">
          <p className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">Tu Token de Acceso:</p>
          <p className="text-lg font-mono font-bold text-emerald-900 tracking-widest mt-1">{generatedToken}</p>
          <p className="text-[10px] text-emerald-700 mt-2">Ingresa este token en la sección &quot;Canjear Token&quot; para generar tu gafete digital.</p>
        </div>
      </div>
    )
  }

  // 4. Formulario
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-[#2a2a2f] border border-[#E6E6E6] dark:border-slate-700 rounded-[24px] p-6 text-[#1E2A39] dark:text-white shadow-sm">
      {step === 'selection' ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#8B1E23]">Tipo de Asistente</h2>
            <p className="text-xs text-[#7D7D7D] dark:text-slate-400 mt-1 font-light">Selecciona tu perfil para iniciar tu registro</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => { setType('alumno'); setStep('form') }}
              className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-[#8B1E23] rounded-xl transition group text-center"
            >
              <HiUser className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-[#8B1E23] transition mb-2" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Interno</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-light">(Alumnos)</span>
            </button>

            <button
              onClick={() => { setType('empresa'); setStep('form') }}
              className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-[#8B1E23] rounded-xl transition group text-center"
            >
              <HiOfficeBuilding className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-[#8B1E23] transition mb-2" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Externo</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-light">(Empresas)</span>
            </button>

            <button
              onClick={() => { setType('docente'); setStep('form') }} // Nuevo botón para Docente
              className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-[#8B1E23] rounded-xl transition group text-center"
            >
              <HiUser className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-[#8B1E23] transition mb-2" /> {/* Puedes usar un ícono diferente si lo deseas */}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Docente</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-light">(Personal Académico)</span>
            </button>

          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3 mb-2">
            <h3 className="font-black uppercase tracking-wider text-[#8B1E23]">
              Pre-Registro: {type === 'alumno' ? 'Interno' : type === 'empresa' ? 'Externo' : 'Docente'}
            </h3>
            <button type="button" onClick={() => setStep('selection')} className="text-[10px] text-slate-500 dark:text-slate-400 hover:underline">
              Cambiar
            </button>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-[11px] font-medium">
              <HiExclamationCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Nombre Completo</label>
            <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B1E23]" placeholder="Ej. Juan Pérez" />
          </div>

          {type === 'alumno' && (
            <div className="grid grid-cols-2 gap-3">
               <input type="text" required value={matricula} onChange={(e) => setMatricula(e.target.value)} placeholder="Matrícula" className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
               <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono" className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
               <input type="text" required value={carrera} onChange={(e) => setCarrera(e.target.value)} placeholder="Carrera" className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
               <input type="text" required value={semestre} onChange={(e) => setSemestre(e.target.value)} placeholder="Semestre" className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
            </div>
          )}

          {type === 'alumno' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#1E2A39] uppercase">
                Modalidad de Estudio <span className="text-[#8B1E23]">*</span>
              </label>
              <select
                value={modalidad}
                onChange={(e) => setModalidad(e.target.value as 'escolarizado' | 'mixto')}
                className="p-3 rounded-xl border border-slate-200 bg-white text-sm text-[#1E2A39] focus:outline-none focus:border-[#8B1E23] transition-colors"
                required
              >
                <option value="escolarizado">Escolarizado</option>
                <option value="mixto">Mixto</option>
              </select>
            </div>
          )}

          {type === 'empresa' && (
            <div className="space-y-3">
              <input type="text" required value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Institución / Empresa" className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
              <input type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono" className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
            </div>
          )}

          {type === 'docente' && ( // Nuevo bloque para docentes
            <div className="space-y-3">
              <input type="text" required value={departamento} onChange={(e) => setDepartamento(e.target.value)} placeholder="Departamento" className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
              <input type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono" className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
            </div>
          )}

          <button type="submit" disabled={isPending} className="w-full mt-2 rounded-xl bg-[#8B1E23] text-white font-semibold text-sm px-6 py-3 disabled:opacity-50 transition-all shadow-sm">
            {isPending ? 'Procesando...' : 'Completar Pre-Registro'}
          </button>
        </form>
      )}
    </div>
  )
}