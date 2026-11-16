export interface LiveStreamConfig {
  isLive: boolean
  youtubeUrl: string
  videoId: string | null
  titulo: string
  updatedAt: string
}

export function isLiveStreamConfig(value: unknown): value is LiveStreamConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    'isLive' in value &&
    typeof value.isLive === 'boolean' &&
    'youtubeUrl' in value &&
    typeof value.youtubeUrl === 'string' &&
    'videoId' in value &&
    (value.videoId === null || (typeof value.videoId === 'string' && /^[\w-]{11}$/.test(value.videoId))) &&
    'titulo' in value &&
    typeof value.titulo === 'string' &&
    'updatedAt' in value &&
    typeof value.updatedAt === 'string'
  )
}
