const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://agxlzohfzriubcizoahf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneGx6b2hmenJpdWJjaXpvYWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTM3NjksImV4cCI6MjA3NTIyOTc2OX0.wRX6Mv_l0TXP73YnwDMdj7NkcVSWjoABZBytAtH4HHM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  // Test basic connection
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return
    }
    console.log('✅ Connection successful')
  } catch (err) {
    console.error('❌ Connection error:', err.message)
    return
  }

  // Test creating a user
  try {
    const testSessionId = 'test-' + Date.now()
    const { data, error } = await supabase
      .from('users')
      .insert({ session_id: testSessionId, chips: 1000 })
      .select()
    
    if (error) {
      console.error('❌ User creation failed:', error.message)
    } else {
      console.log('✅ User creation successful:', data[0].id)
      
      // Clean up test user
      await supabase.from('users').delete().eq('id', data[0].id)
    }
  } catch (err) {
    console.error('❌ User creation error:', err.message)
  }
}

testConnection()