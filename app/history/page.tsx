'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useSession'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type GameHistory = {
  id: string
  bet_amount: number
  result: 'win' | 'lose' | 'push'
  player_hand: string
  dealer_hand: string
  created_at: string
}

export default function HistoryPage() {
  const { userId, loading } = useSession()
  const { user, isAuthenticated } = useAuth()
  const [history, setHistory] = useState<GameHistory[]>([])
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    totalWinnings: 0
  })

  useEffect(() => {
    if (userId) {
      fetchHistory()
    }
  }, [userId])

  const fetchHistory = async () => {
    if (!userId) return

    const { data } = await supabase
      .from('game_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      setHistory(data)
      
      const totalGames = data.length
      const wins = data.filter(g => g.result === 'win').length
      const losses = data.filter(g => g.result === 'lose').length
      const pushes = data.filter(g => g.result === 'push').length
      const totalWinnings = data.reduce((sum, game) => {
        if (game.result === 'win') return sum + game.bet_amount
        if (game.result === 'lose') return sum - game.bet_amount
        return sum
      }, 0)

      setStats({ totalGames, wins, losses, pushes, totalWinnings })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Sign In Required</h1>
          <p className="text-gray-400 mb-6">Please sign in to view your game history</p>
          <Link href="/">
            <Button className="bg-white text-black hover:bg-gray-200">
              Back to Game
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Game History</h1>
          <Link href="/">
            <Button variant="outline">Back to Game</Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGames}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-600">Wins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-600">Losses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.losses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-600">Pushes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pushes}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Net Winnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                stats.totalWinnings >= 0 ? "text-green-600" : "text-red-600"
              )}>
                ${stats.totalWinnings}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No games played yet. Start playing to see your history!
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "px-2 py-1 rounded text-sm font-medium",
                        game.result === 'win' ? 'bg-green-100 text-green-800' :
                        game.result === 'lose' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      )}>
                        {game.result.toUpperCase()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Bet: ${game.bet_amount}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(game.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}