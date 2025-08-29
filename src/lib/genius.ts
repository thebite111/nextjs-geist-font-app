const GENIUS_API_BASE = 'https://api.genius.com'
const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN

export interface GeniusSong {
  id: number
  title: string
  primary_artist: {
    name: string
  }
  url: string
  header_image_thumbnail_url?: string
  header_image_url?: string
}

export interface GeniusSearchResponse {
  response: {
    hits: Array<{
      type: string
      result: GeniusSong
    }>
  }
}

export const searchSongs = async (query: string): Promise<GeniusSong[]> => {
  if (!GENIUS_ACCESS_TOKEN) {
    throw new Error('Genius API access token not configured')
  }

  if (!query || query.trim().length < 2) {
    return []
  }

  try {
    const response = await fetch(
      `${GENIUS_API_BASE}/search?q=${encodeURIComponent(query.trim())}`,
      {
        headers: {
          'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Genius API error: ${response.status} ${response.statusText}`)
    }

    const data: GeniusSearchResponse = await response.json()
    
    // Filter only song results and return the song data
    return data.response.hits
      .filter(hit => hit.type === 'song')
      .map(hit => hit.result)
      .slice(0, 10) // Limit to 10 results
  } catch (error) {
    console.error('Genius API search error:', error)
    throw new Error('Failed to search songs')
  }
}

export const getSongById = async (geniusId: number): Promise<GeniusSong | null> => {
  if (!GENIUS_ACCESS_TOKEN) {
    throw new Error('Genius API access token not configured')
  }

  try {
    const response = await fetch(
      `${GENIUS_API_BASE}/songs/${geniusId}`,
      {
        headers: {
          'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Genius API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.response.song
  } catch (error) {
    console.error('Genius API get song error:', error)
    throw new Error('Failed to get song details')
  }
}

export const formatSongTitle = (song: GeniusSong): string => {
  return `${song.title} - ${song.primary_artist.name}`
}

export const validateSongExists = async (geniusId: number): Promise<boolean> => {
  try {
    const song = await getSongById(geniusId)
    return song !== null
  } catch (error) {
    return false
  }
}
