import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, _headers) {
          // ─── ESCUDO PROTECTOR PARA NEXT.JS ───
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // El método setAll fue llamado desde un Server Component de renderizado.
            // Se puede ignorar con seguridad ya que las mutaciones reales ocurren
            // en el Middleware o en tus Route Handlers (como auth/callback/route.ts).
          }
        },
      },
    },
  );
}