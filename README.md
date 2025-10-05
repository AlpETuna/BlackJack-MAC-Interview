# Blackjack Game

A modern blackjack game with user authentication, persistent data storage, and AI assistance.

## Features

- ✅ Complete blackjack gameplay (hit, stand, betting)
- ✅ User authentication (sign up/sign in)
- ✅ Persistent user data (chips, game history)
- ✅ AI advice for game decisions
- ✅ Mobile-responsive design
- ✅ Animated card dealing
- ✅ Ready for Netlify deployment

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Database**: Supabase (auth + data storage)
- **Deployment**: Netlify
- **UI**: ShadCN components

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase Database

Create a Supabase project and run this SQL:

```sql
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  chips INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_history table
CREATE TABLE game_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bet_amount INTEGER NOT NULL,
  result TEXT CHECK (result IN ('win', 'lose', 'push')) NOT NULL,
  player_hand TEXT NOT NULL,
  dealer_hand TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on game_history" ON game_history FOR ALL USING (true);
```

### 3. Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server
```bash
npm run dev
```

## Deployment (Netlify)

1. Push code to GitHub
2. Connect repository to Netlify
3. Add environment variables in Netlify dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## How It Works

### Authentication System
- **Guest Users**: Browser session (localStorage)
- **Authenticated Users**: Supabase auth with persistent data
- **Data Separation**: Each user has their own chips and game history

### Game Flow
1. **Betting**: Choose bet amount, place bet
2. **Dealing**: Animated card dealing (player gets 2, dealer gets 2)
3. **Playing**: Hit/Stand decisions with AI advice
4. **Results**: Win/lose/push with chip updates
5. **History**: All games saved to database

### Data Storage
- **Users Table**: Links session/auth ID to user data
- **Game History**: Stores every completed game
- **Chips**: Persistent across sessions and devices

### File Structure
```
├── app/                 # Next.js pages
│   ├── page.tsx        # Main game
│   └── history/        # Game history page
├── components/         # React components
│   ├── GameBoard.tsx   # Main game logic
│   ├── AuthModal.tsx   # Login/signup modal
│   └── PlayingCard.tsx # Animated cards
├── hooks/              # Custom hooks
│   ├── useAuth.ts      # Authentication state
│   └── useSession.ts   # User session management
└── lib/                # Utilities
    ├── game.ts         # Blackjack game logic
    └── supabase.ts     # Database client
```

## Game Rules

- Standard blackjack rules
- Dealer stands on 17
- Blackjack pays 1:1
- Starting chips: 1000
- Minimum bet: 5

## AI Assistant

Click "AI Advice" during gameplay for basic strategy recommendations based on:
- Your hand value
- Dealer's up card
- Basic blackjack strategy

## License

MIT License