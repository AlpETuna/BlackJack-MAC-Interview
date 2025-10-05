'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useSession() {
  const [sessionId, setSessionId] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [chips, setChips] = useState<number>(1000)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initSession()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          initSession()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const initSession = async () => {
    try {
      // Get current auth user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        // Authenticated user - use their auth ID
        const authUserId = authUser.id
        setSessionId(authUserId)
        
        // Check if user record exists
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('session_id', authUserId)
          .maybeSingle()

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError
        }

        if (existingUser) {
          setUserId(existingUser.id)
          setChips(existingUser.chips)
          console.log('Authenticated user loaded:', existingUser.id)
        } else {
          // Create new user record for authenticated user
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({ session_id: authUserId, chips: 1000 })
            .select()
            .single()

          if (insertError) throw insertError

          if (newUser) {
            setUserId(newUser.id)
            setChips(newUser.chips)
            console.log('New authenticated user created:', newUser.id)
          }
        }
      } else {
        // Guest user - use browser session
        let storedSessionId = localStorage.getItem('blackjack-session')
        
        if (!storedSessionId) {
          storedSessionId = crypto.randomUUID()
          localStorage.setItem('blackjack-session', storedSessionId)
        }

        setSessionId(storedSessionId)

        // Check if guest user exists
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('session_id', storedSessionId)
          .maybeSingle()

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError
        }

        if (existingUser) {
          setUserId(existingUser.id)
          setChips(existingUser.chips)
          console.log('Guest user loaded:', existingUser.id)
        } else {
          // Create new guest user
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({ session_id: storedSessionId, chips: 1000 })
            .select()
            .single()

          if (insertError) throw insertError

          if (newUser) {
            setUserId(newUser.id)
            setChips(newUser.chips)
            console.log('New guest user created:', newUser.id)
          }
        }
      }
    } catch (error) {
      console.error('Session init error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateChips = async (newChips: number) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ chips: newChips, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error
      
      setChips(newChips)
      console.log('Chips updated:', newChips)
    } catch (error) {
      console.error('Update chips error:', error)
      // Still update local state even if DB update fails
      setChips(newChips)
    }
  }

  const buyChips = async (amount: number) => {
    const newChips = chips + amount
    await updateChips(newChips)
  }

  return {
    sessionId,
    userId,
    chips,
    loading,
    updateChips,
    buyChips
  }
}