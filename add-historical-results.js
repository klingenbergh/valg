const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, 'election.db');
const db = new sqlite3.Database(dbPath);

// Historical election results from 1945-1981
const historicalResults = {
  1981: [
    { party_id: 'Ap', pct: 37.2, seats: 66 },
    { party_id: 'H', pct: 31.7, seats: 53 },
    { party_id: 'KrF', pct: 9.4, seats: 15 },
    { party_id: 'Sp', pct: 6.7, seats: 11 },
    { party_id: 'SV', pct: 4.9, seats: 4 },
    { party_id: 'V', pct: 3.9, seats: 2 },
    { party_id: 'FrP', pct: 4.5, seats: 4 }
  ],
  1977: [
    { party_id: 'Ap', pct: 42.3, seats: 76 },
    { party_id: 'H', pct: 24.8, seats: 41 },
    { party_id: 'KrF', pct: 12.4, seats: 22 },
    { party_id: 'Sp', pct: 8.6, seats: 12 },
    { party_id: 'SV', pct: 4.2, seats: 2 },
    { party_id: 'V', pct: 3.2, seats: 2 },
    { party_id: 'FrP', pct: 1.9, seats: 0 }
  ],
  1973: [
    { party_id: 'Ap', pct: 35.3, seats: 62 },
    { party_id: 'H', pct: 17.4, seats: 29 },
    { party_id: 'KrF', pct: 12.2, seats: 20 },
    { party_id: 'Sp', pct: 11.0, seats: 21 },
    { party_id: 'SV', pct: 11.2, seats: 16 },
    { party_id: 'V', pct: 3.5, seats: 2 },
    { party_id: 'FrP', pct: 5.0, seats: 4 },
    { party_id: 'NLP', pct: 3.4, seats: 1 }
  ],
  1969: [
    { party_id: 'Ap', pct: 46.5, seats: 74 },
    { party_id: 'H', pct: 19.6, seats: 29 },
    { party_id: 'KrF', pct: 9.4, seats: 14 },
    { party_id: 'Sp', pct: 10.5, seats: 20 },
    { party_id: 'V', pct: 9.4, seats: 13 }
  ],
  1965: [
    { party_id: 'Ap', pct: 43.1, seats: 68 },
    { party_id: 'H', pct: 21.1, seats: 31 },
    { party_id: 'KrF', pct: 7.9, seats: 13 },
    { party_id: 'Sp', pct: 9.4, seats: 18 },
    { party_id: 'V', pct: 10.4, seats: 18 },
    { party_id: 'SF', pct: 6.0, seats: 2 }
  ],
  1961: [
    { party_id: 'Ap', pct: 46.8, seats: 74 },
    { party_id: 'H', pct: 20.0, seats: 29 },
    { party_id: 'KrF', pct: 9.3, seats: 15 },
    { party_id: 'Sp', pct: 8.8, seats: 16 },
    { party_id: 'V', pct: 7.2, seats: 14 },
    { party_id: 'SF', pct: 2.3, seats: 2 }
  ],
  1957: [
    { party_id: 'Ap', pct: 48.3, seats: 78 },
    { party_id: 'H', pct: 18.9, seats: 29 },
    { party_id: 'KrF', pct: 10.2, seats: 12 },
    { party_id: 'BL', pct: 9.2, seats: 15 },
    { party_id: 'V', pct: 6.6, seats: 15 },
    { party_id: 'KP', pct: 3.4, seats: 1 }
  ],
  1953: [
    { party_id: 'Ap', pct: 46.7, seats: 77 },
    { party_id: 'H', pct: 18.4, seats: 27 },
    { party_id: 'KrF', pct: 10.5, seats: 14 },
    { party_id: 'BL', pct: 8.8, seats: 14 },
    { party_id: 'V', pct: 7.8, seats: 15 },
    { party_id: 'KP', pct: 5.1, seats: 3 }
  ],
  1949: [
    { party_id: 'Ap', pct: 45.7, seats: 85 },
    { party_id: 'H', pct: 15.9, seats: 23 },
    { party_id: 'KrF', pct: 8.5, seats: 9 },
    { party_id: 'BL', pct: 12.4, seats: 12 },
    { party_id: 'V', pct: 13.1, seats: 21 },
    { party_id: 'KP', pct: 5.8, seats: 0 }
  ],
  1945: [
    { party_id: 'Ap', pct: 41.0, seats: 76 },
    { party_id: 'H', pct: 17.0, seats: 25 },
    { party_id: 'KrF', pct: 7.9, seats: 8 },
    { party_id: 'BL', pct: 8.2, seats: 10 },
    { party_id: 'V', pct: 13.8, seats: 20 },
    { party_id: 'KP', pct: 11.9, seats: 11 }
  ]
};

function insertHistoricalResults() {
  console.log('Adding historical election results...');
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO results (year, party_id, pct, seats, source) VALUES (?, ?, ?, ?, ?)'
    );
    
    let insertCount = 0;
    let errorCount = 0;
    
    Object.entries(historicalResults).forEach(([year, results]) => {
      results.forEach(result => {
        stmt.run(
          parseInt(year),
          result.party_id,
          result.pct,
          result.seats,
          'Historical records',
          (err) => {
            if (err) {
              console.error(`Error inserting ${year} ${result.party_id}:`, err);
              errorCount++;
            } else {
              insertCount++;
            }
          }
        );
      });
    });
    
    stmt.finalize(() => {
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Error committing transaction:', err);
          db.run('ROLLBACK');
        } else {
          console.log(`\n✅ Historical results added!`);
          console.log(`   Inserted: ${insertCount} results`);
          console.log(`   Errors: ${errorCount}`);
          
          // Verify results
          db.all('SELECT year, COUNT(*) as count FROM results GROUP BY year ORDER BY year', (err, rows) => {
            if (!err && rows) {
              console.log('\n📊 Election results in database:');
              rows.forEach(row => {
                console.log(`   ${row.year}: ${row.count} parties`);
              });
            }
            
            db.close();
          });
        }
      });
    });
  });
}

// Run import
console.log('🔄 Adding historical election results (1945-1981)...');
console.log(`   Database: ${dbPath}`);
console.log('');

insertHistoricalResults();