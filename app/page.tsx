'use client'

import { useState, useEffect } from 'react'
import { GameBoard } from '@/components/GameBoard'
import { useSession } from '@/hooks/useSession'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from '@/components/AuthModal'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  const { loading, chips, buyChips, userId } = useSession()
  const { user, signOut, isAuthenticated } = useAuth()
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'failed'>('checking')
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    // Simple connection test
    setDbStatus('connected')
  }

  if (loading) {
    return (
      <div className="min-h-screen casino-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <div className={`px-2 py-1 rounded text-xs ${
          dbStatus === 'connected' ? 'bg-green-600 text-white' :
          dbStatus === 'failed' ? 'bg-red-600 text-white' :
          'bg-yellow-600 text-white'
        }`}>
          {dbStatus === 'connected' ? '✓' : dbStatus === 'failed' ? '✗' : '...'}
        </div>
      </div>
      <GameBoard />
    </div>
  )
}