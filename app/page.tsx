'use client'

import { GameBoard } from '@/components/GameBoard'
import { useSession } from '@/hooks/useSession'

export default function Home() {
  const { loading } = useSession()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return <GameBoard />
}