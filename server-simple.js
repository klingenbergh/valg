const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_FILE = 'election-data.json';

// Initialize data storage
let electionData = {
  results: {},
  polls: {}
};

// Load existing data if available
if (fs.existsSync(DATA_FILE)) {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    electionData = JSON.parse(data);
  } catch (e) {
    console.log('Creating new data file...');
  }
}

// Add sample data if empty
if (Object.keys(electionData.results).length === 0) {
  electionData = {
    results: {
      2021: [
        { party_id: 'Ap', pct: 26.3, seats: 48 },
        { party_id: 'H', pct: 20.4, seats: 36 },
        { party_id: 'Sp', pct: 13.5, seats: 28 },
        { party_id: 'FrP', pct: 11.6, seats: 21 },
        { party_id: 'SV', pct: 7.6, seats: 13 },
        { party_id: 'R', pct: 4.7, seats: 8 },
        { party_id: 'V', pct: 4.6, seats: 8 },
        { party_id: 'MDG', pct: 3.9, seats: 3 },
        { party_id: 'KrF', pct: 3.8, seats: 3 }
      ],
      2017: [
        { party_id: 'Ap', pct: 27.4, seats: 49 },
        { party_id: 'H', pct: 25.0, seats: 45 },
        { party_id: 'FrP', pct: 15.2, seats: 27 },
        { party_id: 'Sp', pct: 10.3, seats: 19 },
        { party_id: 'SV', pct: 6.0, seats: 11 },
        { party_id: 'V', pct: 4.4, seats: 8 },
        { party_id: 'KrF', pct: 4.2, seats: 8 },
        { party_id: 'MDG', pct: 3.2, seats: 1 },
        { party_id: 'R', pct: 2.4, seats: 1 }
      ],
      2013: [
        { party_id: 'H', pct: 26.8, seats: 48 },
        { party_id: 'Ap', pct: 30.8, seats: 55 },
        { party_id: 'FrP', pct: 16.3, seats: 29 },
        { party_id: 'KrF', pct: 5.6, seats: 10 },
        { party_id: 'Sp', pct: 5.5, seats: 10 },
        { party_id: 'V', pct: 5.2, seats: 9 },
        { party_id: 'SV', pct: 4.1, seats: 7 },
        { party_id: 'MDG', pct: 2.8, seats: 1 }
      ],
      2009: [
        { party_id: 'Ap', pct: 35.4, seats: 64 },
        { party_id: 'FrP', pct: 22.9, seats: 41 },
        { party_id: 'H', pct: 17.2, seats: 30 },
        { party_id: 'SV', pct: 6.2, seats: 11 },
        { party_id: 'Sp', pct: 6.2, seats: 11 },
        { party_id: 'KrF', pct: 5.5, seats: 10 },
        { party_id: 'V', pct: 3.9, seats: 2 }
      ]
    },
    polls: {
      2021: [
        { date: '2021-09-10', pollster: 'Norstat', parties: { 'Ap': 25.5, 'H': 20.1, 'Sp': 14.2, 'FrP': 11.3, 'SV': 8.1, 'R': 4.5, 'V': 4.3, 'MDG': 4.1, 'KrF': 3.9 }},
        { date: '2021-09-08', pollster: 'Opinion', parties: { 'Ap': 26.1, 'H': 19.8, 'Sp': 13.9, 'FrP': 11.8, 'SV': 7.9, 'R': 4.8, 'V': 4.5, 'MDG': 3.8, 'KrF': 3.7 }},
        { date: '2021-09-05', pollster: 'Respons', parties: { 'Ap': 25.8, 'H': 20.5, 'Sp': 13.7, 'FrP': 11.5, 'SV': 7.7, 'R': 4.6, 'V': 4.4, 'MDG': 4.0, 'KrF': 3.8 }},
        { date: '2021-09-01', pollster: 'Kantar', parties: { 'Ap': 26.3, 'H': 20.2, 'Sp': 13.4, 'FrP': 11.7, 'SV': 7.8, 'R': 4.7, 'V': 4.5, 'MDG': 3.9, 'KrF': 3.6 }},
        { date: '2021-08-25', pollster: 'Norstat', parties: { 'Ap': 25.9, 'H': 20.3, 'Sp': 14.1, 'FrP': 11.4, 'SV': 8.0, 'R': 4.4, 'V': 4.2, 'MDG': 4.2, 'KrF': 3.8 }}
      ],
      2017: [
        { date: '2017-09-08', pollster: 'Norstat', parties: { 'Ap': 27.5, 'H': 24.8, 'FrP': 15.3, 'Sp': 10.2, 'SV': 6.1, 'V': 4.3, 'KrF': 4.1, 'MDG': 3.3, 'R': 2.5 }},
        { date: '2017-09-06', pollster: 'Opinion', parties: { 'Ap': 27.8, 'H': 24.5, 'FrP': 15.1, 'Sp': 10.4, 'SV': 5.9, 'V': 4.5, 'KrF': 4.3, 'MDG': 3.1, 'R': 2.3 }},
        { date: '2017-09-01', pollster: 'Respons', parties: { 'Ap': 27.2, 'H': 25.1, 'FrP': 15.4, 'Sp': 10.1, 'SV': 6.2, 'V': 4.2, 'KrF': 4.0, 'MDG': 3.4, 'R': 2.4 }}
      ]
    }
  };
  
  // Save the data
  fs.writeFileSync(DATA_FILE, JSON.stringify(electionData, null, 2));
  console.log('Created sample data file: election-data.json');
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // API Routes
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    
    if (pathname === '/api/results') {
      const year = query.year || '2021';
      const results = electionData.results[year] || [];
      res.writeHead(200);
      res.end(JSON.stringify({ year: parseInt(year), results }));
      
    } else if (pathname === '/api/polls') {
      const year = query.year || '2021';
      const polls = electionData.polls[year] || [];
      res.writeHead(200);
      res.end(JSON.stringify({ year: parseInt(year), polls }));
      
    } else if (pathname === '/api/years') {
      const years = [...new Set([
        ...Object.keys(electionData.results),
        ...Object.keys(electionData.polls)
      ])].map(y => parseInt(y)).sort((a, b) => b - a);
      res.writeHead(200);
      res.end(JSON.stringify({ years }));
      
    } else if (pathname === '/api/parties') {
      const parties = new Set();
      Object.values(electionData.results).forEach(yearResults => {
        yearResults.forEach(r => parties.add(r.party_id));
      });
      Object.values(electionData.polls).forEach(yearPolls => {
        yearPolls.forEach(poll => {
          Object.keys(poll.parties).forEach(p => parties.add(p));
        });
      });
      res.writeHead(200);
      res.end(JSON.stringify({ parties: Array.from(parties).sort() }));
      
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
    
  } else {
    // Serve static files
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, 'public', filePath);
    
    const extname = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif'
    };
    
    const contentType = contentTypes[extname] || 'text/plain';
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404);
          res.end('404 - File not found');
        } else {
          res.writeHead(500);
          res.end('Server error: ' + err.code);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`
==============================================
Server is running at http://localhost:${PORT}
==============================================

Open your browser and navigate to the URL above.

Available API endpoints:
- /api/results?year=2021  - Get election results
- /api/polls?year=2021    - Get opinion polls
- /api/years              - Get available years
- /api/parties            - Get all parties

Data is stored in: election-data.json
`);
});