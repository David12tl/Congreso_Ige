import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from './Sidebar'

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

  const role = (user.user_metadata?.role as string) ?? 'user'
  const nivelAcceso = (user.user_metadata?.nivel_acceso as number) ?? 1
  const userName = (user.user_metadata?.full_name as string) ?? user.email ?? ''
  const userEmail = user.email ?? ''

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar
        user={{
          name: userName,
          email: userEmail,
          role: role as 'admin' | 'encargado' | 'user',
          nivelAcceso,
        }}
      />
      <main className="flex-1 ml-64 p-8 animate-fadeIn">
        {children}
      </main>
    </div>
  )
}