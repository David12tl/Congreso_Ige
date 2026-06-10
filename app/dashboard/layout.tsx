import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { MobileNavbar } from './MobileNavbar'
import { getUserProfile } from '@/src/db/perfiles'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // --- CONSULTAR PERFIL REAL DESDE LA BASE DE DATOS ---
  // No confiar en user_metadata que puede estar desactualizada
  const profile = await getUserProfile(user.id)

  // Usar el nombre del perfil o metadata, lo que exista
  const userName = (user.user_metadata?.full_name as string) ?? user.email ?? ''
  const userEmail = user.email ?? ''

  // Mapear id_rol a role string para el Sidebar
  // id_rol: 1=admin, 2=encargado, 3=user
  const roleMap: Record<number, 'admin' | 'encargado' | 'user'> = {
    1: 'admin',
    2: 'encargado',
    3: 'user',
  }
  const sidebarRole = roleMap[profile.id_rol] ?? 'user'

  const userNav = {
    name: userName,
    email: userEmail,
    role: sidebarRole,
    nivelAcceso: profile.id_rol,
  }

  return (
    <div className="flex min-h-screen bg-congreso-bgDark">
      {/* Sidebar para escritorio: visible solo en md+ */}
      <div className="hidden md:block">
        <Sidebar user={userNav} />
      </div>

      {/* Contenedor principal: sin margen izquierdo en móvil, con ml-64 en escritorio */}
      <div className="flex flex-col flex-1 md:ml-64 min-w-0">
        {/* MobileNavbar: visible solo en móvil */}
        <MobileNavbar user={userNav} />
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-6 animate-fadeIn overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
