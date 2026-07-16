import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface ProfileData {
  id: string;
  email: string;
  id_rol: number;
  unidades_academicas: {
    id: number;
    nombre: string;
    tipo: string;
  } | null;
}

export default async function UsuarioPage() {
  // 1. Resolvemos la promesa de cookies() correctamente usando await
  const cookieStore = await cookies();
  
  // 2. Inicializamos el cliente de Supabase usando el cookieStore ya resuelto
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Se ignora el error si se llama desde un Server Component
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Se ignora el error si se llama desde un Server Component
          }
        },
      },
    }
  );

  // 3. Validar sesión
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // 4. Traer perfil y unidad académica
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      id_rol,
      unidades_academicas (
        id,
        nombre,
        tipo
      )
    `)
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    console.error('Error al cargar perfil:', error);
  }

  const userProfile = profile as unknown as ProfileData;
  const username = userProfile?.email ? userProfile.email.split('@')[0] : 'Asistente';

  // 5. Detectar si existe foto de perfil (Google OAuth)
  const userAvatarUrl = session.user.user_metadata?.avatar_url || null;

  // 6. QR Dinámico (Generado con color azul marino #1e3a8a / 1e3a8a en hex)
  const qrValue = userProfile?.id || session.user.id;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrValue}&color=1e3a8a`;

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#1e293b] font-sans">
      
      {/* Barra de Navegación Superior */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#cbd5e1] shadow-sm px-6 py-4">
        <div className="max-w-[1280px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1e3a8a] flex items-center justify-center text-white font-bold text-sm">I</div>
            <span className="font-bold text-lg tracking-tight text-[#1e3a8a]">CONGRESO IGE 2026</span>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sm font-semibold text-[#475569] hover:text-[#7f1d1d] transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </form>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-24 pb-20 px-4 md:px-16 max-w-[1280px] mx-auto">
        
        {/* Cabecera del Usuario (Hero Section) */}
        <section className="mb-12">
          {/* Banner de Fondo: Azul oscuro a Vino (Burgundy) */}
          <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-[-48px] bg-gradient-to-r from-[#1e3a8a] to-[#581c87]">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>
          
          {/* Fila del Avatar y Detalles */}
          <div className="relative z-10 px-4 md:px-8 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            
            {/* Contenedor del Avatar Inteligente */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden bg-[#e2e8f0] shadow-lg flex items-center justify-center">
              {userAvatarUrl ? (
                <img 
                  src={userAvatarUrl} 
                  alt="Foto de perfil" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-[#1e3a8a] text-4xl font-extrabold tracking-wider uppercase">
                  {username.slice(0, 2)}
                </span>
              )}
            </div>

            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#0f172a] capitalize">
                    {username.replace(/[-_.]/g, ' ')}
                  </h1>
                  <p className="text-sm md:text-base text-[#475569] font-medium flex items-center justify-center md:justify-start gap-1.5 mt-1">
                    <svg className="w-4 h-4 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Asistente Registrado • {userProfile?.email}
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="bg-[#1e3a8a]/10 text-[#1e3a8a] px-4 py-2 rounded-xl font-semibold text-xs border border-[#1e3a8a]/20 uppercase tracking-wider">
                    Perfil Activo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Columna Izquierda: QR de Acceso & Sede */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Tarjeta de Código QR de Acceso */}
            <div className="bg-white p-6 rounded-2xl border border-[#cbd5e1] shadow-sm flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-[#0f172a]">Gafete Digital</h3>
                <span className="text-xs font-bold text-white bg-[#7f1d1d] px-2.5 py-1 rounded-full">Acceso QR</span>
              </div>
              <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0] shadow-inner">
                <img
                  src={qrCodeUrl}
                  alt="QR de Acceso"
                  width={180}
                  height={180}
                  className="rounded-xl mix-blend-multiply"
                />
              </div>
              <p className="text-[11px] font-bold text-[#475569] uppercase tracking-wider mt-4 text-center">
                Muestra este código al entrar a las conferencias
              </p>
            </div>

            {/* Unidad Académica */}
            <div className="bg-white p-6 rounded-2xl border border-[#cbd5e1] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-[#0f172a]">Sede Académica</h3>
                <svg className="w-5 h-5 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e2e8f0] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9-5-9 5 9 5zm0 0v6m0-6L3 9m9 3l9-5" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-[#0f172a] leading-tight">
                    {userProfile?.unidades_academicas?.nombre || 'Pendiente de Asignación'}
                  </p>
                  <p className="text-xs text-[#475569] mt-1 capitalize">
                    Tipo: {userProfile?.unidades_academicas?.tipo || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Credenciales / Medallas */}
            <div className="bg-white p-6 rounded-2xl border border-[#cbd5e1] shadow-sm">
              <h3 className="font-bold text-lg text-[#0f172a] mb-4">Tus Medallas</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center text-center p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
                  <div className="w-10 h-10 rounded-full bg-[#fef2f2] mb-2 flex items-center justify-center text-[#7f1d1d]">
                    🏆
                  </div>
                  <p className="text-xs font-bold text-[#0f172a]">Asistente IGE</p>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
                  <div className="w-10 h-10 rounded-full bg-[#eff6ff] mb-2 flex items-center justify-center text-[#1e3a8a]">
                    ⚡
                  </div>
                  <p className="text-xs font-bold text-[#0f172a]">Pase Completo</p>
                </div>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Agenda de Eventos */}
          <div className="lg:col-span-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#cbd5e1] shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-[#0f172a]">Cronograma del Congreso</h2>
                  <p className="text-sm text-[#475569]">Mantente al día con las conferencias programadas para hoy</p>
                </div>
                <span className="self-start md:self-auto bg-[#7f1d1d]/10 text-[#7f1d1d] font-semibold text-xs px-3.5 py-1.5 rounded-full border border-[#7f1d1d]/20">
                  3 Sesiones de Aprendizaje
                </span>
              </div>

              {/* Timeline Estilizado */}
              <div className="space-y-8 relative before:absolute before:inset-0 before:right-auto before:left-[11px] before:w-0.5 before:bg-[#cbd5e1]">
                
                {/* Evento 1 */}
                <div className="flex gap-4 relative">
                  <div className="w-6 h-6 rounded-full border-4 border-[#1e3a8a] bg-white z-10 shrink-0"></div>
                  <div className="flex-1 -mt-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">09:00 AM - 10:30 AM</span>
                      <span className="bg-[#7f1d1d]/10 text-[#7f1d1d] px-2 py-0.5 rounded text-[10px] font-bold">Magistral</span>
                    </div>
                    <div className="p-4 rounded-xl border border-[#e2e8f0] hover:border-[#1e3a8a]/40 hover:bg-[#f8fafc] transition-all">
                      <h4 className="font-bold text-base text-[#0f172a] hover:text-[#1e3a8a] transition-colors">
                        El Futuro de la Inteligencia Artificial en la Gestión Empresarial
                      </h4>
                      <p className="text-xs text-[#475569] mt-1">Auditorio Principal • Nivel 2</p>
                      <div className="flex items-center gap-2 mt-4">
                        <div className="w-7 h-7 rounded-full bg-[#1e3a8a] text-white font-bold text-[10px] flex items-center justify-center">
                          HV
                        </div>
                        <span className="text-xs font-medium text-[#0f172a]">Dra. Helena Vance</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evento 2 */}
                <div className="flex gap-4 relative">
                  <div className="w-6 h-6 rounded-full border-4 border-[#7f1d1d] bg-white z-10 shrink-0"></div>
                  <div className="flex-1 -mt-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-[#7f1d1d] uppercase tracking-wider">11:15 AM - 12:45 PM</span>
                      <span className="bg-[#1e3a8a]/10 text-[#1e3a8a] px-2 py-0.5 rounded text-[10px] font-bold">Taller</span>
                    </div>
                    <div className="p-4 rounded-xl border border-[#e2e8f0] hover:border-[#7f1d1d]/40 hover:bg-[#f8fafc] transition-all">
                      <h4 className="font-bold text-base text-[#0f172a] hover:text-[#7f1d1d] transition-colors">
                        Estrategias de Liderazgo y Scrum para Nuevos Emprendedores
                      </h4>
                      <p className="text-xs text-[#475569] mt-1">Laboratorio de Innovación • Nivel 1</p>
                      <div className="flex items-center gap-2 mt-4">
                        <div className="w-7 h-7 rounded-full bg-[#7f1d1d] text-white font-bold text-[10px] flex items-center justify-center">
                          KS
                        </div>
                        <span className="text-xs font-medium text-[#0f172a]">Mtro. Kenji Saito</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evento 3 */}
                <div className="flex gap-4 relative">
                  <div className="w-6 h-6 rounded-full border-4 border-[#1e3a8a] bg-white z-10 shrink-0"></div>
                  <div className="flex-1 -mt-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">02:30 PM - 03:45 PM</span>
                      <span className="bg-[#1e3a8a]/10 text-[#1e3a8a] px-2 py-0.5 rounded text-[10px] font-bold">Panel</span>
                    </div>
                    <div className="p-4 rounded-xl border border-[#e2e8f0] hover:border-[#1e3a8a]/40 hover:bg-[#f8fafc] transition-all">
                      <h4 className="font-bold text-base text-[#0f172a] hover:text-[#1e3a8a] transition-colors">
                        Tendencias en Sostenibilidad y Economía Circular 2026
                      </h4>
                      <p className="text-xs text-[#475569] mt-1">Sala Tecnológica • Nivel 3</p>
                      <div className="flex items-center -space-x-1 mt-4">
                        <div className="w-7 h-7 rounded-full bg-[#1e3a8a] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                          A
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#7f1d1d] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                          B
                        </div>
                        <span className="text-xs text-[#475569] pl-2 font-medium">+2 Expositores</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}