'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  HiOutlineViewGrid,
  HiOutlineTicket,
  HiOutlineMap,
  HiOutlineUserGroup,
  HiOutlineLogout,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUsers,
  HiOutlineDocumentReport,
  HiOutlineOfficeBuilding,
  HiOutlineIdentification,
  HiOutlinePlusCircle,
  HiOutlineQrcode,
  HiOutlineCash,
  HiOutlineCamera,
  HiOutlineHome,
} from 'react-icons/hi'
type UserRole = 'admin' | 'encargado' | 'user'

interface SidebarUser {
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
    href: '/elige/admin',
    icon: <HiOutlineViewGrid className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Dashboard',
    href: '/elige/encargados',
    icon: <HiOutlineViewGrid className="w-5 h-5" />,
    roles: ['encargado'],
  },
  {
    label: 'Perfil',
    href: '/elige/perfil',
    icon: <HiOutlineIdentification className="w-5 h-5" />,
    roles: ['user'],
  },
  {
    label: 'Escanear Accesos',
    href: '/elige/escanear-qr',
    icon: <HiOutlineCamera className="w-5 h-5" />,
    roles: ['admin', 'encargado'],
  },
  {
    label: 'Listas por UA',
    href: '/elige/listas-ua',
    icon: <HiOutlineOfficeBuilding className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Usuarios por UA',
    href: '/elige/usuarios-ua',
    icon: <HiOutlineUsers className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Tickets Vendidos',
    href: '/elige/tickets-vendidos',
    icon: <HiOutlineTicket className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Encargados',
    href: '/elige/encargados',
    icon: <HiOutlineUserGroup className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Reportes',
    href: '/elige/reportes',
    icon: <HiOutlineDocumentReport className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Lista UA Encargada',
    href: '/elige/mi-ua',
    icon: <HiOutlineOfficeBuilding className="w-5 h-5" />,
    roles: ['admin', 'encargado'],
  },
  {
    label: 'Tickets',
    href: '/elige/tickets-gestion',
    icon: <HiOutlineTicket className="w-5 h-5" />,
    roles: ['admin', 'encargado'],
  },
  {
    label: 'Taquilla y Tokens',
    href: '/elige/generar-tokens',
    icon: <HiOutlineCash className="w-5 h-5" />,
    roles: ['admin', 'encargado'],
  },
  {
    label: 'Inicio',
    href: '/elige/usuario',
    icon: <HiOutlineHome className="w-5 h-5" />,
    roles: ['user'],
  },
  {
    label: 'Mis Asientos',
    href: '/elige/mis-asientos',
    icon: <HiOutlineTicket className="w-5 h-5" />,
    roles: ['user'],
  },
  {
    label: 'Ingresar Token',
    href: '/elige/ingresar-token',
    icon: <HiOutlinePlusCircle className="w-5 h-5" />,
    roles: ['user'],
  },
  {
    label: 'Generar QR',
    href: '/elige/generar-qr',
    icon: <HiOutlineQrcode className="w-5 h-5" />,
    roles: ['user'],
  },
  {
    label: 'Mapa del Evento',
    href: '/elige/mapa',
    icon: <HiOutlineMap className="w-5 h-5" />,
    roles: ['admin', 'encargado', 'user'],
  },
  {
    label: 'Usuarios',
    href: '/elige/usuarios-list',
    icon: <HiOutlineUsers className="w-5 h-5" />,
    roles: ['admin'],
  },
]

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  encargado: 'Encargado',
  user: 'Usuario',
}

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [collapsed, setCollapsed] = useState(false)

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role),
  )

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        alert(`No se pudo cerrar la sesión: ${error.message}`)
        return
      }
      router.refresh()
      router.push('/')
    } catch (catchError) {
      console.error('Error inesperado al cerrar sesión:', catchError)
    }
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out
        bg-white
        border-r border-slate-200
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Header / Logo */}
     <div className="flex justify-center items-center w-full">
        <Image src="/logo.png" alt="Logo" width={50} height={50} />
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="px-6 py-4 border-b border-slate-200">
          <p className="text-[#1E2A39] text-sm font-medium truncate">
            {user.name}
          </p>
          <p className="text-slate-500 text-xs truncate mt-0.5">
            {user.email}
          </p>
          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {roleLabels[user.role]}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${
                  isActive
                    ? 'bg-slate-50 text-[#1E2A39]'
                    : 'text-slate-500 hover:text-[#1E2A39] hover:bg-slate-50'
                }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#8B1E23]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="mx-3 mb-2 flex items-center justify-center h-8 rounded-xl text-slate-400 hover:text-[#1E2A39] hover:bg-slate-50 transition-all duration-200"
        aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {collapsed ? (
          <HiOutlineChevronRight className="w-4 h-4" />
        ) : (
          <HiOutlineChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Sign Out */}
      <div className="border-t border-slate-200 p-3">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 text-left cursor-pointer group"
        >
          <HiOutlineLogout className="w-5 h-5 shrink-0" />
          {!collapsed && (
            <span className="text-sm font-medium">Cerrar Sesión</span>
          )}
        </button>
      </div>
    </aside>
  )
}