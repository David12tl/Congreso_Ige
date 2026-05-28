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
    } catch (err) {
      alert('Error crítico al procesar la actualización del perfil.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all">
        
        {/* Encabezado */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter font-mono">
            SISTEMA_ONBOARDING // REGISTRO
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6">
          {step === 'choice' ? (
            <div className="space-y-4 text-center">
              <p className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-6">
                Selecciona tu tipo de credencial de acceso
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => { setTipo('alumno'); setStep('form') }}
                  className="p-6 border border-cyan-500/20 bg-cyan-500/5 rounded-2xl hover:border-cyan-400 transition-all group text-center"
                >
                  <HiOutlineAcademicCap className="w-10 h-10 text-cyan-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <span className="block text-white font-bold uppercase text-xs tracking-widest font-mono">Alumno</span>
                  <span className="text-[10px] text-cyan-500 font-mono">Comunidad Interna</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => { setTipo('empresa'); setStep('form') }}
                  className="p-6 border border-purple-500/20 bg-purple-500/5 rounded-2xl hover:border-purple-400 transition-all group text-center"
                >
                  <HiOutlineBriefcase className="w-10 h-10 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <span className="block text-white font-bold uppercase text-xs tracking-widest font-mono">Externo</span>
                  <span className="text-[10px] text-purple-500 font-mono">Visitante General</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-3">
                
                {/* Campos Universales */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">Nombre Completo</label>
                  <input 
                    required 
                    type="text"
                    value={formData.nombre} 
                    onChange={e => setFormData({...formData, nombre: e.target.value})} 
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none font-mono" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
                    {tipo === 'alumno' ? 'Correo Institucional' : 'Correo Electrónico de Contacto'}
                  </label>
                  <input 
                    required 
                    type="email"
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none font-mono" 
                  />
                </div>

                {/* Formulario Específico para Alumnos */}
                {tipo === 'alumno' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">Num. de Control</label>
                        <input 
                          required 
                          type="text"
                          value={formData.matricula} 
                          onChange={e => setFormData({...formData, matricula: e.target.value})} 
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none font-mono" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">Semestre</label>
                        <select 
                          value={formData.semestre} 
                          onChange={e => setFormData({...formData, semestre: e.target.value})} 
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none font-mono"
                        >
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(s => (
                            <option key={s} value={s} className="bg-slate-900">{s}° Semestre</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">Unidad Académica</label>
                      <select 
                        value={formData.unidad} 
                        onChange={e => setFormData({...formData, unidad: e.target.value})} 
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none font-mono"
                      >
                        {UNIDADES_ACADEMICAS.map(u => (
                          <option key={u} value={u} className="bg-slate-900">{u}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">Carrera</label>
                      <input 
                        required 
                        type="text"
                        value={formData.carrera} 
                        placeholder="Ej. Ingeniería en Gestión Empresarial"
                        onChange={e => setFormData({...formData, carrera: e.target.value})} 
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none font-mono placeholder-gray-700" 
                      />
                    </div>
                  </>
                ) : (
                  /* Formulario Específico para Externos */
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">Teléfono Móvil / Fijo</label>
                    <input 
                      required 
                      type="tel"
                      value={formData.telefono} 
                      onChange={e => setFormData({...formData, telefono: e.target.value})} 
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none font-mono" 
                    />
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-4 border-t border-white/5 mt-4">
                <button 
                  type="button" 
                  onClick={() => setStep('choice')} 
                  className="border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all"
                >
                  ← Regresar
                </button>
                <button 
                  disabled={loading} 
                  type="submit" 
                  className="flex-[2] py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold uppercase tracking-widest rounded-xl shadow-lg transition-all disabled:opacity-40"
                >
                  {loading ? 'Sincronizando...' : 'Guardar Información'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}