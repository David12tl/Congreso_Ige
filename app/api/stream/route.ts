import { get, put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import defaultStreamConfig from '../../../data/stream-config.json'
import { createClient } from '@/lib/supabase/server'
import { extractYouTubeVideoId } from '@/lib/youtube'
import { isLiveStreamConfig, type LiveStreamConfig } from '@/types/live-stream'

export const runtime = 'nodejs'

const configPathname = 'stream-config.json'
const noCacheHeaders = { 'Cache-Control': 'no-store' }

function hasBlobStorageAccess(): boolean {
  return Boolean(
    (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID) ||
    process.env.BLOB_READ_WRITE_TOKEN,
  )
}

export async function GET() {
  if (!hasBlobStorageAccess()) {
    return NextResponse.json(defaultStreamConfig, { headers: noCacheHeaders })
  }

  try {
    const blob = await get(configPathname, { access: 'private', useCache: false })
    if (!blob) {
      return NextResponse.json(defaultStreamConfig, { headers: noCacheHeaders })
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
    console.error('Error en GET /api/stream:', error)
    return NextResponse.json(
      { error: 'No se pudo cargar la configuración de transmisión.' },
      { status: 500, headers: noCacheHeaders },
    )
  }
}

export async function POST(request: Request) {
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

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'La solicitud debe contener una configuración válida.' },
      { status: 400, headers: noCacheHeaders },
    )
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('isLive' in payload) ||
    typeof payload.isLive !== 'boolean' ||
    !('youtubeUrl' in payload) ||
    typeof payload.youtubeUrl !== 'string'
  ) {
    return NextResponse.json(
      { error: 'Proporciona un estado y un enlace de YouTube válidos.' },
      { status: 400, headers: noCacheHeaders },
    )
  }

  const youtubeUrl = payload.youtubeUrl.trim()
  let videoId: string | null = null

  if (youtubeUrl) {
    try {
      videoId = extractYouTubeVideoId(youtubeUrl)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'El enlace de YouTube no es válido.'
      return NextResponse.json({ error: message }, { status: 400, headers: noCacheHeaders })
    }
  } else if (payload.isLive) {
    return NextResponse.json(
      { error: 'Agrega el enlace de YouTube antes de activar la transmisión.' },
      { status: 400, headers: noCacheHeaders },
    )
  }

  const title = 'titulo' in payload && typeof payload.titulo === 'string'
    ? payload.titulo.trim().slice(0, 120)
    : ''

  const config: LiveStreamConfig = {
    isLive: payload.isLive,
    youtubeUrl,
    videoId,
    titulo: title || 'Congreso IGE 2026',
    updatedAt: new Date().toISOString(),
  }

  if (!hasBlobStorageAccess()) {
    return NextResponse.json(
      { error: 'Vercel Blob no está conectado a este entorno del proyecto.' },
      { status: 503, headers: noCacheHeaders },
    )
  }

  try {
    await put(configPathname, JSON.stringify(config), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    })
  } catch (error) {
    console.error('Error en POST /api/stream al guardar en Vercel Blob:', error)
    return NextResponse.json(
      { error: 'No se pudo guardar la configuración en Vercel Blob.' },
      { status: 500, headers: noCacheHeaders },
    )
  }

  return NextResponse.json(config, { headers: noCacheHeaders })
}
