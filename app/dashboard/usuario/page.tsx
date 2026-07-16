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
        // Al ser un Server Component no se pueden escribir/borrar cookies directamente en el renderizado,
        // pero definimos los métodos con tipado estricto para satisfacer la firma de Supabase sin usar 'any'
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

  // 5. QR Dinámico
  const qrValue = userProfile?.id || session.user.id;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrValue}&color=006b55`;

  return (
    <div className="min-h-screen bg-[#f4fbf6] text-[#161d1a] font-sans">
      
      {/* Barra de Navegación Superior */}
      <header className="fixed top-0 w-full z-50 bg-[#f4fbf6]/80 backdrop-blur-md border-b border-[#bbcac3]/30 shadow-sm px-6 py-4">
        <div className="max-w-[1280px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#006b55] flex items-center justify-center text-white font-bold text-sm">I</div>
            <span className="font-bold text-lg tracking-tight text-[#006b55]">CONGRESO IGE 2026</span>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sm font-semibold text-[#3c4a44] hover:text-red-600 transition-colors flex items-center gap-1.5">
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
          {/* Banner de Fondo Verde */}
          <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-[-48px] bg-gradient-to-r from-[#006b55] to-[#00b894]">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>
          
          {/* Fila del Avatar y Detalles */}
          <div className="relative z-10 px-4 md:px-8 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#f4fbf6] overflow-hidden bg-[#e8f0eb] shadow-lg flex items-center justify-center text-[#006b55] text-4xl font-extrabold tracking-wider uppercase">
              {username.slice(0, 2)}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#161d1a] capitalize">
                    {username.replace(/[-_.]/g, ' ')}
                  </h1>
                  <p className="text-sm md:text-base text-[#3c4a44] font-medium flex items-center justify-center md:justify-start gap-1.5 mt-1">
                    <svg className="w-4 h-4 text-[#006b55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Asistente Registrado • {userProfile?.email}
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="bg-[#006b55]/10 text-[#006b55] px-4 py-2 rounded-xl font-semibold text-xs border border-[#006b55]/20 uppercase tracking-wider">
                    Perfil Activo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Columna Izquierda: QR de Acceso & Unidad Académica */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Tarjeta de Código QR de Acceso */}
            <div className="bg-white p-6 rounded-2xl border border-[#bbcac3]/30 shadow-sm flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-[#161d1a]">Gafete Digital</h3>
                <span className="text-xs font-bold text-[#994700] bg-[#ffdbc8] px-2.5 py-1 rounded-full">Acceso QR</span>
              </div>
              <div className="bg-[#f4fbf6] p-4 rounded-2xl border border-[#bbcac3]/20 shadow-inner">
                <img
                  src={qrCodeUrl}
                  alt="QR de Acceso"
                  width={180}
                  height={180}
                  className="rounded-xl mix-blend-multiply"
                />
              </div>
              <p className="text-[11px] font-bold text-[#3c4a44] uppercase tracking-wider mt-4 text-center">
                Muestra este código al entrar a las conferencias
              </p>
            </div>

            {/* Unidad Académica */}
            <div className="bg-white p-6 rounded-2xl border border-[#bbcac3]/30 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-[#161d1a]">Sede Académica</h3>
                <svg className="w-5 h-5 text-[#006b55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e8f0eb] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#006b55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9-5-9 5 9 5zm0 0v6m0-6L3 9m9 3l9-5" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-[#161d1a] leading-tight">
                    {userProfile?.unidades_academicas?.nombre || 'Pendiente de Asignación'}
                  </p>
                  <p className="text-xs text-[#3c4a44] mt-1 capitalize">
                    Tipo: {userProfile?.unidades_academicas?.tipo || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Credenciales / Medallas */}
            <div className="bg-white p-6 rounded-2xl border border-[#bbcac3]/30 shadow-sm">
              <h3 className="font-bold text-lg text-[#161d1a] mb-4">Tus Medallas</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center text-center p-3 rounded-xl border border-[#bbcac3]/20 bg-[#f4fbf6]/50">
                  <div className="w-10 h-10 rounded-full bg-[#ffdbc8] mb-2 flex items-center justify-center text-[#994700]">
                    🏆
                  </div>
                  <p className="text-xs font-bold text-[#161d1a]">Asistente IGE</p>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl border border-[#bbcac3]/20 bg-[#f4fbf6]/50">
                  <div className="w-10 h-10 rounded-full bg-[#6dfad2]/20 mb-2 flex items-center justify-center text-[#006b55]">
                    ⚡
                  </div>
                  <p className="text-xs font-bold text-[#161d1a]">Pase Completo</p>
                </div>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Agenda de Eventos */}
          <div className="lg:col-span-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#bbcac3]/30 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-[#161d1a]">Cronograma del Congreso</h2>
                  <p className="text-sm text-[#3c4a44]">Mantente al día con las conferencias programadas para hoy</p>
                </div>
                <span className="self-start md:self-auto bg-[#ff7f1a]/10 text-[#602a00] font-semibold text-xs px-3.5 py-1.5 rounded-full border border-[#ff7f1a]/20">
                  3 Sesiones de Aprendizaje
                </span>
              </div>

              {/* Timeline Estilizado */}
              <div className="space-y-8 relative before:absolute before:inset-0 before:right-auto before:left-[11px] before:w-0.5 before:bg-[#bbcac3]/30">
                
                {/* Evento 1 */}
                <div className="flex gap-4 relative">
                  <div className="w-6 h-6 rounded-full border-4 border-[#006b55] bg-white z-10 shrink-0"></div>
                  <div className="flex-1 -mt-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-[#006b55] uppercase tracking-wider">09:00 AM - 10:30 AM</span>
                      <span className="bg-[#ff7f1a]/10 text-[#602a00] px-2 py-0.5 rounded text-[10px] font-bold">Magistral</span>
                    </div>
                    <div className="p-4 rounded-xl border border-[#bbcac3]/20 hover:border-[#006b55]/40 hover:bg-[#f4fbf6]/30 transition-all">
                      <h4 className="font-bold text-base text-[#161d1a] hover:text-[#006b55] transition-colors">
                        El Futuro de la Inteligencia Artificial en la Gestión Empresarial
                      </h4>
                      <p className="text-xs text-[#3c4a44] mt-1">Auditorio Principal • Nivel 2</p>
                      <div className="flex items-center gap-2 mt-4">
                        <div className="w-7 h-7 rounded-full bg-[#006b55] text-white font-bold text-[10px] flex items-center justify-center">
                          HV
                        </div>
                        <span className="text-xs font-medium text-[#161d1a]">Dra. Helena Vance</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evento 2 */}
                <div className="flex gap-4 relative">
                  <div className="w-6 h-6 rounded-full border-4 border-[#006874] bg-white z-10 shrink-0"></div>
                  <div className="flex-1 -mt-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-[#006874] uppercase tracking-wider">11:15 AM - 12:45 PM</span>
                      <span className="bg-[#006874]/10 text-[#001f24] px-2 py-0.5 rounded text-[10px] font-bold">Taller</span>
                    </div>
                    <div className="p-4 rounded-xl border border-[#bbcac3]/20 hover:border-[#006874]/40 hover:bg-[#e8f0eb]/20 transition-all">
                      <h4 className="font-bold text-base text-[#161d1a] hover:text-[#006874] transition-colors">
                        Estrategias de Liderazgo y Scrum para Nuevos Emprendedores
                      </h4>
                      <p className="text-xs text-[#3c4a44] mt-1">Laboratorio de Innovación • Nivel 1</p>
                      <div className="flex items-center gap-2 mt-4">
                        <div className="w-7 h-7 rounded-full bg-[#006874] text-white font-bold text-[10px] flex items-center justify-center">
                          KS
                        </div>
                        <span className="text-xs font-medium text-[#161d1a]">Mtro. Kenji Saito</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evento 3 */}
                <div className="flex gap-4 relative">
                  <div className="w-6 h-6 rounded-full border-4 border-[#006b55] bg-white z-10 shrink-0"></div>
                  <div className="flex-1 -mt-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-[#006b55] uppercase tracking-wider">02:30 PM - 03:45 PM</span>
                      <span className="bg-[#00b894]/10 text-[#004233] px-2 py-0.5 rounded text-[10px] font-bold">Panel</span>
                    </div>
                    <div className="p-4 rounded-xl border border-[#bbcac3]/20 hover:border-[#006b55]/40 hover:bg-[#f4fbf6]/30 transition-all">
                      <h4 className="font-bold text-base text-[#161d1a] hover:text-[#006b55] transition-colors">
                        Tendencias en Sostenibilidad y Economía Circular 2026
                      </h4>
                      <p className="text-xs text-[#3c4a44] mt-1">Sala Tecnológica • Nivel 3</p>
                      <div className="flex items-center -space-x-1 mt-4">
                        <div className="w-7 h-7 rounded-full bg-[#006b55] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                          A
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#00b894] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                          B
                        </div>
                        <span className="text-xs text-[#3c4a44] pl-2 font-medium">+2 Expositores</span>
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