'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PlayingCard } from '@/components/PlayingCard'
import { AuthModal } from '@/components/AuthModal'
import { useSession } from '@/hooks/useSession'
import { useAuth } from '@/hooks/useAuth'
import { triggerConfetti, stopConfetti } from '@/lib/confetti'
import Link from 'next/link'
import { 
  GameState, 
  createDeck, 
  dealCard, 
  calculateHandValue,
  Card as GameCard
} from '@/lib/game'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export function GameBoard() {
  const { userId, chips, updateChips, buyChips } = useSession()
  const { user, signOut, isAuthenticated } = useAuth()
  const [gameState, setGameState] = useState<GameState>({
    playerHand: [],
    dealerHand: [],
    deck: createDeck(),
    gameStatus: 'betting',
    result: null,
    bet: 0,
    chips: chips
  })
  const [aiAdvice, setAiAdvice] = useState<string>('')
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    setGameState(prev => ({ ...prev, chips }))
  }, [chips])

  const placeBet = (amount: number) => {
    if (amount > chips) return
    
    const deck = createDeck()
    const { card: playerCard1, newDeck: deck1 } = dealCard(deck)
    const { card: dealerCard1, newDeck: deck2 } = dealCard(deck1)
    const { card: playerCard2, newDeck: deck3 } = dealCard(deck2)
    const { card: dealerCard2, newDeck: finalDeck } = dealCard(deck3)

    setGameState({
      playerHand: [playerCard1, playerCard2],
      dealerHand: [dealerCard1, dealerCard2],
      deck: finalDeck,
      gameStatus: 'playing',
      result: null,
      bet: amount,
      chips: chips - amount
    })
  }

  const hit = () => {
    if (gameState.gameStatus !== 'playing') return

    const { card, newDeck } = dealCard(gameState.deck)
    const newPlayerHand = [...gameState.playerHand, card]
    const playerValue = calculateHandValue(newPlayerHand)

    if (playerValue > 21) {
      endGame(newPlayerHand, gameState.dealerHand, 'lose')
    } else {
      setGameState(prev => ({
        ...prev,
        playerHand: newPlayerHand,
        deck: newDeck
      }))
    }
  }

  const stand = () => {
    if (gameState.gameStatus !== 'playing') return
    
    setGameState(prev => ({ ...prev, gameStatus: 'dealer' }))
    dealerPlay()
  }

  const dealerPlay = () => {
    let dealerHand = [...gameState.dealerHand]
    let deck = [...gameState.deck]

    while (calculateHandValue(dealerHand) < 17) {
      const { card, newDeck } = dealCard(deck)
      dealerHand.push(card)
      deck = newDeck
    }

    const playerValue = calculateHandValue(gameState.playerHand)
    const dealerValue = calculateHandValue(dealerHand)

    let result: 'win' | 'lose' | 'push'
    if (dealerValue > 21 || playerValue > dealerValue) {
      result = 'win'
    } else if (playerValue < dealerValue) {
      result = 'lose'
    } else {
      result = 'push'
    }

    endGame(gameState.playerHand, dealerHand, result)
  }

  const saveGameHistory = async (playerHand: GameCard[], dealerHand: GameCard[], result: 'win' | 'lose' | 'push', retries = 3) => {
    if (!userId) return

    for (let i = 0; i < retries; i++) {
      try {
        const { data, error } = await supabase.from('game_history').insert({
          user_id: userId,
          bet_amount: gameState.bet,
          result,
          player_hand: JSON.stringify(playerHand),
          dealer_hand: JSON.stringify(dealerHand)
        }).select()

        if (error) throw error
        if (data) {
          console.log('Game saved successfully:', data[0].id)
          return
        }
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error)
        if (i === retries - 1) {
          console.error('Failed to save game after all retries')
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        }
      }
    }
  }

  const endGame = async (playerHand: GameCard[], dealerHand: GameCard[], result: 'win' | 'lose' | 'push') => {
    let newChips = gameState.chips
    if (result === 'win') {
      newChips += gameState.bet * 2
    } else if (result === 'push') {
      newChips += gameState.bet
    }

    await updateChips(newChips)
    await saveGameHistory(playerHand, dealerHand, result)

    setGameState(prev => ({
      ...prev,
      playerHand,
      dealerHand,
      gameStatus: 'finished',
      result,
      chips: newChips
    }))

    // Trigger confetti on win
    if (result === 'win') {
      setTimeout(() => triggerConfetti(), 500)
    }
  }

  const newGame = () => {
    stopConfetti()
    setGameState({
      playerHand: [],
      dealerHand: [],
      deck: createDeck(),
      gameStatus: 'betting',
      result: null,
      bet: 0,
      chips: gameState.chips
    })
    setAiAdvice('')
  }

  const getAIAdvice = async () => {
    try {
      setAiAdvice('Getting AI advice...')
      
      const response = await fetch('/api/ai-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerHand: gameState.playerHand,
          dealerUpCard: gameState.dealerHand[0]
        })
      })
      
      const data = await response.json()
      setAiAdvice(data.advice)
    } catch (error) {
      console.error('AI advice error:', error)
      setAiAdvice('AI advice unavailable. Try again later.')
    }
  }

  const playerValue = calculateHandValue(gameState.playerHand)
  const dealerValue = calculateHandValue(gameState.dealerHand)

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          {/* Top row - Title and chips */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl md:text-4xl font-bold text-white">Blackjack</h1>
            <div className="flex items-center gap-1 md:gap-2">
              <span className="text-lg md:text-2xl text-yellow-400">{gameState.chips}</span>
              <span className="text-yellow-400 text-sm md:text-xl">🪙</span>
              <Button 
                onClick={() => buyChips(500)} 
                className="ml-1 md:ml-2 bg-transparent border border-white text-white hover:bg-white hover:text-black w-6 h-6 md:w-8 md:h-8 rounded-full p-0 text-xs md:text-sm"
              >
                +
              </Button>
            </div>
          </div>
          
          {/* Bottom row - Auth buttons */}
          <div className="flex justify-center">
            {isAuthenticated ? (
              <div className="flex gap-2 md:gap-4">
                <Link href="/history">
                  <Button className="bg-blue-500 text-white px-3 py-2 md:px-6 md:py-3 text-sm md:text-lg font-bold">
                    HISTORY
                  </Button>
                </Link>
                <Button 
                  onClick={signOut}
                  className="bg-red-500 text-white px-3 py-2 md:px-6 md:py-3 text-sm md:text-lg font-bold"
                >
                  LOG OUT
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="bg-green-500 text-white px-4 py-2 md:px-6 md:py-3 text-sm md:text-lg font-bold"
              >
                SIGN IN
              </Button>
            )}
          </div>
        </div>

        {/* Dealer Section */}
        <div className="mb-16">
          <div className="flex gap-4 justify-center items-center min-h-[7rem] mb-4">
            {[0, 1].map((index) => {
              const card = gameState.dealerHand[index]
              if (card) {
                return (
                  <PlayingCard 
                    key={index} 
                    card={card} 
                    hidden={index === 1 && gameState.gameStatus === 'playing'}
                    isWinning={gameState.result === 'lose' && gameState.gameStatus === 'finished'}
                  />
                )
              }
              return (
                <div key={index} className="w-20 h-28 border-2 border-white rounded-lg" />
              )
            })}
            {gameState.dealerHand.slice(2).map((card, index) => (
              <PlayingCard 
                key={index + 2} 
                card={card} 
                isWinning={gameState.result === 'lose' && gameState.gameStatus === 'finished'}
              />
            ))}
          </div>
          <div className="text-center text-white text-lg">Dealer</div>
        </div>

        {/* Player Section */}
        <div className="mb-16">
          <div className="text-center text-white text-lg mb-4">You</div>
          <div className="flex gap-4 justify-center items-center min-h-[7rem]">
            {[0, 1].map((index) => {
              const card = gameState.playerHand[index]
              if (card) {
                return (
                  <PlayingCard 
                    key={index} 
                    card={card} 
                    isWinning={gameState.result === 'win' && gameState.gameStatus === 'finished'}
                  />
                )
              }
              return (
                <div key={index} className="w-20 h-28 border-2 border-white rounded-lg" />
              )
            })}
            {gameState.playerHand.slice(2).map((card, index) => (
              <PlayingCard 
                key={index + 2} 
                card={card} 
                isWinning={gameState.result === 'win' && gameState.gameStatus === 'finished'}
              />
            ))}
          </div>
        </div>

        {/* Betting Area */}
        <div className="text-center space-y-4 md:space-y-6">
          {gameState.gameStatus === 'betting' && (
            <>
              <div className="text-white text-xl md:text-2xl mb-4">{gameState.bet || 100}</div>
              <div className="flex gap-2 md:gap-4 justify-center mb-4 md:mb-6 flex-wrap">
                {[5, 25, 100].map(amount => (
                  <Button
                    key={amount}
                    onClick={() => setGameState(prev => ({ ...prev, bet: (prev.bet || 100) + amount }))}
                    className="bg-transparent border border-white text-white hover:bg-white hover:text-black px-3 py-2 md:px-6 md:py-2 text-sm md:text-base"
                  >
                    +{amount}
                  </Button>
                ))}
              </div>
              <Button 
                onClick={() => placeBet(gameState.bet || 100)}
                disabled={(gameState.bet || 100) > gameState.chips}
                className="bg-white text-black hover:bg-gray-200 px-6 py-3 md:px-8 md:py-3 text-base md:text-lg font-semibold"
              >
                Place Bet
              </Button>
            </>
          )}

          {gameState.gameStatus === 'playing' && (
            <div className="space-y-4 md:space-y-6">
              <div className="flex gap-3 md:gap-6 justify-center flex-wrap">
                <Button 
                  onClick={hit} 
                  className="bg-white text-black hover:bg-gray-200 px-6 py-3 md:px-8 md:py-3 text-base md:text-lg font-semibold"
                >
                  Hit
                </Button>
                <Button 
                  onClick={stand} 
                  className="bg-white text-black hover:bg-gray-200 px-6 py-3 md:px-8 md:py-3 text-base md:text-lg font-semibold"
                >
                  Stand
                </Button>
                <Button 
                  onClick={getAIAdvice} 
                  className="bg-transparent border border-white text-white hover:bg-white hover:text-black px-4 py-3 md:px-6 md:py-3 text-sm md:text-base"
                >
                  AI Advice
                </Button>
              </div>
              {aiAdvice && (
                <div className="text-white p-3 max-w-sm md:max-w-md mx-auto text-sm md:text-base">
                  <strong>AI:</strong> {aiAdvice}
                </div>
              )}
            </div>
          )}

          {gameState.gameStatus === 'finished' && (
            <div className="space-y-4 md:space-y-6 relative">

              <div className={cn(
                "text-white text-xl md:text-2xl font-bold",
                gameState.result === 'win' && "animate-win-celebration text-green-400",
                gameState.result === 'lose' && "text-red-400",
                gameState.result === 'push' && "text-yellow-400"
              )}>
                {gameState.result === 'win' ? '🎉 You Win! 🎉' : 
                 gameState.result === 'lose' ? '💔 You Lose!' : '🤝 Push!'}
              </div>
              <Button 
                onClick={newGame} 
                className="bg-white text-black hover:bg-gray-200 px-6 py-3 md:px-8 md:py-3 text-base md:text-lg font-semibold"
              >
                New Game
              </Button>
            </div>
          )}
        </div>
      </div>
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  )
}