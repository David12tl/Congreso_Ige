'use client'

import React, { useState } from 'react'
import { HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineX } from 'react-icons/hi'
import { actualizarInformacionPerfil } from './actions'

const UNIDADES_ACADEMICAS = [
  "Unidad Académica Nogales",
  "Unidad Académica Tezonapa",
  "Unidad Académica Tehuipango",
  "Unidad Académica Tequila",
  "Unidad Académica Cuichapa",
  "Unidad Académica Acultzinapa"
]

interface CompleteProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CompleteProfileModal({ isOpen, onClose, onSuccess }: CompleteProfileModalProps) {
  const [step, setStep] = useState<'choice' | 'form'>('choice')
  const [tipo, setTipo] = useState<'alumno' | 'empresa'>('alumno')
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    matricula: '',
    unidad: UNIDADES_ACADEMICAS[0],
    semestre: '1',
    carrera: '',
    telefono: ''
  })

  if (!isOpen) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await actualizarInformacionPerfil({
        tipo,
        nombre: formData.nombre,
        email: formData.email,
        matricula: formData.matricula,
        unidad_academica: formData.unidad,
        semestre: formData.semestre,
        carrera: formData.carrera,
        telefono: formData.telefono
      })

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        alert(res.message)
      }
    } catch {
      alert('Error crítico al procesar la actualización del perfil.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg animate-scaleIn">
        <div className="relative rounded-[24px] border border-slate-200 bg-white overflow-hidden shadow-sm">
          
          {/* Encabezado */}
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-xl font-black text-slate-700 uppercase tracking-tight font-sora">
              SISTEMA_ONBOARDING // REGISTRO
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors rounded-xl hover:bg-slate-100 p-1.5">
              <HiOutlineX className="w-6 h-6" />
            </button>
          </div>

          {/* Cuerpo del Modal */}
          <div className="p-6">
            {step === 'choice' ? (
              <div className="space-y-4 text-center">
                <p className="text-slate-500 text-xs font-light uppercase tracking-widest mb-6">
                  Selecciona tu tipo de credencial de acceso
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => { setTipo('alumno'); setStep('form') }}
                    className="p-6 border border-cyan-200 bg-cyan-50 rounded-[24px] hover:border-cyan-300 transition-all group text-center"
                  >
                    <HiOutlineAcademicCap className="w-10 h-10 text-cyan-700 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <span className="block text-slate-700 font-bold uppercase text-xs tracking-widest font-sora">Alumno</span>
                    <span className="text-[10px] text-cyan-700 font-light font-sora">Comunidad Interna</span>
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => { setTipo('empresa'); setStep('form') }}
                    className="p-6 border border-purple-200 bg-purple-50 rounded-[24px] hover:border-purple-300 transition-all group text-center"
                  >
                    <HiOutlineBriefcase className="w-10 h-10 text-purple-700 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <span className="block text-slate-700 font-bold uppercase text-xs tracking-widest font-sora">Externo</span>
                    <span className="text-[10px] text-purple-700 font-light font-sora">Visitante General</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-3">
                  
                  {/* Campos Universales */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sora">Nombre Completo</label>
                    <input 
                      required 
                      type="text"
                      value={formData.nombre} 
                      onChange={e => setFormData({...formData, nombre: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-cyan-500 outline-none font-light font-sora" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sora">
                      {tipo === 'alumno' ? 'Correo Institucional' : 'Correo Electrónico de Contacto'}
                    </label>
                    <input 
                      required 
                      type="email"
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-cyan-500 outline-none font-light font-sora" 
                    />
                  </div>

                  {/* Formulario Específico para Alumnos */}
                  {tipo === 'alumno' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sora">Num. de Control</label>
                          <input 
                            required 
                            type="text"
                            value={formData.matricula} 
                            onChange={e => setFormData({...formData, matricula: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-cyan-500 outline-none font-light font-sora" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sora">Semestre</label>
                          <select 
                            value={formData.semestre} 
                            onChange={e => setFormData({...formData, semestre: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-cyan-500 outline-none font-light font-sora"
                          >
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(s => (
                              <option key={s} value={s} className="bg-white">{s}° Semestre</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sora">Unidad Académica</label>
                        <select 
                          value={formData.unidad} 
                          onChange={e => setFormData({...formData, unidad: e.target.value})} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-cyan-500 outline-none font-light font-sora"
                        >
                          {UNIDADES_ACADEMICAS.map(u => (
                            <option key={u} value={u} className="bg-white">{u}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sora">Carrera</label>
                        <input 
                          required 
                          type="text"
                          value={formData.carrera} 
                          placeholder="Ej. Ingeniería en Gestión Empresarial"
                          onChange={e => setFormData({...formData, carrera: e.target.value})} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-cyan-500 outline-none font-light font-sora placeholder-slate-400" 
                        />
                      </div>
                    </>
                  ) : (
                    /* Formulario Específico para Externos */
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sora">Teléfono Móvil / Fijo</label>
                      <input 
                        required 
                        type="tel"
                        value={formData.telefono} 
                        onChange={e => setFormData({...formData, telefono: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-cyan-500 outline-none font-light font-sora" 
                      />
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-3 pt-4 border-t border-slate-200 mt-4">
                  <button 
                    type="button" 
                    onClick={() => setStep('choice')} 
                    className="border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-light text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all font-sora"
                  >
                    ← Regresar
                  </button>
                  <button 
                    disabled={loading} 
                    type="submit" 
                    className="flex-[2] py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-light uppercase tracking-widest rounded-xl shadow-sm transition-all disabled:opacity-40 font-sora"
                  >
                    {loading ? 'Sincronizando...' : 'Guardar Información'}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}