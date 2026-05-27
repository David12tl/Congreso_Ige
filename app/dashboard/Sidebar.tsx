'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/auth/actions'
import {
  HiOutlineViewGrid,
  HiOutlineCalendar,
  HiOutlineTicket,
  HiOutlineMap,
  HiOutlineUserGroup,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUsers,
  HiOutlineGlobe,
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
    label: 'Panel General',
    href: '/dashboard',
    icon: <HiOutlineViewGrid className="w-5 h-5" />,
    roles: ['admin', 'encargado', 'user'],
  },
  {
    label: 'Mi Agenda',
    href: '/dashboard/agenda',
    icon: <HiOutlineCalendar className="w-5 h-5" />,
    roles: ['admin', 'encargado', 'user'],
  },
  {
    label: 'Mis Tickets',
    href: '/dashboard/tickets',
    icon: <HiOutlineTicket className="w-5 h-5" />,
    roles: ['admin', 'encargado', 'user'],
  },
  {
    label: 'Mi Land',
    href: '/dashboard/land',
    icon: <HiOutlineGlobe className="w-5 h-5" />,
    roles: ['encargado', 'admin'],
  },
  {
    label: 'Mapa del Evento',
    href: '/dashboard/mapa',
    icon: <HiOutlineMap className="w-5 h-5" />,
    roles: ['admin', 'encargado', 'user'],
  },
  {
    label: 'Asistentes',
    href: '/dashboard/asistentes',
    icon: <HiOutlineUserGroup className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Usuarios',
    href: '/dashboard/usuarios',
    icon: <HiOutlineUsers className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Configuración',
    href: '/dashboard/configuracion',
    icon: <HiOutlineCog className="w-5 h-5" />,
    roles: ['admin'],
  },
]

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  encargado: 'Encargado de Land',
  user: 'Asistente',
}

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role),
  )

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out
        bg-slate-950/40 backdrop-blur-md
        border-r border-white/5
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Header / Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-white/5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">IGE</span>
        </div>
        {!collapsed && (
          <span className="text-white font-semibold text-lg whitespace-nowrap">
            Congreso IGE
          </span>
        )}
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="px-6 py-4 border-b border-white/5">
          <p className="text-white text-sm font-medium truncate">
            {user.name}
          </p>
          <p className="text-gray-400 text-xs truncate mt-0.5">
            {user.email}
          </p>
          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${
                  isActive
                    ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="mx-3 mb-2 flex items-center justify-center h-8 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-200"
        aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {collapsed ? (
          <HiOutlineChevronRight className="w-4 h-4" />
        ) : (
          <HiOutlineChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Sign Out */}
      <div className="border-t border-white/5 p-3">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
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