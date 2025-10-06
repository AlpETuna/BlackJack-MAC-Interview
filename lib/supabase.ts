import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          session_id: string
          chips: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          chips?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          chips?: number
          created_at?: string
          updated_at?: string
        }
      }
      game_history: {
        Row: {
          id: string
          user_id: string
          bet_amount: number
          result: 'win' | 'lose' | 'push'
          player_hand: string
          dealer_hand: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bet_amount: number
          result: 'win' | 'lose' | 'push'
          player_hand: string
          dealer_hand: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bet_amount?: number
          result?: 'win' | 'lose' | 'push'
          player_hand?: string
          dealer_hand?: string
          created_at?: string
        }
      }
    }
  }
}