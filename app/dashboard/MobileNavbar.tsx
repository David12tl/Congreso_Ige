'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  HiMenu,
  HiX,
  HiOutlineViewGrid,
  HiOutlineTicket,
  HiOutlineMap,
  HiOutlineUserGroup,
  HiOutlineLogout,
  HiOutlineUsers,
  HiOutlineDocumentReport,
  HiOutlineOfficeBuilding,
  HiOutlineIdentification,
  HiOutlinePlusCircle,
  HiOutlineQrcode,
  HiOutlineCash,
  HiOutlineCamera,
} from 'react-icons/hi'

type UserRole = 'admin' | 'encargado' | 'user'

interface MobileNavbarUser {
  name: string
  email: string
  role: UserRole
  nivelAcceso?: number
}

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: UserRole[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard/admin',
    icon: <HiOutlineViewGrid className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Dashboard',
    href: '/dashboard/encargados',
    icon: <HiOutlineViewGrid className="w-5 h-5" />,
    roles: ['encargado'],
  },
  {
    label: 'Perfil',
    href: '/dashboard/perfil',
    icon: <HiOutlineIdentification className="w-5 h-5" />,
    roles: ['user'],
  },
  {
    label: 'Escanear Accesos',
    href: '/dashboard/escanear-qr',
    icon: <HiOutlineCamera className="w-5 h-5" />,
    roles: ['admin', 'encargado'],
  },
  {
    label: 'Listas por UA',
    href: '/dashboard/listas-ua',
    icon: <HiOutlineOfficeBuilding className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Usuarios por UA',
    href: '/dashboard/usuarios-ua',
    icon: <HiOutlineUsers className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Tickets Vendidos',
    href: '/dashboard/tickets-vendidos',
    icon: <HiOutlineTicket className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Encargados',
    href: '/dashboard/encargados',
    icon: <HiOutlineUserGroup className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Reportes',
    href: '/dashboard/reportes',
    icon: <HiOutlineDocumentReport className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Lista UA Encargada',
    href: '/dashboard/mi-ua',
    icon: <HiOutlineOfficeBuilding className="w-5 h-5" />,
    roles: ['admin', 'encargado'],
  },
  {
    label: 'Tickets',
    href: '/dashboard/tickets-gestion',
    icon: <HiOutlineTicket className="w-5 h-5" />,
    roles: ['admin', 'encargado'],
  },
  {
    label: 'Taquilla y Tokens',
    href: '/dashboard/generar-tokens',
    icon: <HiOutlineCash className="w-5 h-5" />,
    roles: ['admin', 'encargado'],
  },
  {
    label: 'Mis Asientos',
    href: '/dashboard/mis-asientos',
    icon: <HiOutlineTicket className="w-5 h-5" />,
    roles: ['user'],
  },
  {
    label: 'Ingresar Token',
    href: '/dashboard/ingresar-token',
    icon: <HiOutlinePlusCircle className="w-5 h-5" />,
    roles: ['user'],
  },
  {
    label: 'Generar QR',
    href: '/dashboard/generar-qr',
    icon: <HiOutlineQrcode className="w-5 h-5" />,
    roles: ['user'],
  },
  {
    label: 'Mapa del Evento',
    href: '/dashboard/mapa',
    icon: <HiOutlineMap className="w-5 h-5" />,
    roles: ['admin', 'encargado', 'user'],
  },
  {
    label: 'Usuarios',
    href: '/dashboard/usuarios-list',
    icon: <HiOutlineUsers className="w-5 h-5" />,
    roles: ['admin'],
  },
]

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  encargado: 'Encargado',
  user: 'Usuario',
}

export function MobileNavbar({ user }: { user: MobileNavbarUser }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role),
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  const closeDrawer = useCallback(() => {
    setIsOpen(false)
  }, [])
  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="flex md:hidden items-center justify-between px-4 h-16 bg-white border-b border-slate-200 shrink-0">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-[#0f172a] hover:text-[#0B2545] transition-colors"
          aria-label="Abrir menú"
        >
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[24px] bg-[#0B2545] flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">IGE</span>
          </div>
          <span className="text-[#0f172a] font-semibold text-sm">ELIGE 2026</span>
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-[#0f172a] uppercase">
          {user.name.charAt(0)}
        </div>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white border-r border-slate-200 flex flex-col animate-fadeIn shadow-sm">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[24px] bg-[#0B2545] flex items-center justify-center">
                  <span className="text-white font-bold text-xs">IGE</span>
                </div>
                <span className="text-[#0f172a] font-semibold text-base">ELIGE 2026</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-[#0f172a] transition-colors rounded-xl hover:bg-slate-50"
                aria-label="Cerrar menú"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* User info */}
            <div className="px-5 py-3 border-b border-slate-200">
              <p className="text-[#0f172a] text-sm font-medium truncate">{user.name}</p>
              <p className="text-slate-500 text-xs truncate mt-0.5">{user.email}</p>
              <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {roleLabels[user.role]}
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeDrawer}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-slate-50 text-[#0B2545]'
                        : 'text-slate-500 hover:text-[#0f172a] hover:bg-slate-50'
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0B2545]" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Sign Out */}
            <div className="border-t border-slate-200 p-3">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 text-left cursor-pointer group"
              >
                <HiOutlineLogout className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}