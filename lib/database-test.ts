import { supabase } from './supabase'

export async function testDatabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // Test connection
    const { data, error } = await supabase.from('users').select('*').limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    console.log('Users table data:', data)
    return true
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return false
  }
}

export async function testGameHistoryInsert(userId: string) {
  try {
    const testGame = {
      user_id: userId,
      bet_amount: 10,
      result: 'win' as const,
      player_hand: JSON.stringify([{suit: 'hearts', rank: 'A', value: 11}]),
      dealer_hand: JSON.stringify([{suit: 'spades', rank: 'K', value: 10}])
    }

    const { data, error } = await supabase
      .from('game_history')
      .insert(testGame)
      .select()

    if (error) {
      console.error('Game history insert failed:', error)
      return false
    }

    console.log('Game history insert successful:', data)
    return true
  } catch (error) {
    console.error('Game history test failed:', error)
    return false
  }
}