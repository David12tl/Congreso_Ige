'use client'

import React, { useState } from 'react'
import { HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineX, HiCheckCircle, HiExclamation } from 'react-icons/hi'
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

// Tipo para manejar el estado de la notificación
type NotificationState = {
  type: 'success' | 'error'
  message: string
} | null

export default function CompleteProfileModal({ isOpen, onClose, onSuccess }: CompleteProfileModalProps) {
  const [step, setStep] = useState<'choice' | 'form'>('choice')
  const [tipo, setTipo] = useState<'alumno' | 'empresa'>('alumno')
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<NotificationState>(null)
  
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

  // Función para resetear estados al cerrar
  const handleClose = () => {
    setNotification(null)
    setStep('choice')
    setFormData({
        nombre: '',
        email: '',
        matricula: '',
        unidad: UNIDADES_ACADEMICAS[0],
        semestre: '1',
        carrera: '',
        telefono: ''
    })
    onClose()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setNotification(null) // Limpiar notificaciones anteriores

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
        // Notificación de éxito (Verde)
        setNotification({ type: 'success', message: '¡Perfil actualizado correctamente!' })
        
        // Esperar un momento para que el usuario vea el mensaje antes de cerrar
        setTimeout(() => {
            onSuccess()
            handleClose()
        }, 1500)

      } else {
        // Notificación de error del servidor (Naranja)
        setNotification({ type: 'error', message: res.message || 'Hubo un problema al guardar.' })
      }
    } catch {
      // Notificación de error crítico (Naranja)
      setNotification({ type: 'error', message: 'Error crítico al procesar la actualización.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn font-sora">
      <div className="w-full max-w-lg animate-scaleIn">
        <div className="relative rounded-[24px] border border-slate-200 bg-white overflow-hidden shadow-2xl">
          
          {/* Encabezado con Botón X a la derecha */}
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                {step === 'choice' ? 'Completa tu Perfil' : `Registro de ${tipo === 'alumno' ? 'Alumno' : 'Externo'}`}
            </h3>
            <button 
                onClick={handleClose} 
                className="text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 p-1.5 -mr-2"
                title="Cerrar"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {/* Banner de Notificación Dinámico */}
          {notification && (
            <div className={`flex items-center gap-3 px-6 py-3 border-b animate-slideDown ${
                notification.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' // Verde para éxito
                : 'bg-amber-50 border-amber-200 text-amber-900'     // Naranja para error
            }`}>
                {notification.type === 'success' 
                    ? <HiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    : <HiExclamation className="w-5 h-5 text-amber-600 shrink-0" />
                }
                <p className="text-xs font-medium tracking-wide">
                    {notification.message}
                </p>
            </div>
          )}

          {/* Cuerpo del Modal */}
          <div className="p-6">
            {step === 'choice' ? (
              <div className="space-y-4 text-center">
                <p className="text-slate-500 text-xs font-light uppercase tracking-widest mb-6 block">
                  Selecciona tu tipo de credencial de acceso
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => { setTipo('alumno'); setStep('form') }}
                    className="p-6 border border-cyan-200 bg-cyan-50 rounded-[24px] hover:border-cyan-300 transition-all group text-center focus:ring-2 focus:ring-cyan-300 outline-none"
                  >
                    <HiOutlineAcademicCap className="w-10 h-10 text-cyan-700 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <span className="block text-slate-700 font-bold uppercase text-xs tracking-widest">Alumno</span>
                    <span className="text-[10px] text-cyan-700 font-light">Comunidad Interna</span>
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => { setTipo('empresa'); setStep('form') }}
                    className="p-6 border border-purple-200 bg-purple-50 rounded-[24px] hover:border-purple-300 transition-all group text-center focus:ring-2 focus:ring-purple-300 outline-none"
                  >
                    <HiOutlineBriefcase className="w-10 h-10 text-purple-700 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <span className="block text-slate-700 font-bold uppercase text-xs tracking-widest">Externo</span>
                    <span className="text-[10px] text-purple-700 font-light">Visitante General</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-3">
                  
                  {/* Campos Universales */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Nombre Completo</label>
                    <input 
                      required 
                      type="text"
                      disabled={loading}
                      value={formData.nombre} 
                      onChange={e => setFormData({...formData, nombre: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-light placeholder:text-slate-300 disabled:opacity-60" 
                      placeholder="Juan Pérez García"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      {tipo === 'alumno' ? 'Correo Institucional' : 'Correo Electrónico de Contacto'}
                    </label>
                    <input 
                      required 
                      type="email"
                      disabled={loading}
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-light placeholder:text-slate-300 disabled:opacity-60" 
                      placeholder="ejemplo@dominio.com"
                    />
                  </div>

                  {/* Formulario Específico para Alumnos */}
                  {tipo === 'alumno' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Num. de Control</label>
                          <input 
                            required 
                            type="text"
                            disabled={loading}
                            value={formData.matricula} 
                            onChange={e => setFormData({...formData, matricula: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-light disabled:opacity-60" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Semestre</label>
                          <select 
                            value={formData.semestre} 
                            disabled={loading}
                            onChange={e => setFormData({...formData, semestre: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-light disabled:opacity-60"
                          >
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(s => (
                              <option key={s} value={s} className="bg-white">{s}° Semestre</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Unidad Académica</label>
                        <select 
                          value={formData.unidad} 
                          disabled={loading}
                          onChange={e => setFormData({...formData, unidad: e.target.value})} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-light disabled:opacity-60"
                        >
                          {UNIDADES_ACADEMICAS.map(u => (
                            <option key={u} value={u} className="bg-white">{u}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Carrera</label>
                        <input 
                          required 
                          type="text"
                          disabled={loading}
                          value={formData.carrera} 
                          placeholder="Ej. Ingeniería en Gestión Empresarial"
                          onChange={e => setFormData({...formData, carrera: e.target.value})} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-light placeholder:text-slate-300 disabled:opacity-60" 
                        />
                      </div>
                    </>
                  ) : (
                    /* Formulario Específico para Externos */
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Teléfono Móvil / Fijo</label>
                      <input 
                        required 
                        type="tel"
                        disabled={loading}
                        value={formData.telefono} 
                        onChange={e => setFormData({...formData, telefono: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-light disabled:opacity-60" 
                        placeholder="2711234567"
                      />
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-3 pt-5 border-t border-slate-200 mt-5">
                  <button 
                    type="button" 
                    onClick={() => { setStep('choice'); setNotification(null); }} 
                    disabled={loading}
                    className="border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-light text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
                  >
                    ← Regresar
                  </button>
                  <button 
                    disabled={loading} 
                    type="submit" 
                    className="flex-[2] py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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