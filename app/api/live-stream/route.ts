import { get, put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import defaultLiveStreamConfig from '../../../data/live-stream.json'
import { createClient } from '@/lib/supabase/server'
import { extractYouTubeVideoId } from '@/lib/youtube'

export const runtime = 'nodejs'

const configPathname = 'live-stream.json'
const noCacheHeaders = { 'Cache-Control': 'no-store' }

interface LiveStreamConfig {
  youtubeVideoId: string
}

function hasBlobStorageAccess(): boolean {
  return Boolean(
    (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID) ||
    process.env.BLOB_READ_WRITE_TOKEN,
  )
}

function isLiveStreamConfig(value: unknown): value is LiveStreamConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    'youtubeVideoId' in value &&
    typeof value.youtubeVideoId === 'string' &&
    /^[\w-]{11}$/.test(value.youtubeVideoId)
  )
}

export async function GET() {
  if (!hasBlobStorageAccess()) {
    return NextResponse.json(defaultLiveStreamConfig, { headers: noCacheHeaders })
  }

  try {
    const blob = await get(configPathname, { access: 'private', useCache: false })
    if (!blob) {
      return NextResponse.json(defaultLiveStreamConfig, { headers: noCacheHeaders })
    }

    if (!blob.stream) {
      throw new Error('El archivo JSON de transmisión no contiene datos.')
    }

    const config: unknown = await new Response(blob.stream).json()
    if (!isLiveStreamConfig(config)) {
      throw new Error('El archivo JSON de transmisión tiene un formato no válido.')
    }

    return NextResponse.json(config, { headers: noCacheHeaders })
  } catch (error) {
    console.error('Error al leer la configuración de transmisión:', error)
    return NextResponse.json(
      { error: 'No se pudo cargar el enlace de transmisión.' },
      { status: 500, headers: noCacheHeaders },
    )
  }
}

export async function PUT(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'La solicitud debe contener un enlace válido.' },
      { status: 400, headers: noCacheHeaders },
    )
  }

  if (!body || typeof body !== 'object' || !('youtubeUrl' in body) || typeof body.youtubeUrl !== 'string') {
    return NextResponse.json(
      { error: 'Ingresa un enlace válido de YouTube.' },
      { status: 400, headers: noCacheHeaders },
    )
  }

  let youtubeVideoId: string
  try {
    youtubeVideoId = extractYouTubeVideoId(body.youtubeUrl)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'El enlace de YouTube no es válido.'
    return NextResponse.json({ error: message }, { status: 400, headers: noCacheHeaders })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    console.error('Error al verificar el administrador de la transmisión:', authError.message)
  }

  if (authError || !user) {
    return NextResponse.json({ error: 'Inicia sesión para cambiar la transmisión.' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id_rol')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Error al verificar el rol del administrador:', profileError.message)
    return NextResponse.json({ error: 'No se pudo verificar el permiso de administrador.' }, { status: 500 })
  }

  if (profile?.id_rol !== 1) {
    return NextResponse.json({ error: 'Solo un administrador puede cambiar la transmisión.' }, { status: 403 })
  }

  try {
    await put(configPathname, JSON.stringify({ youtubeVideoId }), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    })
  } catch (error) {
    console.error('Error al guardar la configuración de transmisión en Vercel Blob:', error)
    return NextResponse.json(
      { error: 'No se pudo guardar el enlace. Verifica que Vercel Blob esté conectado al proyecto.' },
      { status: 500, headers: noCacheHeaders },
    )
  }

  return NextResponse.json({ youtubeVideoId }, { headers: noCacheHeaders })
}
