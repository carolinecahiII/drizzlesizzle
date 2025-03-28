import Image from "next/image"

interface ScoreCounterProps {
  score: number
}

export default function ScoreCounter({ score }: ScoreCounterProps) {
  const formattedScore = score.toString().padStart(5, "0")

  return (
    <div className="absolute top-6 right-6 flex items-center gap-3 bg-[#40442c]/10 px-5 py-3 rounded-lg backdrop-blur-sm">
      <div className="relative w-16 h-16">
        <Image
          src="/images/plate.png"
          alt="Dish"
          fill
          className="object-contain image-rendering-pixelated"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <span className="font-garamond text-3xl tracking-wider text-[#40442c]">Plates Saved: {formattedScore}</span>
    </div>
  )
}

