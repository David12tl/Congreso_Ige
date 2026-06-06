'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'
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
  // ─── OPCIONES COMPARTIDAS / CONDICIONALES DE INICIO ─────────────────
  {
    label: 'Dashboard',
    href: '/dashboard/admin',
    icon: <HiOutlineViewGrid className="w-5 h-5" />,
    roles: ['admin'], // Admin y Encargado tienen dashboards con métricas
  },
  {
    label: 'Dashboard',
    href: '/dashboard/encargados',
    icon: <HiOutlineViewGrid className="w-5 h-5" />,
    roles: ['encargado'], // Admin y Encargado tienen dashboards con métricas
  },
  {
    label: 'Perfil',
    href: '/dashboard/perfil',
    icon: <HiOutlineIdentification className="w-5 h-5" />,
    roles: ['user'], // El usuario común aterriza directo en su perfil
  },

  // ─── OPCIONES EXCLUSIVAS DE ADMINISTRADOR ───────────────────────────
  {
    label: 'Listas por UA',
    href: '/dashboard/listas-ua',
    icon: <HiOutlineOfficeBuilding className="w-5 h-5" />,
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

  // ─── OPCIONES EXCLUSIVAS DE ENCARGADO ───────────────────────────────
  {
    label: 'Lista UA Encargada',
    href: '/dashboard/mi-ua',
    icon: <HiOutlineOfficeBuilding className="w-5 h-5" />,
    roles: ['encargado'],
  },
  {
    label: 'Usuarios por UA',
    href: '/dashboard/usuarios-ua',
    icon: <HiOutlineUsers className="w-5 h-5" />,
    roles: ['encargado'],
  },
  {
    label: 'Tickets',
    href: '/dashboard/tickets-gestion',
    icon: <HiOutlineTicket className="w-5 h-5" />,
    roles: ['encargado'],
  },
  {
    label: 'Generar Tokens',
    href: '/dashboard/generar-tokens',
    icon: <HiOutlinePlusCircle className="w-5 h-5" />,
    roles: ['encargado'],
  },

  // ─── OPCIONES EXCLUSIVAS DE USUARIO ASISTENTE ────────────────────────
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

  // ─── GLOBAL (Todos ven el mapa del evento) ──────────────────────────
  {
    label: 'Mapa del Evento',
    href: '/dashboard/mapa',
    icon: <HiOutlineMap className="w-5 h-5" />,
    roles: ['admin', 'encargado', 'user'],
  },

  // ─── USUARIOS GLOBAL (Acceso jerárquico según tu especificación) ───
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

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [collapsed, setCollapsed] = useState(false)

  // Filtra de forma estricta asegurando que solo se renderice lo que indica la imagen
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role),
  )

  const handleSignOut = async () => {
    console.log("🔄 [DEBUG LOGOUT 1/3]: Iniciando proceso de cierre de sesión...")

    try {
      // 1. Forzar a Supabase a destruir los tokens de sesión locales y del servidor
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("❌ [ERROR SUPABASE LOGOUT]: Error devuelto por Supabase:", error.message)
        alert(`No se pudo cerrar la sesión: ${error.message}`)
        return
      }

      console.log("✅ [DEBUG LOGOUT 2/3]: Sesión destruida con éxito en Supabase.")

      // 2. Limpiar la caché de rutas de Next.js para asegurar que los Server Components se enteren del cambio de auth
      router.refresh()

      console.log("🚀 [DEBUG LOGOUT 3/3]: Redirigiendo limpiamente a la raíz del sitio...")

      // 3. Redirigir al inicio de forma inmediata
      router.push('/')
    } catch (catchError) {
      console.error("💥 [CRASH CRÍTICO EN LOGOUT]: Ocurrió un error inesperado al cerrar sesión:", catchError)
    }
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
          className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300 text-left cursor-pointer group"
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
