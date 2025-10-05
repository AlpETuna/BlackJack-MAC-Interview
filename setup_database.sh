#!/bin/bash

echo "🚀 Setting up Blackjack Database..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Run database initialization
echo "🗄️ Initializing database..."
python3 init_database.py

echo "✅ Setup complete!"