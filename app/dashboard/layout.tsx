import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from './Sidebar'
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

  // Mapear nivel_acceso numérico a role string para el Sidebar
  const roleMap: Record<number, 'admin' | 'encargado' | 'user'> = {
    3: 'admin',
    2: 'encargado',
    1: 'user',
  }
  const sidebarRole = roleMap[profile.nivel_acceso] ?? 'user'

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar
        user={{
          name: userName,
          email: userEmail,
          role: sidebarRole,
          nivelAcceso: profile.nivel_acceso,
        }}
      />
      <main className="flex-1 ml-64 p-8 animate-fadeIn">
        {children}
      </main>
    </div>
  )
}
