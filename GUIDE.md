# Valiant Picks - Complete Setup & Deployment Guide

A full-stack betting platform with React frontend and Express.js backend, using Supabase database and deployable to Vercel.

---

## 📋 Table of Contents
1. [Quick Start (Local)](#quick-start-local)
2. [Deployment (Supabase + Vercel)](#deployment-supabaseVercel)
3. [Project Structure](#project-structure)
4. [API Reference](#api-reference)
5. [Database Schema](#database-schema)
6. [Admin Features](#admin-features)
7. [Testing Checklist](#testing-checklist)

---

## ⚡ Quick Start (Local)

### Install & Run

**Windows:**
```bash
./startup.bat
```

**Mac/Linux:**
```bash
chmod +x startup.sh
./startup.sh
```

Opens automatically on http://localhost:3000

### Login Credentials

**Regular User:**
- Click "Register" to create account
- Login with your credentials

**Admin:**
- Username: `admin`
- Password: `12345`

---

## 🚀 Deployment (Supabase + Vercel)

### Step 1: Create Supabase Project (5 minutes)

1. Go to https://supabase.com
2. Sign up (free account)
3. Click "New Project"
4. Choose:
   - Organization
   - Region (closest to you)
   - Database password (save this!)
5. Wait 2-3 minutes for initialization
6. Go to **Settings > API**
7. Copy and save:
   - `Project URL` (e.g., `https://abcd1234.supabase.co`)
   - `anon public key` (long string starting with `eyJ...`)

### Step 2: Create Database Schema (3 minutes)

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `SUPABASE_SETUP.sql`
4. Paste into SQL Editor
5. Click **Run**
6. Verify "Success" with no red errors

### Step 3: Create Admin User (3 minutes)

Open terminal:
```bash
node
```

Paste these lines one at a time:
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('12345', 10);
console.log(hash);
```

Copy the output (looks like `$2a$10$...`)

Then in Supabase SQL Editor, create new query:
```sql
INSERT INTO users (id, username, password, balance, is_admin) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin',
  'PASTE_YOUR_HASH_HERE',
  1000,
  true
);
```

Exit Node:
```javascript
.exit
```

### Step 4: Create `.env` File (2 minutes)

Create `.env` file in root directory:

```env
# From Supabase Settings > API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key-here

# Create a random string
JWT_SECRET=your-super-secret-key-12345

# Local development
NODE_ENV=development
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 5: Test Locally

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

Visit http://localhost:3000

### Step 6: Push to GitHub

```bash
git add .
git commit -m "Add Supabase and Vercel deployment"
git push
```

### Step 7: Deploy Backend to Vercel (5 minutes)

1. Go to https://vercel.com
2. Click "Add New..." > "Project"
3. Select your betting-app repository
4. **Add Environment Variables:**
   - Copy all values from `.env` file
   - Paste into Vercel
5. Click **Deploy**
6. Wait 2-3 minutes
7. Copy your deployment URL (e.g., `https://betting-app-abc.vercel.app`)

### Step 8: Deploy Frontend

In Vercel project settings:
1. Go to **Settings > Environment Variables**
2. Update `REACT_APP_API_URL` = `https://your-vercel-domain.com/api`
3. Go to **Deployments** > Redeploy

Your app is now live! ✅

---

## 📁 Project Structure

```
betting/
├── server/                    # Express backend
│   ├── server.js             # Main server file
│   ├── supabase.js           # Supabase client config
│   ├── routes/               # API endpoints
│   │   ├── auth.js
│   │   ├── bets.js
│   │   ├── games.js
│   │   ├── transactions.js
│   │   └── users.js
│   ├── models/               # Database models
│   │   ├── User.js
│   │   ├── Bet.js
│   │   ├── Game.js
│   │   └── Transaction.js
│   ├── middleware/           # Auth & error handling
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── package.json
│   └── .env
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── AdminPanel.js
│   │   │   ├── BetList.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Leaderboard.js
│   │   │   └── Login.js
│   │   ├── styles/           # CSS files
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   └── package.json
├── SUPABASE_SETUP.sql        # Database schema
├── startup.bat               # Windows start script
├── startup.sh                # Mac/Linux start script
├── .env.example              # Environment template
├── .env                      # (created by you)
├── package.json
└── vercel.json              # Vercel config
```

---

## 🔌 API Reference

### Authentication

```
POST /api/auth/register
  Body: { username, email, password }
  Response: { token, user }

POST /api/auth/login
  Body: { username, password }
  Response: { token, user }
```

### Users

```
GET /api/users/profile
  Response: { id, username, email, balance, is_admin }

GET /api/users
  Admin only
  Response: [{ id, username, balance, is_admin }, ...]

PUT /api/users/:id/balance
  Admin only
  Body: { balance }
  Response: { success }
```

### Games

```
GET /api/games
  Response: [{ id, name, date, home_team, away_team, status }, ...]

POST /api/games
  Admin only
  Body: { name, date, home_team, away_team, home_odds, away_odds }
  Response: { id, ... }

PUT /api/games/:id
  Admin only
  Body: { status, outcome, ... }
  Response: { success }
```

### Bets

```
POST /api/bets
  Body: { game_id, amount, bet_type, selection, odds }
  Response: { id, amount, odds, status }

GET /api/bets
  Response: [{ id, game_id, amount, odds, status, outcome }, ...]

GET /api/bets/all
  Admin only
  Response: [all bets from all users]

PUT /api/bets/:id
  Admin only
  Body: { status, outcome }
  Response: { success }
```

### Transactions

```
GET /api/transactions
  Response: [{ id, type, amount, description, status, created_at }, ...]

POST /api/transactions
  Body: { type, amount, description }
  Response: { id, ... }
```

---

## 🗄️ Database Schema

### Users Table
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary Key |
| username | TEXT | Unique |
| email | TEXT | Unique |
| password | TEXT | Hashed with bcrypt |
| balance | DECIMAL | Default: 1000 (Valiant Bucks) |
| is_admin | BOOLEAN | Default: false |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### Games Table
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary Key |
| name | TEXT | Game identifier |
| date | TIMESTAMP | Game start time |
| home_team | TEXT | Home team name |
| away_team | TEXT | Away team name |
| home_odds | DECIMAL | Winning odds for home |
| away_odds | DECIMAL | Winning odds for away |
| status | TEXT | pending/active/completed |
| outcome | TEXT | home/away/draw/null |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### Bets Table
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary Key |
| user_id | UUID | Foreign Key to users |
| game_id | UUID | Foreign Key to games |
| amount | DECIMAL | Bet amount |
| odds | DECIMAL | Chosen odds |
| bet_type | TEXT | moneyline/spread/over_under |
| selection | TEXT | home/away/over/under |
| status | TEXT | pending/resolved/cancelled |
| outcome | TEXT | won/lost/push/null |
| potential_win | DECIMAL | Calculated winning amount |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### Transactions Table
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary Key |
| user_id | UUID | Foreign Key to users |
| type | TEXT | bet/win/adjustment |
| amount | DECIMAL | Amount involved |
| description | TEXT | What happened |
| status | TEXT | pending/completed/failed |
| created_at | TIMESTAMP | Auto-generated |

---

## 👨‍💼 Admin Features

### Dashboard Access
- Login with username: `admin`, password: `12345`
- Click **Admin** button in top right

### Admin Capabilities

**User Management:**
- View all users and balances
- Manually adjust user balances
- Reset user accounts

**Game Management:**
- Create new games
- Set odds for teams
- View game schedule
- Manage game status

**Bet Management:**
- View all bets from all users
- Settle bets (mark as won/lost)
- View pending vs resolved bets
- See total amounts wagered

**Statistics:**
- Total bets placed
- Total money wagered
- Pending bets count
- Win/loss distribution

---

## ✅ Testing Checklist

### User Registration & Login
- [ ] Can register new account
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong password
- [ ] Username must be unique
- [ ] Starting balance is 1000 Valiant Bucks

### Placing Bets
- [ ] Can see available games
- [ ] Can place bet on game
- [ ] Cannot bet more than balance
- [ ] Bet amount deducted from balance
- [ ] Correct odds displayed
- [ ] Bet appears in "Your Bets"

### Bet Resolution
- [ ] Admin can view all bets
- [ ] Admin can mark bet as won
- [ ] Admin can mark bet as lost
- [ ] Winnings calculated correctly
- [ ] User balance updated on win
- [ ] Transaction recorded

### Admin Functions
- [ ] Admin can create games
- [ ] Admin can set odds
- [ ] Admin can adjust user balances
- [ ] Admin can view all users
- [ ] Admin can view all bets

### Deployment
- [ ] Supabase database created
- [ ] Tables created successfully
- [ ] Admin user exists
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] API calls work from frontend
- [ ] Can register/login on deployed app
- [ ] Can place bets on deployed app

---

## 🎨 Design

### Color Scheme
- Primary Blue: `#004f9e`
- Darker Blue (hover): `#003d7a`
- Background: `#f5f5f5`
- White: `#ffffff`

### Logo
- Location: `/client/public/assets/logo.png`
- Displays in navbar with "Valiant Picks" text

---

## 🔒 Security Notes

⚠️ **Important:**
1. Never share `.env` file (already in `.gitignore`)
2. Change `JWT_SECRET` in production
3. Use HTTPS in production (Vercel handles this)
4. Enable Row Level Security (RLS) in Supabase
5. All user inputs validated server-side
6. Passwords hashed with bcrypt

---

## 📞 Troubleshooting

**"Cannot connect to Supabase"**
- Check `.env` file has correct URLs and keys
- Verify Supabase project is initialized
- Check internet connection

**"Admin account doesn't work"**
- Verify admin user created in STEP 3
- Check password hash was pasted correctly
- Try resetting admin user

**"Bets not placing"**
- Check backend is running (`npm run dev`)
- Check browser console for errors
- Verify game exists before placing bet
- Check balance is sufficient

**"Deployment failed"**
- Verify all environment variables set in Vercel
- Check GitHub repository connected
- Review Vercel deployment logs
- Ensure `.env` not committed to git

---

## 💡 Next Steps

1. ✅ Install dependencies: `npm install && cd client && npm install && cd ..`
2. ✅ Test locally: `npm run dev` (and `npm start` in client folder)
3. ✅ Create Supabase project (Step 1 above)
4. ✅ Set up database (Step 2)
5. ✅ Create admin user (Step 3)
6. ✅ Deploy to Vercel (Step 7-8)

Your betting platform is ready to use! 🎉
