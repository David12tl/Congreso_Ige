import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Interfaz para tipar los datos que obtendremos de la BD
interface ProfileData {
  id: string;
  email: string;
  id_rol: number;
  unidades_academicas: {
    nombre: string;
    tipo: string;
  } | null;
}

export default async function UsuarioPage() {
  const supabase = await createClient();

  // 1. Verificar la sesión del usuario en el servidor
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // 2. Obtener los datos del perfil y su unidad académica mediante JOIN
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      id_rol,
      unidades_academicas (
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

  // 3. Generar la URL del QR de acceso del usuario (puedes usar una API pública como goqr.me para generarlo rápido)
  const qrValue = userProfile?.id || session.user.id;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrValue}&color=1e293b`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 py-12 px-4 flex flex-col items-center justify-center">
      {/* Contenedor Principal con animación sutil */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 transition-all hover:shadow-slate-300/50 hover:shadow-3xl">
        
        {/* Cabecera de la Tarjeta / Gafete */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-center relative overflow-hidden">
          {/* Círculos decorativos de fondo */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          
          <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold uppercase tracking-wider rounded-full backdrop-blur-sm mb-3">
            Asistente Oficial
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">CONGRESO IGE 2026</h2>
          <p className="text-blue-100 text-xs mt-1">Innovación & Gestión Empresarial</p>
        </div>

        {/* Cuerpo de la Tarjeta */}
        <div className="p-8 flex flex-col items-center text-center">
          
          {/* Avatar / Inicial del Usuario */}
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-200 -mt-16 border-4 border-white">
            {userProfile?.email ? userProfile.email[0].toUpperCase() : 'U'}
          </div>

          {/* Información del Usuario */}
          <div className="mt-4">
            <h3 className="text-xl font-bold text-slate-800 break-all">
              {userProfile?.email?.split('@')[0]}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">{userProfile?.email}</p>
          </div>

          {/* Unidad Académica */}
          <div className="w-full bg-slate-50 rounded-2xl p-4 mt-6 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Sede Académica
            </span>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {userProfile?.unidades_academicas?.nombre || 'No asignada todavía'}
            </p>
            {userProfile?.unidades_academicas?.tipo && (
              <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-medium rounded-md mt-1.5 capitalize">
                Modalidad: {userProfile.unidades_academicas.tipo}
              </span>
            )}
          </div>

          {/* Divisor Estilo Boleto / Gafete */}
          <div className="w-full flex items-center my-6">
            <div className="w-3 h-6 bg-slate-100 rounded-r-full -ml-8 border-y border-r border-slate-200/50"></div>
            <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2"></div>
            <div className="w-3 h-6 bg-slate-100 rounded-l-full -mr-8 border-y border-l border-slate-200/50"></div>
          </div>

          {/* Sección del Código QR */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-3 rounded-2xl shadow-inner border border-slate-100/80">
              <img
                src={qrCodeUrl}
                alt="Código QR de Acceso"
                width={160}
                height={160}
                className="rounded-xl"
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">
              Presenta este QR en taquilla
            </p>
          </div>
        </div>

        {/* Footer de la Tarjeta */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
          <span>ID: {userProfile?.id?.slice(0, 8)}...</span>
          <span className="font-medium text-slate-500">Julio 2026</span>
        </div>
      </div>

      {/* Botón flotante para cerrar sesión de manera limpia */}
      <form action="/auth/signout" method="post" className="mt-8">
        <button 
          type="submit"
          className="text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z"/>
            <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z"/>
          </svg>
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}