const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, 'election.db');
const db = new sqlite3.Database(dbPath);

console.log('Adding 2025 election year...');

db.serialize(() => {
  // Add 2025 as a placeholder election year
  db.run(
    "INSERT OR REPLACE INTO results (year, party_id, pct, seats, source) VALUES (2025, 'PLACEHOLDER', 0, 0, 'Future election')",
    (err) => {
      if (err) {
        console.error('Error adding 2025:', err);
      } else {
        console.log('✓ Added 2025 as election year');
      }
    }
  );
  
  // Also update any polls from 2022 onwards to be associated with 2025
  db.run(
    "UPDATE polls SET year = 2025 WHERE date >= '2022-01-01'",
    function(err) {
      if (err) {
        console.error('Error updating polls:', err);
      } else {
        console.log(`✓ Updated ${this.changes} polls to be associated with 2025 election`);
      }
    }
  );
  
  // Verify
  setTimeout(() => {
    db.all("SELECT DISTINCT year FROM results ORDER BY year DESC", (err, rows) => {
      if (!err && rows) {
        console.log('\nElection years in database:');
        rows.forEach(row => console.log('  -', row.year));
      }
      
      db.get("SELECT COUNT(*) as count FROM polls WHERE year = 2025", (err, row) => {
        if (!err && row) {
          console.log(`\n2025 election has ${row.count} polls`);
        }
        db.close();
      });
    });
  }, 500);
});