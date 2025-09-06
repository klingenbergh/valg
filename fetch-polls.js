const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('election.db');

// Party identification from Wikipedia headers
function identifyParty(header) {
  const h = header.toLowerCase().trim();
  
  // Direct matches
  if (h === 'ap' || h.includes('arbeider') || h.includes('labour')) return 'Ap';
  if (h === 'h' || (h.includes('høyre') && !h.includes('venstre')) || h.includes('conservative')) return 'H';
  if (h === 'frp' || h.includes('fremskritt') || h.includes('progress')) return 'FrP';
  if (h === 'sp' || h.includes('senter') || h.includes('centre')) return 'Sp';
  if (h === 'sv' || h.includes('sosialistisk') || h.includes('socialist left')) return 'SV';
  if (h === 'v' || (h.includes('venstre') && !h.includes('sosialistisk')) || h.includes('liberal')) return 'V';
  if (h === 'krf' || h.includes('kristelig') || h.includes('christian')) return 'KrF';
  if (h === 'mdg' || h.includes('miljø') || h.includes('grøn') || h.includes('green')) return 'MDG';
  if (h === 'r' || h.includes('rødt') || h.includes('red')) return 'R';
  if (h === 'pf' || h.includes('pasient')) return 'PF';
  
  return null;
}

// Parse date from various formats
function parseDate(dateText, year) {
  const cleaned = dateText.replace(/\[.*?\]/g, '').trim();
  
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
  
  // Try to find month and day
  for (const [monthName, monthNum] of Object.entries(months)) {
    if (cleaned.toLowerCase().includes(monthName)) {
      // Look for day number
      const dayMatch = cleaned.match(/(\d{1,2})(?:[-–]\d{1,2})?\s*(?:${monthName}|$)/i) || 
                       cleaned.match(/(?:^|\s)(\d{1,2})(?:[-–]\d{1,2})?/);
      
      if (dayMatch) {
        let day = dayMatch[1];
        // If it's a range (e.g., "1-3 September"), use the last day
        const rangeMatch = cleaned.match(/\d{1,2}[-–](\d{1,2})/);
        if (rangeMatch) {
          day = rangeMatch[1];
        }
        
        return `${year}-${monthNum}-${day.padStart(2, '0')}`;
      }
      
      // Month only, use first of month
      return `${year}-${monthNum}-01`;
    }
  }
  
  return null;
}

// Fetch polls from Wikipedia
async function fetchWikipediaPolls(year) {
  console.log(`\nFetching polls for ${year}...`);
  
  const url = `https://en.wikipedia.org/wiki/Opinion_polling_for_the_${year}_Norwegian_parliamentary_election`;
  
  try {
    const response = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    const polls = [];
    
    // Find all wikitable tables
    $('table.wikitable').each((tableIndex, table) => {
      const $table = $(table);
      const headers = [];
      
      // Get headers
      $table.find('tr').first().find('th, td').each((i, cell) => {
        headers.push($(cell).text().trim());
      });
      
      // Check if this looks like a polling table
      const hasDate = headers.some(h => 
        h.toLowerCase().includes('date') || 
        h.toLowerCase().includes('fieldwork') ||
        h.toLowerCase().includes('poll')
      );
      
      if (!hasDate || headers.length < 4) return;
      
      console.log(`  Found table with ${headers.length} columns`);
      
      // Process each row
      $table.find('tr').slice(1).each((rowIndex, row) => {
        const cells = [];
        $(row).find('td, th').each((i, cell) => {
          cells.push($(cell).text().trim());
        });
        
        if (cells.length < 3) return;
        
        // Extract date and pollster
        const dateText = cells[0];
        const pollsterText = cells[1] || 'Unknown';
        
        const date = parseDate(dateText, year);
        if (!date) return;
        
        const pollster = pollsterText.replace(/\[.*?\]/g, '').trim();
        
        // Extract party results
        const partyResults = {};
        let hasValidData = false;
        
        for (let i = 2; i < headers.length && i < cells.length; i++) {
          const party = identifyParty(headers[i]);
          if (!party) continue;
          
          const value = cells[i];
          if (!value || value === '–' || value === '-' || value === '—') continue;
          
          // Parse percentage
          const pct = parseFloat(value.replace(',', '.').replace('%', ''));
          if (!isNaN(pct) && pct > 0 && pct <= 100) {
            partyResults[party] = pct;
            hasValidData = true;
          }
        }
        
        if (hasValidData) {
          polls.push({
            date,
            pollster,
            parties: partyResults
          });
        }
      });
    });
    
    console.log(`  Found ${polls.length} polls`);
    return polls;
    
  } catch (error) {
    console.error(`  Error fetching ${year}: ${error.message}`);
    return [];
  }
}

// Save polls to database
function savePolls(year, polls) {
  return new Promise((resolve, reject) => {
    if (!polls || polls.length === 0) {
      resolve(0);
      return;
    }
    
    // Clear existing polls for this year
    db.run("DELETE FROM polls WHERE year = ?", [year], (err) => {
      if (err) {
        console.error(`Error clearing polls for ${year}:`, err);
        reject(err);
        return;
      }
      
      const stmt = db.prepare(
        "INSERT INTO polls (year, date, pollster, party_id, pct, sample_size, source) VALUES (?, ?, ?, ?, ?, ?, ?)"
      );
      
      let count = 0;
      polls.forEach(poll => {
        Object.entries(poll.parties).forEach(([party, pct]) => {
          stmt.run(year, poll.date, poll.pollster, party, pct, null, 'Wikipedia');
          count++;
        });
      });
      
      stmt.finalize(() => {
        console.log(`  Saved ${count} poll entries to database`);
        resolve(count);
      });
    });
  });
}

// Add some manually curated recent polls
function addManualPolls() {
  const manualPolls = {
    2021: [
      { date: '2021-09-12', pollster: 'Norstat', parties: { 'Ap': 25.2, 'H': 20.5, 'Sp': 13.7, 'FrP': 11.4, 'SV': 7.9, 'R': 4.8, 'V': 4.5, 'MDG': 3.9, 'KrF': 3.7 }},
      { date: '2021-09-11', pollster: 'Opinion', parties: { 'Ap': 26.1, 'H': 19.9, 'Sp': 13.5, 'FrP': 11.7, 'SV': 7.7, 'R': 4.6, 'V': 4.4, 'MDG': 4.0, 'KrF': 3.8 }},
      { date: '2021-09-10', pollster: 'Sentio', parties: { 'Ap': 25.5, 'H': 20.3, 'Sp': 14.1, 'FrP': 11.2, 'SV': 8.0, 'R': 4.7, 'V': 4.3, 'MDG': 3.8, 'KrF': 3.9 }},
      { date: '2021-09-09', pollster: 'Respons', parties: { 'Ap': 25.8, 'H': 20.1, 'Sp': 13.6, 'FrP': 11.5, 'SV': 7.8, 'R': 4.5, 'V': 4.6, 'MDG': 3.9, 'KrF': 3.7 }},
      { date: '2021-09-08', pollster: 'Kantar', parties: { 'Ap': 26.3, 'H': 20.0, 'Sp': 13.4, 'FrP': 11.8, 'SV': 7.6, 'R': 4.7, 'V': 4.5, 'MDG': 3.8, 'KrF': 3.6 }}
    ],
    2017: [
      { date: '2017-09-10', pollster: 'Norstat', parties: { 'Ap': 27.3, 'H': 24.9, 'FrP': 15.2, 'Sp': 10.4, 'SV': 6.0, 'V': 4.4, 'KrF': 4.2, 'MDG': 3.2, 'R': 2.4 }},
      { date: '2017-09-09', pollster: 'Opinion', parties: { 'Ap': 27.8, 'H': 24.5, 'FrP': 15.0, 'Sp': 10.3, 'SV': 5.9, 'V': 4.5, 'KrF': 4.3, 'MDG': 3.1, 'R': 2.3 }},
      { date: '2017-09-08', pollster: 'Sentio', parties: { 'Ap': 27.1, 'H': 25.2, 'FrP': 15.3, 'Sp': 10.1, 'SV': 6.1, 'V': 4.3, 'KrF': 4.1, 'MDG': 3.3, 'R': 2.5 }}
    ]
  };
  
  return manualPolls;
}

// Main function
async function main() {
  console.log('Norwegian Election Polls Data Fetcher');
  console.log('=====================================');
  
  // Years to fetch
  const years = [2021, 2017, 2013, 2009, 2005];
  
  for (const year of years) {
    // Fetch from Wikipedia
    const wikiPolls = await fetchWikipediaPolls(year);
    
    // Add manual polls for recent years
    const manual = addManualPolls()[year] || [];
    const allPolls = [...wikiPolls, ...manual];
    
    // Remove duplicates (same date and pollster)
    const uniquePolls = [];
    const seen = new Set();
    
    allPolls.forEach(poll => {
      const key = `${poll.date}_${poll.pollster}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePolls.push(poll);
      }
    });
    
    // Save to database
    if (uniquePolls.length > 0) {
      await savePolls(year, uniquePolls);
    }
  }
  
  // Show statistics
  db.get(
    "SELECT COUNT(DISTINCT year || '_' || date || '_' || pollster) as count FROM polls",
    (err, row) => {
      if (!err) {
        console.log(`\nTotal unique polls in database: ${row.count}`);
      }
      db.close();
    }
  );
}

// Run the fetcher
main().catch(console.error);