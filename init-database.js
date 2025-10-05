const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://agxlzohfzriubcizoahf.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneGx6b2hmenJpdWJjaXpvYWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTM3NjksImV4cCI6MjA3NTIyOTc2OX0.wRX6Mv_l0TXP73YnwDMdj7NkcVSWjoABZBytAtH4HHM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const sqlCommands = [
  `CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    chips INTEGER DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,
  
  `CREATE TABLE IF NOT EXISTS game_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bet_amount INTEGER NOT NULL,
    result TEXT CHECK (result IN ('win', 'lose', 'push')) NOT NULL,
    player_hand TEXT NOT NULL,
    dealer_hand TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,
  
  `CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id);`,
  `CREATE INDEX IF NOT EXISTS idx_game_history_user_id ON game_history(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_game_history_created_at ON game_history(created_at DESC);`,
  
  `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;`,
  
  `CREATE POLICY IF NOT EXISTS "Allow all operations on users" ON users FOR ALL USING (true);`,
  `CREATE POLICY IF NOT EXISTS "Allow all operations on game_history" ON game_history FOR ALL USING (true);`
]

async function initDatabase() {
  console.log('🚀 Initializing Supabase database...')
  
  try {
    for (let i = 0; i < sqlCommands.length; i++) {
      console.log(`📝 Executing command ${i + 1}/${sqlCommands.length}...`)
      const { error } = await supabase.rpc('exec_sql', { sql: sqlCommands[i] })
      if (error) throw error
    }
    
    console.log('✅ Database initialization completed!')
    
    // Test setup
    console.log('\n🧪 Testing database setup...')
    
    const { data: users, error: usersError } = await supabase.from('users').select('*').limit(1)
    if (usersError) throw usersError
    console.log('✅ Users table accessible')
    
    const { data: history, error: historyError } = await supabase.from('game_history').select('*').limit(1)
    if (historyError) throw historyError
    console.log('✅ Game history table accessible')
    
    console.log('\n🎉 Database is ready for the blackjack game!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n💡 Run these SQL commands manually in Supabase SQL Editor:')
    sqlCommands.forEach(sql => console.log(`\n${sql}`))
  }
}

initDatabase()