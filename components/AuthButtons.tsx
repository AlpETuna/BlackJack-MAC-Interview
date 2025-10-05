'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/AuthModal'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export function AuthButtons() {
  const { user, signOut, isAuthenticated } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  console.log('AuthButtons render:', { isAuthenticated, user })

  if (isAuthenticated) {
    return (
      <div className="flex gap-2">
        <Link href="/history">
          <Button className="bg-yellow-400 text-black px-4 py-2 font-bold">
            History
          </Button>
        </Link>
        <Button 
          onClick={signOut}
          className="bg-red-500 text-white px-4 py-2 font-bold"
        >
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button 
        onClick={() => setShowAuthModal(true)}
        className="bg-green-500 text-white px-6 py-3 text-lg font-bold"
      >
        SIGN IN
      </Button>
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </>
  )
}