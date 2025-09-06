const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, 'election.db');
const db = new sqlite3.Database(dbPath);

// CSV file path
const csvPath = 'C:\\Temp\\valg\\opinion_polls_1964_2021_tidy.csv';

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    data.push(row);
  }
  
  return data;
}

function importPolls() {
  console.log('Reading CSV file...');
  
  fs.readFile(csvPath, 'utf8', (err, csvText) => {
    if (err) {
      console.error('Error reading CSV file:', err);
      return;
    }
    
    const polls = parseCSV(csvText);
    console.log(`Found ${polls.length} poll entries to import`);
    
    // Begin transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // Delete existing polls from 1964-2021
      db.run('DELETE FROM polls WHERE year >= 1964 AND year <= 2021', (err) => {
        if (err) {
          console.error('Error clearing existing polls:', err);
          db.run('ROLLBACK');
          return;
        }
        console.log('Cleared existing poll data for years 1964-2021');
      });
      
      // Prepare insert statement
      const stmt = db.prepare(
        'INSERT INTO polls (year, date, pollster, party_id, pct, source) VALUES (?, ?, ?, ?, ?, ?)'
      );
      
      let importCount = 0;
      let errorCount = 0;
      
      // Import each poll entry
      polls.forEach(poll => {
        const year = parseInt(poll['ÅR']);
        const date = poll['Dato'];
        const pollster = poll['Måler'];
        const party = poll['Parti'];
        const pct = parseFloat(poll['Oppslutning']);
        
        if (year && date && pollster && party && !isNaN(pct)) {
          stmt.run(year, date, pollster, party, pct, 'opinion_polls_1964_2021_tidy.csv', (err) => {
            if (err) {
              console.error(`Error importing poll: ${year} ${date} ${party}`, err);
              errorCount++;
            } else {
              importCount++;
            }
          });
        } else {
          console.warn(`Skipping invalid row: ${JSON.stringify(poll)}`);
          errorCount++;
        }
      });
      
      stmt.finalize(() => {
        db.run('COMMIT', (err) => {
          if (err) {
            console.error('Error committing transaction:', err);
            db.run('ROLLBACK');
          } else {
            console.log(`\n✅ Import completed!`);
            console.log(`   Imported: ${importCount} poll entries`);
            console.log(`   Errors: ${errorCount} entries`);
            
            // Verify import
            db.get('SELECT COUNT(*) as count FROM polls WHERE year >= 1964 AND year <= 2021', (err, row) => {
              if (err) {
                console.error('Error verifying import:', err);
              } else {
                console.log(`   Total polls in database (1964-2021): ${row.count}`);
              }
              
              // Show sample of imported data
              db.all('SELECT year, COUNT(*) as count FROM polls WHERE year >= 1964 AND year <= 2021 GROUP BY year ORDER BY year LIMIT 10', (err, rows) => {
                if (!err && rows) {
                  console.log('\n📊 Sample of imported data by year:');
                  rows.forEach(row => {
                    console.log(`   ${row.year}: ${row.count} polls`);
                  });
                }
                
                db.close();
              });
            });
          }
        });
      });
    });
  });
}

// Run import
console.log('🔄 Starting poll data import from CSV...');
console.log(`   Source: ${csvPath}`);
console.log(`   Database: ${dbPath}`);
console.log('');

importPolls();