'use client'

import React from 'react'
import Image from 'next/image'
import { HiOutlineUser } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'

interface ProfileAvatarCardProps {
  email: string | null
  avatarUrl: string | null
  rolNombre: string
  createdAt?: string
}

export function ProfileAvatarCard({ email, avatarUrl, rolNombre, createdAt }: ProfileAvatarCardProps) {
  return (
    <GlassCard 
      className="p-8 flex flex-col items-center justify-center text-center bg-white dark:bg-[#2a2a2f] border border-[#cbd5e1] dark:border-slate-700 shadow-sm" 
      glowColor="cyan"
    >
      <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-[#e0e7ff] flex items-center justify-center text-[#1e3a8a] shadow-md relative shrink-0">
        {avatarUrl ? (
          <Image 
            src={avatarUrl} 
            alt="Foto de Perfil" 
            width={128}
            height={128}
            className="w-full h-full object-cover rounded-full"
          />
        ) : email ? (
          <span className="text-3xl font-extrabold tracking-wider uppercase text-[#1e3a8a]">
            {email.substring(0, 2)}
          </span>
        ) : (
          <HiOutlineUser className="w-12 h-12 text-[#475569]" />
        )}
      </div>

      <h2 className="text-xl font-bold text-[#0f172a] dark:text-white mt-4 truncate max-w-full">
        {email || 'Asistente Anónimo'}
      </h2>
      <span className="px-3 py-1 mt-2 rounded-full bg-[#1e3a8a]/10 text-[#1e3a8a] border border-[#1e3a8a]/20 text-xs font-bold uppercase tracking-wider">
        {rolNombre || 'Asistente'}
      </span>
      <p className="text-[10px] text-[#475569] dark:text-slate-400 font-semibold mt-4 uppercase tracking-wider">
        Miembro desde:{' '}
        <span className="font-light text-[#1e293b] dark:text-slate-100">
          {createdAt ? new Date(createdAt).toLocaleDateString() : '—'}
        </span>
      </p>
    </GlassCard>
  )
}