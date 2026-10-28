'use client'

import React from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

function FirstPageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
  )
}

function LastPageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  )
}

interface UsuariosUAPaginationProps {
  startRange: number
  endRange: number
  totalItems: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number | ((prev: number) => number)) => void
}

export function UsuariosUAPagination({
  startRange,
  endRange,
  totalItems,
  currentPage,
  totalPages,
  onPageChange
}: UsuariosUAPaginationProps) {
  if (totalItems === 0) return null

  return (
    <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end gap-5 text-xs text-slate-700">
      <div className="font-medium text-slate-600">
        {startRange}-{endRange} de {totalItems}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded text-slate-600 hover:bg-slate-200/60 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
          title="Primera página"
        >
          <FirstPageIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded text-slate-600 hover:bg-slate-200/60 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
          title="Página anterior"
        >
          <HiChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded text-slate-600 hover:bg-slate-200/60 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
          title="Página siguiente"
        >
          <HiChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded text-slate-600 hover:bg-slate-200/60 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
          title="Última página"
        >
          <LastPageIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}