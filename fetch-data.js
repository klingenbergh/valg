const axios = require('axios');
const cheerio = require('cheerio');
const Database = require('better-sqlite3');

const db = new Database('election-data.db');

// Party name normalization map
const PARTY_MAP = {
  'ap': 'Ap',
  'arbeiderpartiet': 'Ap',
  'labour': 'Ap',
  'h': 'H',
  'høyre': 'H',
  'conservative': 'H',
  'frp': 'FrP',
  'fremskrittspartiet': 'FrP',
  'progress': 'FrP',
  'sp': 'Sp',
  'senterpartiet': 'Sp',
  'centre': 'Sp',
  'sv': 'SV',
  'sosialistisk venstreparti': 'SV',
  'socialist left': 'SV',
  'v': 'V',
  'venstre': 'V',
  'liberal': 'V',
  'krf': 'KrF',
  'kristelig folkeparti': 'KrF',
  'christian democratic': 'KrF',
  'mdg': 'MDG',
  'miljøpartiet de grønne': 'MDG',
  'green': 'MDG',
  'r': 'R',
  'rødt': 'R',
  'red': 'R'
};

function normalizePartyName(name) {
  const cleaned = name.toLowerCase().replace(/[^a-zæøå]/g, '');
  return PARTY_MAP[cleaned] || name;
}

// Fetch election results from SSB (Statistics Norway)
async function fetchSSBResults(year) {
  console.log(`Fetching SSB results for ${year}...`);
  
  // SSB API endpoints for different years
  const endpoints = {
    2021: 'https://data.ssb.no/api/v0/no/table/12537/',
    2017: 'https://data.ssb.no/api/v0/no/table/11816/',
    2013: 'https://data.ssb.no/api/v0/no/table/06885/',
    2009: 'https://data.ssb.no/api/v0/no/table/04447/'
  };
  
  if (!endpoints[year]) {
    console.log(`No SSB endpoint for year ${year}`);
    return [];
  }
  
  try {
    // SSB requires a specific query format
    const query = {
      "query": [
        {
          "code": "Partikode",
          "selection": {
            "filter": "all",
            "values": ["*"]
          }
        }
      ],
      "response": {
        "format": "json-stat2"
      }
    };
    
    const response = await axios.post(endpoints[year], query, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Parse SSB's JSON-stat format
    if (response.data && response.data.value) {
      const data = response.data;
      const parties = data.dimension.Partikode.category.label;
      const values = data.value;
      
      const results = [];
      let index = 0;
      
      for (const partyCode in parties) {
        const partyName = parties[partyCode];
        const votes = values[index] || 0;
        const totalVotes = values.reduce((a, b) => a + b, 0);
        const pct = (votes / totalVotes * 100).toFixed(1);
        
        results.push({
          party_id: normalizePartyName(partyName),
          pct: parseFloat(pct),
          seats: null // SSB doesn't provide seat data directly
        });
        index++;
      }
      
      return results;
    }
  } catch (error) {
    console.log(`Failed to fetch SSB data for ${year}: ${error.message}`);
  }
  
  return [];
}

// Fetch opinion polls from Wikipedia
async function fetchWikipediaPolls(year) {
  console.log(`Fetching Wikipedia polls for ${year}...`);
  
  const url = `https://en.wikipedia.org/wiki/Opinion_polling_for_the_${year}_Norwegian_parliamentary_election`;
  
  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Norwegian-Election-Data/1.0' }
    });
    
    const $ = cheerio.load(response.data);
    const polls = [];
    
    // Find poll tables (usually class "wikitable")
    $('table.wikitable').each((i, table) => {
      const headers = [];
      $(table).find('tr').first().find('th').each((j, th) => {
        headers.push($(th).text().trim());
      });
      
      // Check if this is a polling table
      if (!headers.some(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('fieldwork'))) {
        return;
      }
      
      // Process each row
      $(table).find('tr').slice(1).each((k, row) => {
        const cells = [];
        $(row).find('td, th').each((l, cell) => {
          cells.push($(cell).text().trim());
        });
        
        if (cells.length < 3) return;
        
        // Extract data
        const dateText = cells[0];
        const pollster = cells[1] || 'Unknown';
        
        // Parse date (various formats)
        let date = parsePollDate(dateText, year);
        if (!date) return;
        
        // Extract party results
        const partyResults = {};
        for (let m = 2; m < headers.length && m < cells.length; m++) {
          const header = headers[m];
          const value = cells[m];
          
          // Try to identify party from header
          const party = identifyParty(header);
          if (party && value && value !== '–' && value !== '-') {
            const pct = parseFloat(value.replace(',', '.').replace('%', ''));
            if (!isNaN(pct)) {
              partyResults[party] = pct;
            }
          }
        }
        
        if (Object.keys(partyResults).length > 0) {
          polls.push({
            date,
            pollster: pollster.replace(/\[.*?\]/g, '').trim(),
            parties: partyResults
          });
        }
      });
    });
    
    return polls;
  } catch (error) {
    console.log(`Failed to fetch Wikipedia polls for ${year}: ${error.message}`);
    return [];
  }
}

function parsePollDate(dateText, year) {
  // Handle various date formats
  const cleaned = dateText.replace(/\[.*?\]/g, '').trim();
  
  // Try to extract day and month
  const patterns = [
    /(\d{1,2})[\s\-–](\d{1,2})\s+(\w+)/,  // "1-3 September"
    /(\d{1,2})\s+(\w+)/,                    // "15 September"
    /(\w+)\s+(\d{1,2})/,                    // "September 15"
  ];
  
  const months = {
    'january': '01', 'jan': '01',
    'february': '02', 'feb': '02',
    'march': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'may': '05',
    'june': '06', 'jun': '06',
    'july': '07', 'jul': '07',
    'august': '08', 'aug': '08',
    'september': '09', 'sep': '09', 'sept': '09',
    'october': '10', 'oct': '10',
    'november': '11', 'nov': '11',
    'december': '12', 'dec': '12'
  };
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      let day, month;
      
      if (match.length === 4) {
        // Range format, use end date
        day = match[2];
        month = months[match[3].toLowerCase()];
      } else if (match.length === 3) {
        if (isNaN(match[1])) {
          // Month first
          month = months[match[1].toLowerCase()];
          day = match[2];
        } else {
          // Day first
          day = match[1];
          month = months[match[2].toLowerCase()];
        }
      }
      
      if (day && month) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
  }
  
  return null;
}

function identifyParty(header) {
  const h = header.toLowerCase();
  
  // Direct party code matches
  if (h === 'ap' || h.includes('arbeider')) return 'Ap';
  if (h === 'h' || h.includes('høyre') || h.includes('conservative')) return 'H';
  if (h === 'frp' || h.includes('fremskritt') || h.includes('progress')) return 'FrP';
  if (h === 'sp' || h.includes('senter') || h.includes('centre')) return 'Sp';
  if (h === 'sv' || h.includes('sosialistisk')) return 'SV';
  if (h === 'v' || (h.includes('venstre') && !h.includes('sosialistisk'))) return 'V';
  if (h === 'krf' || h.includes('kristelig')) return 'KrF';
  if (h === 'mdg' || h.includes('miljø') || h.includes('grøn') || h.includes('green')) return 'MDG';
  if (h === 'r' || h.includes('rødt') || h.includes('red')) return 'R';
  
  return null;
}

// Save results to database
function saveResults(year, results) {
  const stmt = db.prepare('INSERT OR REPLACE INTO results (year, party_id, pct, seats, source) VALUES (?, ?, ?, ?, ?)');
  
  for (const result of results) {
    stmt.run(year, result.party_id, result.pct, result.seats, 'SSB');
  }
  
  console.log(`Saved ${results.length} results for ${year}`);
}

// Save polls to database
function savePolls(year, polls) {
  const stmt = db.prepare('INSERT OR REPLACE INTO polls (year, date, pollster, party_id, pct, sample_size, source) VALUES (?, ?, ?, ?, ?, ?, ?)');
  
  let count = 0;
  for (const poll of polls) {
    for (const [party, pct] of Object.entries(poll.parties)) {
      stmt.run(year, poll.date, poll.pollster, party, pct, null, 'Wikipedia');
      count++;
    }
  }
  
  console.log(`Saved ${count} poll entries for ${year}`);
}

// Add some sample historical results (actual election results)
function addHistoricalResults() {
  const historicalResults = {
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
  };
  
  console.log('Adding historical election results...');
  
  for (const [year, results] of Object.entries(historicalResults)) {
    saveResults(parseInt(year), results);
  }
}

// Main function
async function main() {
  const years = [2009, 2013, 2017, 2021];
  
  // Add historical results first
  addHistoricalResults();
  
  // Fetch polls for each year
  for (const year of years) {
    const polls = await fetchWikipediaPolls(year);
    if (polls.length > 0) {
      savePolls(year, polls);
    }
  }
  
  console.log('Data fetching complete!');
  db.close();
}

main().catch(console.error);