# Norwegian Election Data - Simplified Version

A simple Node.js application to display historical Norwegian parliament election results and opinion polls.

## Requirements

- Node.js (version 14 or higher)
- Windows, Mac, or Linux

## Installation

1. Install dependencies:
```bash
npm install --save express axios cheerio better-sqlite3
```

Or use the package file:
```bash
npm install --package-lock-only --package=package-simple.json
npm install
```

2. Fetch initial data:
```bash
node fetch-data.js
```

3. Start the server:
```bash
node server.js
```

4. Open your browser and go to:
```
http://localhost:3000
```

## Features

- View historical election results from 2009-2021
- Browse opinion polls timeline for each election year
- Simple bar charts for election results
- Line charts for poll trends over time
- No build process required - just plain JavaScript
- Works directly on Windows with Node.js

## File Structure

```
valg/
├── server.js           # Express server (plain JavaScript)
├── fetch-data.js       # Data fetching script
├── election-data.db    # SQLite database (created automatically)
├── package-simple.json # Simple package.json without pnpm/TypeScript
└── public/            # Frontend files
    ├── index.html     # Main HTML page
    ├── style.css      # Styling
    └── app.js         # Frontend JavaScript
```

## Data Sources

- Election results: Statistics Norway (SSB) and historical records
- Opinion polls: Wikipedia

## Notes

- The application uses SQLite for data storage (no complex database setup needed)
- All code is plain JavaScript (no TypeScript compilation needed)
- Frontend uses vanilla JavaScript with Chart.js for visualizations (no React/build tools)
- Works directly with `node` command on Windows

## Troubleshooting

If you get module errors, make sure you've installed all dependencies:
```bash
npm install express axios cheerio better-sqlite3
```

If the database is empty, run the fetch script:
```bash
node fetch-data.js
```