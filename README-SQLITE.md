# Norwegian Election Data - SQLite Version

A simplified Node.js application using SQLite database for Norwegian parliament election results and opinion polls.

## ✅ Features

- **SQLite database** - No complex database setup, works offline
- **Historical election results** - Data from 2001-2021 included
- **Opinion polls** - Fetches polls from Wikipedia and manual sources
- **No TypeScript** - Plain JavaScript only
- **Simple dependencies** - Express, SQLite3, Axios, Cheerio
- **Works on Windows** with standard Node.js

## 📦 Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start the server:**
```bash
node server-sqlite.js
```
Server runs on: http://localhost:3001

3. **Fetch opinion polls (optional):**
```bash
node fetch-polls.js
```

## 🌐 Access the Application

### Option 1: Direct Browser Access
Open http://localhost:3001 in your browser

### Option 2: Via File System
Open `public/index.html` directly in your browser (it will connect to the API on port 3001)

## 📊 Available Data

### Election Results (Built-in)
- 2021: Complete results with seats
- 2017: Complete results with seats  
- 2013: Complete results with seats
- 2009: Complete results with seats
- 2005: Complete results with seats
- 2001: Complete results with seats

### Opinion Polls
- Fetched from Wikipedia
- Manual data for recent elections
- Run `node fetch-polls.js` to update

## 🔌 API Endpoints

- `/api/results?year=2021` - Get election results for a year
- `/api/polls?year=2021` - Get opinion polls for a year
- `/api/years` - Get all available years
- `/api/parties` - Get all party codes
- `/api/stats` - Get database statistics

## 📁 File Structure

```
valg/
├── server-sqlite.js     # Express server with SQLite
├── fetch-polls.js       # Poll data fetcher
├── election.db          # SQLite database (auto-created)
├── package.json         # Dependencies
└── public/             # Frontend files
    ├── index.html      # Main page
    ├── style.css       # Styling
    └── app.js          # Frontend JavaScript
```

## 🛠️ Database Schema

### Results Table
- `year` - Election year
- `party_id` - Party code (Ap, H, FrP, etc.)
- `pct` - Vote percentage
- `seats` - Parliament seats won
- `source` - Data source

### Polls Table
- `year` - Poll year
- `date` - Poll date
- `pollster` - Polling organization
- `party_id` - Party code
- `pct` - Poll percentage
- `source` - Data source

## 🎨 Party Codes

- **Ap** - Arbeiderpartiet (Labour Party)
- **H** - Høyre (Conservative Party)
- **FrP** - Fremskrittspartiet (Progress Party)
- **Sp** - Senterpartiet (Centre Party)
- **SV** - Sosialistisk Venstreparti (Socialist Left)
- **V** - Venstre (Liberal Party)
- **KrF** - Kristelig Folkeparti (Christian Democratic)
- **MDG** - Miljøpartiet De Grønne (Green Party)
- **R** - Rødt (Red Party)

## 🚀 Quick Start

```bash
# Install and run in one command
npm install && node server-sqlite.js
```

Then open: http://localhost:3001

## ⚠️ Troubleshooting

**Port already in use?**
Edit `server-sqlite.js` and change:
```javascript
const PORT = process.env.PORT || 3001;
```
to another port like 3002, 3003, etc.

**Can't fetch polls?**
Wikipedia structure changes over time. Manual poll data is included for recent elections.

**Database issues?**
Delete `election.db` and restart the server to recreate it with sample data.

## 📝 Notes

- The application works completely offline once data is fetched
- All data is stored locally in SQLite database
- No build process or compilation needed
- Works with Node.js v14+ on Windows, Mac, and Linux