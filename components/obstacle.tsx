"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"

interface ObstacleProps {
  type: string
  x: number
  y: number
  width: number
  height: number
  image: string
}

export default function Obstacle({ type, x, y, width, height, image }: ObstacleProps) {
  const bounceRef = useRef<number>(0)
  const rotationRef = useRef<number>(0)

  // Unique bounce pattern for each obstacle type
  const bounceSpeed = useRef<number>(
    type === "plate"
      ? 150
      : type === "pan"
        ? 180
        : type === "tomato"
          ? 120
          : type === "lemon"
            ? 130
            : type === "garlic"
              ? 140
              : 150,
  )

  const rotationAmount = useRef<number>(
    type === "plate"
      ? 2
      : type === "pan"
        ? 3
        : type === "tomato"
          ? 5
          : type === "lemon"
            ? 4
            : type === "garlic"
              ? 6
              : 3,
  )

  // Bounce animation
  useEffect(() => {
    let animationFrame: number

    const animate = () => {
      // Oscillate for bounce effect
      bounceRef.current = Math.sin(Date.now() / bounceSpeed.current) * 4

      // Slight rotation for more dynamic movement
      rotationRef.current = Math.sin(Date.now() / (bounceSpeed.current * 1.5)) * rotationAmount.current

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <div
      className="absolute transition-transform"
      style={{
        left: `${x}px`,
        top: `${y + bounceRef.current}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotationRef.current}deg)`,
        transition: "transform 0.1s ease-out",
      }}
    >
      <div className="relative w-full h-full">
        <Image
          src={image || "/placeholder.svg"}
          alt={type}
          fill
          className="object-contain image-rendering-pixelated"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </div>
  )
}

