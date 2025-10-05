import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { playerHand, dealerUpCard } = await request.json()
    
    const prompt = `You are a blackjack strategy expert. Given the following game state, provide brief advice (max 20 words):

Player hand: ${playerHand.map((card: any) => `${card.rank} of ${card.suit}`).join(', ')}
Dealer up card: ${dealerUpCard.rank} of ${dealerUpCard.suit}

Should the player HIT or STAND? Give a short reason.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      throw new Error('Claude API request failed')
    }

    const data = await response.json()
    const advice = data.content[0]?.text || 'Unable to get advice at this time.'

    return NextResponse.json({ advice })
  } catch (error) {
    console.error('AI advice error:', error)
    return NextResponse.json({ advice: 'AI advice unavailable. Use basic strategy.' }, { status: 500 })
  }
}