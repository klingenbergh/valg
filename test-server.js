// Simple test server without external dependencies
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Sample election data
const sampleData = {
  2021: {
    results: [
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
    polls: [
      {
        date: '2021-09-01',
        pollster: 'Norstat',
        parties: { 'Ap': 25.5, 'H': 20.1, 'Sp': 14.2, 'FrP': 11.3, 'SV': 8.1 }
      },
      {
        date: '2021-08-25',
        pollster: 'Opinion',
        parties: { 'Ap': 26.1, 'H': 19.8, 'Sp': 13.9, 'FrP': 11.8, 'SV': 7.9 }
      }
    ]
  },
  2017: {
    results: [
      { party_id: 'Ap', pct: 27.4, seats: 49 },
      { party_id: 'H', pct: 25.0, seats: 45 },
      { party_id: 'FrP', pct: 15.2, seats: 27 },
      { party_id: 'Sp', pct: 10.3, seats: 19 },
      { party_id: 'SV', pct: 6.0, seats: 11 }
    ]
  }
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // Serve API endpoints
  if (url.pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    
    if (url.pathname === '/api/results') {
      const year = url.searchParams.get('year') || '2021';
      const data = sampleData[year];
      if (data) {
        res.writeHead(200);
        res.end(JSON.stringify({ year: parseInt(year), results: data.results }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Year not found' }));
      }
    } else if (url.pathname === '/api/polls') {
      const year = url.searchParams.get('year') || '2021';
      const data = sampleData[year];
      if (data && data.polls) {
        res.writeHead(200);
        res.end(JSON.stringify({ year: parseInt(year), polls: data.polls }));
      } else {
        res.writeHead(200);
        res.end(JSON.stringify({ year: parseInt(year), polls: [] }));
      }
    } else if (url.pathname === '/api/years') {
      res.writeHead(200);
      res.end(JSON.stringify({ years: Object.keys(sampleData).map(y => parseInt(y)) }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Endpoint not found' }));
    }
  } 
  // Serve static files
  else {
    let filePath = path.join(__dirname, 'public', url.pathname === '/' ? 'index.html' : url.pathname);
    const extname = path.extname(filePath);
    
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json'
    };
    
    const contentType = contentTypes[extname] || 'text/plain';
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404);
          res.end('File not found');
        } else {
          res.writeHead(500);
          res.end('Server error');
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log('This is a simple test server with sample data.');
  console.log('Open your browser and navigate to the URL above.');
});