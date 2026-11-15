const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
])

export function extractYouTubeVideoId(value: string): string {
  let url: URL

  try {
    url = new URL(value.trim())
  } catch {
    throw new Error('Ingresa un enlace válido de YouTube.')
  }

  if (!['https:', 'http:'].includes(url.protocol) || !YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error('El enlace debe pertenecer a YouTube.')
  }

  const videoId = url.hostname.toLowerCase() === 'youtu.be'
    ? url.pathname.split('/')[1]
    : url.pathname.match(/^\/(?:live|shorts|embed)\/([^/]+)/)?.[1] ?? url.searchParams.get('v')

  if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
    throw new Error('No se encontró un código de video válido en el enlace.')
  }

  return videoId
}
