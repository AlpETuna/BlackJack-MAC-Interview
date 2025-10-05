# Blackjack Game

A modern, responsive blackjack game built with Next.js, Supabase, and TailwindCSS featuring persistent browser sessions, AI assistance, and game history tracking.

## Features

- ✅ Functionally correct blackjack game
- ✅ Animated card dealing and chip movements
- ✅ Mobile-friendly responsive design
- ✅ Persistent browser sessions (no login required)
- ✅ External database storage (Supabase)
- ✅ Chip management and purchasing
- ✅ Game history and statistics
- ✅ AI assistant for game decisions
- ✅ Ready for Netlify deployment

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **UI Components**: ShadCN/UI, Radix UI
- **Database**: Supabase
- **Deployment**: Netlify (recommended)
- **Styling**: TailwindCSS with custom animations

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the following schema:

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

-- Create indexes for better performance
CREATE INDEX idx_users_session_id ON users(session_id);
CREATE INDEX idx_game_history_user_id ON game_history(user_id);
CREATE INDEX idx_game_history_created_at ON game_history(created_at DESC);
```

3. Get your project URL and anon key from Settings > API

### 3. Environment Variables

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment

### Netlify (Recommended)

1. Push code to GitHub
2. Connect repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## Game Features

### Core Gameplay
- Standard blackjack rules (dealer stands on 17)
- Hit, Stand, and betting options
- Automatic win/lose/push detection
- Real-time hand value calculation

### Session Management
- Browser-based persistent sessions using localStorage
- No login required - sessions persist across browser restarts
- Automatic user creation in database

### AI Assistant
- Click "AI Advice" during gameplay
- Basic strategy recommendations
- Considers player hand and dealer up card

### Chip Management
- Starting chips: $1000
- Buy additional chips: $500 increments
- Chips persist in database per session

### Game History
- Tracks all games with results
- Statistics: wins, losses, pushes, net winnings
- Recent games list with bet amounts and dates

## Mobile Responsive

- Optimized for mobile devices
- Touch-friendly buttons and cards
- Responsive grid layouts
- Mobile-first design approach

## Architecture

```
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles and CSS variables
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page with game
│   └── history/        # Game history page
├── components/         # React components
│   ├── ui/            # ShadCN UI components
│   ├── GameBoard.tsx  # Main game logic and UI
│   └── PlayingCard.tsx # Animated card component
├── hooks/             # Custom React hooks
│   └── useSession.ts  # Session management
└── lib/               # Utility libraries
    ├── game.ts        # Blackjack game logic
    ├── supabase.ts    # Database client and types
    └── utils.ts       # Helper functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.