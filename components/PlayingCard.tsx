'use client'

import { Card as GameCard, getCardSymbol, getCardColor } from '@/lib/game'
import { cn } from '@/lib/utils'

interface PlayingCardProps {
  card: GameCard
  hidden?: boolean
  className?: string
  isWinning?: boolean
  isLosing?: boolean
  dealDelay?: number
}

export function PlayingCard({ 
  card, 
  hidden = false, 
  className, 
  isWinning = false, 
  isLosing = false,
  dealDelay = 0
}: PlayingCardProps) {
  if (hidden) {
    return (
      <div 
        className={cn(
          "w-20 h-28 bg-blue-900 border-2 border-blue-700 rounded-lg flex items-center justify-center",
          "bg-gradient-to-br from-blue-800 to-blue-900 animate-card-deal",
          className
        )}
        style={{ animationDelay: `${dealDelay}ms` }}
      >
        <div className="text-white text-sm font-bold">🂠</div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "w-20 h-28 bg-white border-2 border-gray-300 rounded-lg flex flex-col justify-between p-2",
        "transition-all duration-300 animate-card-deal",
        className
      )}
      style={{ animationDelay: `${dealDelay}ms` }}
    >
      <div className={cn("text-sm font-bold", getCardColor(card.suit))}>
        <div>{card.rank}</div>
        <div>{getCardSymbol(card.suit)}</div>
      </div>
      <div className={cn("text-3xl self-center", getCardColor(card.suit))}>
        {getCardSymbol(card.suit)}
      </div>
      <div className={cn("text-sm font-bold self-end rotate-180", getCardColor(card.suit))}>
        <div>{card.rank}</div>
        <div>{getCardSymbol(card.suit)}</div>
      </div>
    </div>
  )
}