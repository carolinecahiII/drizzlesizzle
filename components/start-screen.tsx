"use client"

import Image from "next/image"

interface StartScreenProps {
  onStart: (character: "sizzle" | "drizzle") => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-4">

      <div className="flex flex-col sm:flex-row gap-12 items-center">
        <button
          onClick={() => onStart("sizzle")}
          className="flex flex-col items-center gap-4 p-6 bg-[#40442c]/10 hover:bg-[#40442c]/20 rounded-lg transition-colors"
        >
          <div className="relative w-[128px] h-[192px]">
            <Image
              src="/images/sizzle.png"
              alt="Sizzle"
              fill
              className="object-contain image-rendering-pixelated"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <span className="text-2xl font-garamond text-[#40442c]">Play as Sizzle</span>
        </button>

        <button
          onClick={() => onStart("drizzle")}
          className="flex flex-col items-center gap-4 p-6 bg-[#40442c]/10 hover:bg-[#40442c]/20 rounded-lg transition-colors"
        >
          <div className="relative w-[128px] h-[192px]">
            <Image
              src="/images/drizzle.png"
              alt="Drizzle"
              fill
              className="object-contain image-rendering-pixelated"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <span className="text-2xl font-garamond text-[#40442c]">Play as Drizzle</span>
        </button>
      </div>

      <div className="mt-12 text-center text-lg font-garamond">
        <p className="text-2xl mb-4 text-[#40442c]">Jump over kitchen obstacles and see how far you can go!</p><br></br>
        <p className="text-[#40442c]/70">Press SPACE to jump</p>
        <p className="text-[#40442c]/70">Jump repeatedly to avoid obstacles</p>
      </div>
    </div>
  )
}

