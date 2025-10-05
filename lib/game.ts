export type Card = {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
  value: number
}

export type GameState = {
  playerHand: Card[]
  dealerHand: Card[]
  deck: Card[]
  gameStatus: 'betting' | 'playing' | 'dealer' | 'finished'
  result: 'win' | 'lose' | 'push' | null
  bet: number
  chips: number
}

export function createDeck(): Card[] {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades']
  const ranks: Card['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  const deck: Card[] = []

  for (const suit of suits) {
    for (const rank of ranks) {
      let value = parseInt(rank)
      if (rank === 'A') value = 11
      if (['J', 'Q', 'K'].includes(rank)) value = 10
      deck.push({ suit, rank, value })
    }
  }

  return shuffleDeck(deck)
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function calculateHandValue(hand: Card[]): number {
  let value = 0
  let aces = 0

  for (const card of hand) {
    if (card.rank === 'A') {
      aces++
      value += 11
    } else {
      value += card.value
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10
    aces--
  }

  return value
}

export function dealCard(deck: Card[]): { card: Card; newDeck: Card[] } {
  const newDeck = [...deck]
  const card = newDeck.pop()!
  return { card, newDeck }
}

export function getCardSymbol(suit: Card['suit']): string {
  const symbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  }
  return symbols[suit]
}

export function getCardColor(suit: Card['suit']): string {
  return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-black'
}