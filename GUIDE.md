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

### Prerequisites
- Node.js 14+ installed
- npm installed

### Install & Run

1. **Install dependencies:**
```bash
npm install
cd client
npm install
cd ..
```

2. **Create `.env` file** (in root directory):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Start backend (Terminal 1):**
```bash
npm run dev
```

4. **Start frontend (Terminal 2):**
```bash
npm run client
```

Opens automatically on http://localhost:3000

### Login Credentials

**Regular User:**
- Click "Register" to create account
- Login with your credentials

**Admin:**
- Username: `admin`
- Password: `12345`

**Or use startup scripts:**
- Windows: `./startup.bat`
- Mac/Linux: `chmod +x startup.sh && ./startup.sh`

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

Create `.env` file in **root directory** (same level as `package.json`):

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key-here

# Server Configuration  
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

**Important:**
- Keep `.env` file **secret** (already in `.gitignore`)
- Change `JWT_SECRET` in production
- Use your actual Supabase values

### Step 5: Test Locally

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
npm run client
```

Visit http://localhost:3000

Test the following:
- Register new account
- Login with credentials
- Check balance shows 1000 Valiant Bucks
- Place a test bet (if games exist)

### Step 6: Push to GitHub

```bash
git add .
git commit -m "Add Supabase and Vercel deployment"
git push
```

### Step 7: Deploy Backend to Vercel (5 minutes)

1. Go to https://vercel.com
2. Click "Add New..." > "Project"
3. Select your betting-app GitHub repository
4. Click "Deploy" (Vercel auto-detects settings from `vercel.json`)
5. Wait 2-3 minutes
6. Once deployed, copy your URL (e.g., `https://betting-app-abc.vercel.app`)

**Configure Environment Variables in Vercel:**
1. Go to project Settings > Environment Variables
2. Add all these from your `.env` file:
   ```
   SUPABASE_URL
   SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   JWT_SECRET
   NODE_ENV=production
   REACT_APP_API_URL=https://your-vercel-domain.com/api
   ```
3. Click "Save"
4. Go to Deployments > Redeploy latest commit to apply changes

### Step 8: Test Deployment

Visit your Vercel URL and verify:
- [ ] Can register new account
- [ ] Can login
- [ ] Can view games
- [ ] Can place bets
- [ ] Admin login works
- [ ] Balance updates correctly

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

All API calls use the `/api/` prefix. Local: `http://localhost:5000/api` | Production: `https://your-domain.com/api`

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
  Headers: { Authorization: "Bearer <token>" }
  Response: { id, username, email, balance, is_admin }

GET /api/users
  Headers: { Authorization: "Bearer <admin_token>" }
  Admin only
  Response: [{ id, username, balance, is_admin }, ...]

PUT /api/users/:id/balance
  Headers: { Authorization: "Bearer <admin_token>" }
  Admin only
  Body: { balance }
  Response: { success }
```

### Games

```
GET /api/games
  Response: [{ id, name, date, home_team, away_team, home_odds, away_odds, status }, ...]

POST /api/games
  Headers: { Authorization: "Bearer <admin_token>" }
  Admin only
  Body: { name, date, home_team, away_team, home_odds, away_odds }
  Response: { id, ... }

PUT /api/games/:id
  Headers: { Authorization: "Bearer <admin_token>" }
  Admin only
  Body: { status, outcome }
  Response: { success }
```

### Bets

```
POST /api/bets
  Headers: { Authorization: "Bearer <token>" }
  Body: { game_id, amount, bet_type, selection, odds }
  Response: { id, game_id, amount, odds, status }

GET /api/bets
  Headers: { Authorization: "Bearer <token>" }
  Response: [{ id, game_id, amount, odds, status, outcome }, ...]

GET /api/bets/all
  Headers: { Authorization: "Bearer <admin_token>" }
  Admin only
  Response: [all bets from all users]

PUT /api/bets/:id
  Headers: { Authorization: "Bearer <admin_token>" }
  Admin only
  Body: { status, outcome }
  Response: { success }
```

### Transactions

```
GET /api/transactions
  Headers: { Authorization: "Bearer <token>" }
  Response: [{ id, type, amount, description, status, created_at }, ...]

POST /api/transactions
  Headers: { Authorization: "Bearer <token>" }
  Body: { type, amount, description }
  Response: { id, ... }

GET /api/health
  Response: { status: "ok", timestamp: "2024-12-18T..." }
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

### For Local Development:
1. ✅ Install dependencies: `npm install && cd client && npm install && cd ..`
2. ✅ Create `.env` file with your Supabase credentials
3. ✅ Test locally: `npm run dev` (and `npm run client` in another terminal)
4. ✅ Verify registration, login, and betting works

### For Production Deployment:
1. ✅ Complete all Supabase setup (Steps 1-3)
2. ✅ Push code to GitHub
3. ✅ Deploy to Vercel (Step 7)
4. ✅ Set environment variables in Vercel
5. ✅ Test deployed app (Step 8)
6. ✅ Optionally add custom domain

**Your betting platform is ready!** 🎉

### Maintenance
- Monitor Vercel deployments for errors
- Check Supabase dashboard for database health
- Keep Node.js and dependencies updated
- Regularly backup Supabase (automatic)
- Review JWT_SECRET usage in production
