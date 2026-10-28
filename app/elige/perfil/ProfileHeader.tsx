'use client'

import React from 'react'
import { HiOutlineIdentification } from 'react-icons/hi'

interface ProfileHeaderProps {
  ticketType?: string | null
}

export function ProfileHeader({ ticketType }: ProfileHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="font-black tracking-tight text-[#0f172a] dark:text-white text-2xl md:text-3xl">
          <HiOutlineIdentification className="inline-block w-8 h-8 mr-3 text-[#1e3a8a]" />
          Mi <span className="text-[#1e3a8a]">Perfil</span>
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-[#1e3a8a] animate-pulse" />
          <span className="text-[#1e3a8a] text-xs font-bold uppercase tracking-widest">
            {ticketType ? `Perfil ${ticketType}` : 'Perfil Activo'}
          </span>
        </div>
      </div>
    </header>
  )
}