#!/bin/bash

# 🚀 Hunger Games AI - Render Deployment Script
# This script helps prepare your project for Render deployment

echo "🎮 Hunger Games AI - Render Deployment Setup"
echo "=============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin https://github.com/yourusername/hunger-games-ai.git"
    echo "   git push -u origin main"
    exit 1
fi

# Check if all required files exist
echo "📁 Checking required files..."

required_files=("package.json" "server.js" "public/index.html" "public/story.json")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ Missing required files:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    exit 1
fi

echo "✅ All required files found"

# Check package.json
echo "📦 Checking package.json..."
if ! grep -q '"start"' package.json; then
    echo "❌ package.json missing 'start' script"
    exit 1
fi

if ! grep -q '"engines"' package.json; then
    echo "⚠️  package.json missing 'engines' field (recommended for Render)"
fi

echo "✅ package.json looks good"

# Check if .env exists and warn about production
if [ -f ".env" ]; then
    echo "⚠️  .env file found - remember to set environment variables in Render dashboard"
    echo "   Required variables:"
    echo "   - JWT_SECRET (recommended)"
    echo "   - OPENAI_API_KEY (optional)"
fi

# Check if database file exists
if [ -f "game.db" ]; then
    echo "⚠️  game.db found - this will be recreated on Render"
fi

echo ""
echo "🎯 Ready for Render Deployment!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render deployment'"
echo "   git push"
echo ""
echo "2. Go to https://render.com"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Connect your GitHub repository"
echo "5. Configure:"
echo "   - Name: hunger-games-ai"
echo "   - Environment: Node"
echo "   - Build Command: npm ci && npm run build"
echo "   - Start Command: npm start"
echo "6. Click 'Create Web Service'"
echo ""
echo "🎮 Your game will be live at: https://your-app-name.onrender.com"
echo ""
echo "Create your own account on the registration page."
echo ""
echo "Happy Gaming! May the odds be ever in your favor! 🏆"
