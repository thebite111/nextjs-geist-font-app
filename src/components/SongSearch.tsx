'use client'

import { useState, useEffect, useRef } from 'react'

interface Song {
  id: number
  title: string
  artist: string
  url: string
  thumbnail?: string
  fullTitle: string
}

interface SongSearchProps {
  onSongSelect: (song: Song | null) => void
  selectedSong: Song | null
  disabled?: boolean
}

export default function SongSearch({ onSongSelect, selectedSong, disabled }: SongSearchProps) {
  const [query, setQuery] = useState('')
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search songs with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length < 2) {
      setSongs([])
      setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()

        if (response.ok) {
          setSongs(data.songs)
          setIsOpen(true)
        } else {
          setError(data.error || 'Failed to search songs')
          setSongs([])
          setIsOpen(false)
        }
      } catch (err) {
        setError('Network error. Please try again.')
        setSongs([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  const handleSongSelect = (song: Song) => {
    onSongSelect(song)
    setQuery(song.fullTitle)
    setIsOpen(false)
    setSongs([])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    // Clear selection if user starts typing again
    if (selectedSong && value !== selectedSong.fullTitle) {
      onSongSelect(null)
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (songs.length > 0) setIsOpen(true)
          }}
          placeholder="Search for a song (e.g., 'NewJeans ETA')"
          disabled={disabled}
          className="w-full px-3 py-2 bg-muted border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-destructive text-xs mt-1">{error}</p>
      )}

      {isOpen && songs.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {songs.map((song) => (
            <button
              key={song.id}
              type="button"
              onClick={() => handleSongSelect(song)}
              className="w-full px-3 py-3 text-left hover:bg-muted focus:bg-muted focus:outline-none border-b border-border last:border-b-0 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {song.thumbnail && (
                  <img
                    src={song.thumbnail}
                    alt={song.fullTitle}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{song.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedSong && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-3">
            {selectedSong.thumbnail && (
              <img
                src={selectedSong.thumbnail}
                alt={selectedSong.fullTitle}
                className="w-8 h-8 rounded object-cover flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800">Selected:</p>
              <p className="text-sm text-green-700 truncate">{selectedSong.fullTitle}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                onSongSelect(null)
                setQuery('')
              }}
              className="text-green-600 hover:text-green-800 transition-colors"
              disabled={disabled}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
