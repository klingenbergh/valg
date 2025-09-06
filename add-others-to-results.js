const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, 'election.db');
const db = new sqlite3.Database(dbPath);

console.log('Adding "Others" to election results for missing percentages...\n');

db.serialize(() => {
  // Get all election years
  db.all("SELECT DISTINCT year FROM results ORDER BY year", (err, years) => {
    if (err) {
      console.error('Error getting years:', err);
      return;
    }
    
    years.forEach(yearRow => {
      const year = yearRow.year;
      
      // Calculate total percentage for each year
      db.get(
        "SELECT SUM(pct) as total FROM results WHERE year = ?",
        [year],
        (err, row) => {
          if (err) {
            console.error(`Error calculating total for ${year}:`, err);
            return;
          }
          
          const total = row.total || 0;
          const othersPercentage = 100 - total;
          
          if (othersPercentage > 0.1) { // Only add if significant (>0.1%)
            // Check if Others already exists for this year
            db.get(
              "SELECT * FROM results WHERE year = ? AND party_id = 'Others'",
              [year],
              (err, existing) => {
                if (err) {
                  console.error(`Error checking for Others in ${year}:`, err);
                  return;
                }
                
                if (!existing) {
                  // Add Others entry
                  db.run(
                    "INSERT INTO results (year, party_id, pct, seats, source) VALUES (?, 'Others', ?, 0, 'Calculated from missing votes')",
                    [year, othersPercentage.toFixed(1)],
                    (err) => {
                      if (err) {
                        console.error(`Error adding Others for ${year}:`, err);
                      } else {
                        console.log(`✓ Added "Others" for ${year}: ${othersPercentage.toFixed(1)}%`);
                      }
                    }
                  );
                } else {
                  console.log(`- "Others" already exists for ${year}`);
                }
              }
            );
          } else {
            console.log(`- ${year}: No significant others percentage (${othersPercentage.toFixed(1)}%)`);
          }
        }
      );
    });
    
    // After a delay to let all operations complete, verify the results
    setTimeout(() => {
      console.log('\n📊 Verification - Total percentages by year:');
      db.all(
        "SELECT year, SUM(pct) as total FROM results GROUP BY year ORDER BY year DESC",
        (err, rows) => {
          if (!err && rows) {
            rows.forEach(row => {
              console.log(`  ${row.year}: ${row.total.toFixed(1)}%`);
            });
          }
          db.close();
        }
      );
    }, 2000);
  });
});