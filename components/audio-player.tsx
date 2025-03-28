"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"

interface AudioPlayerProps {
  isPlaying: boolean
}

export default function AudioPlayer({ isPlaying }: AudioPlayerProps) {
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/grazzabeat.mp3")
      audioRef.current.loop = true
      audioRef.current.volume = 0.5
    }

    // Play or pause based on game state and mute state
    if (isPlaying && !isMuted) {
      const playPromise = audioRef.current.play()

      // Handle the play promise to avoid uncaught promise errors
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log("Audio playback was prevented:", err)
          // User interaction might be needed for autoplay
          const handleUserInteraction = () => {
            audioRef.current?.play()
            document.removeEventListener("click", handleUserInteraction)
            document.removeEventListener("keydown", handleUserInteraction)
          }

          document.addEventListener("click", handleUserInteraction)
          document.addEventListener("keydown", handleUserInteraction)
        })
      }
    } else {
      audioRef.current.pause()
    }

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, isMuted])

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <button
      onClick={toggleMute}
      className="absolute top-6 left-6 z-20 bg-[#40442c]/10 p-3 rounded-full hover:bg-[#40442c]/20 transition-colors"
      aria-label={isMuted ? "Unmute music" : "Mute music"}
    >
      {isMuted ? <VolumeX className="w-6 h-6 text-[#40442c]" /> : <Volume2 className="w-6 h-6 text-[#40442c]" />}
    </button>
  )
}

