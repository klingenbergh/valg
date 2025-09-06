const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Load existing data or create new
let electionData = { results: {}, polls: {} };
if (fs.existsSync('election-data.json')) {
  electionData = JSON.parse(fs.readFileSync('election-data.json', 'utf8'));
}

// Party name normalization
function normalizeParty(name) {
  const n = name.toLowerCase();
  if (n.includes('arbeider') || n === 'ap') return 'Ap';
  if (n.includes('høyre') || n === 'h') return 'H';
  if (n.includes('fremskritt') || n === 'frp') return 'FrP';
  if (n.includes('senter') || n === 'sp') return 'Sp';
  if (n.includes('sosialistisk') || n === 'sv') return 'SV';
  if (n === 'v' || (n.includes('venstre') && !n.includes('sosialistisk'))) return 'V';
  if (n.includes('kristelig') || n === 'krf') return 'KrF';
  if (n.includes('miljø') || n.includes('grøn') || n === 'mdg') return 'MDG';
  if (n === 'r' || n.includes('rødt')) return 'R';
  return name;
}

// Fetch Wikipedia polls
async function fetchWikipediaPolls(year) {
  console.log(`Fetching Wikipedia polls for ${year}...`);
  const url = `https://en.wikipedia.org/wiki/Opinion_polling_for_the_${year}_Norwegian_parliamentary_election`;
  
  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    const $ = cheerio.load(response.data);
    const polls = [];
    
    // Find poll tables
    $('table.wikitable').each((i, table) => {
      const headers = [];
      $(table).find('tr').first().find('th').each((j, th) => {
        headers.push($(th).text().trim());
      });
      
      // Check if this is a polling table
      const hasDate = headers.some(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('fieldwork'));
      if (!hasDate) return;
      
      // Process rows
      $(table).find('tr').slice(1).each((k, row) => {
        const cells = [];
        $(row).find('td, th').each((l, cell) => {
          cells.push($(cell).text().trim());
        });
        
        if (cells.length < 3) return;
        
        const dateText = cells[0];
        const pollster = (cells[1] || 'Unknown').replace(/\[.*?\]/g, '').trim();
        
        // Parse date
        let date = parseDate(dateText, year);
        if (!date) return;
        
        // Extract party results
        const parties = {};
        for (let m = 2; m < headers.length && m < cells.length; m++) {
          const header = headers[m];
          const value = cells[m];
          
          const party = identifyPartyFromHeader(header);
          if (party && value && value !== '–' && value !== '-') {
            const pct = parseFloat(value.replace(',', '.').replace('%', ''));
            if (!isNaN(pct)) {
              parties[party] = pct;
            }
          }
        }
        
        if (Object.keys(parties).length > 0) {
          polls.push({ date, pollster, parties });
        }
      });
    });
    
    console.log(`Found ${polls.length} polls for ${year}`);
    return polls;
  } catch (error) {
    console.log(`Failed to fetch polls for ${year}: ${error.message}`);
    return [];
  }
}

function parseDate(dateText, year) {
  const cleaned = dateText.replace(/\[.*?\]/g, '').trim();
  const months = {
    'january': '01', 'jan': '01', 'february': '02', 'feb': '02',
    'march': '03', 'mar': '03', 'april': '04', 'apr': '04',
    'may': '05', 'june': '06', 'jun': '06', 'july': '07', 'jul': '07',
    'august': '08', 'aug': '08', 'september': '09', 'sep': '09', 'sept': '09',
    'october': '10', 'oct': '10', 'november': '11', 'nov': '11',
    'december': '12', 'dec': '12'
  };
  
  // Try different patterns
  for (const [monthName, monthNum] of Object.entries(months)) {
    if (cleaned.toLowerCase().includes(monthName)) {
      const dayMatch = cleaned.match(/(\d{1,2})/);
      if (dayMatch) {
        const day = dayMatch[1].padStart(2, '0');
        return `${year}-${monthNum}-${day}`;
      }
    }
  }
  return null;
}

function identifyPartyFromHeader(header) {
  const h = header.toLowerCase();
  if (h === 'ap' || h.includes('arbeider') || h.includes('labour')) return 'Ap';
  if (h === 'h' || (h.includes('høyre') && !h.includes('venstre')) || h.includes('conservative')) return 'H';
  if (h === 'frp' || h.includes('fremskritt') || h.includes('progress')) return 'FrP';
  if (h === 'sp' || h.includes('senter') || h.includes('centre')) return 'Sp';
  if (h === 'sv' || h.includes('sosialistisk') || h.includes('socialist left')) return 'SV';
  if (h === 'v' || (h.includes('venstre') && !h.includes('sosialistisk')) || h.includes('liberal')) return 'V';
  if (h === 'krf' || h.includes('kristelig') || h.includes('christian')) return 'KrF';
  if (h === 'mdg' || h.includes('miljø') || h.includes('grøn') || h.includes('green')) return 'MDG';
  if (h === 'r' || h.includes('rødt') || h.includes('red')) return 'R';
  return null;
}

// Main function
async function main() {
  const years = [2021, 2017, 2013, 2009];
  
  for (const year of years) {
    const polls = await fetchWikipediaPolls(year);
    if (polls.length > 0) {
      electionData.polls[year] = polls;
    }
  }
  
  // Save data
  fs.writeFileSync('election-data.json', JSON.stringify(electionData, null, 2));
  console.log('\nData saved to election-data.json');
  console.log('You can now restart the server to see the updated data.');
}

main().catch(console.error);