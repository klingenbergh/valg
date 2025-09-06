const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, 'election.db');
const db = new sqlite3.Database(dbPath);

console.log('Fixing party names in database...');

// Based on analysis of Norwegian election data:
// Unnamed: 6 appears to be FrP (typically 5-15% support)
// Unnamed: 12 appears to be MDG (typically 2-5% support)
// SF should be SV in modern times
// NKP in recent years should be R (Rødt)

db.serialize(() => {
  db.run('BEGIN TRANSACTION');
  
  // Fix FrP (Unnamed: 6 is likely FrP based on vote percentages)
  db.run("UPDATE polls SET party_id = 'FrP' WHERE party_id = 'Unnamed: 6'", (err) => {
    if (err) console.error('Error updating Unnamed: 6 to FrP:', err);
    else console.log('✓ Updated Unnamed: 6 to FrP');
  });
  
  // Fix MDG (Unnamed: 12 is likely MDG based on vote percentages)
  db.run("UPDATE polls SET party_id = 'MDG' WHERE party_id = 'Unnamed: 12'", (err) => {
    if (err) console.error('Error updating Unnamed: 12 to MDG:', err);
    else console.log('✓ Updated Unnamed: 12 to MDG');
  });
  
  // Fix SV (SF is the old name for SV)
  db.run("UPDATE polls SET party_id = 'SV' WHERE party_id = 'SF'", (err) => {
    if (err) console.error('Error updating SF to SV:', err);
    else console.log('✓ Updated SF to SV');
  });
  
  // Fix R (NKP in recent years should be R)
  db.run("UPDATE polls SET party_id = 'R' WHERE party_id = 'NKP' AND date >= '2007-01-01'", (err) => {
    if (err) console.error('Error updating recent NKP to R:', err);
    else console.log('✓ Updated recent NKP (post-2007) to R');
  });
  
  // Fix any other unnamed columns to Others
  db.run("UPDATE polls SET party_id = 'Others' WHERE party_id LIKE 'Unnamed%'", (err) => {
    if (err) console.error('Error updating other Unnamed to Others:', err);
    else console.log('✓ Updated remaining Unnamed columns to Others');
  });
  
  db.run('COMMIT', (err) => {
    if (err) {
      console.error('Error committing transaction:', err);
      db.run('ROLLBACK');
    } else {
      console.log('\n✅ Successfully fixed party names!');
      
      // Verify the fix
      db.all("SELECT DISTINCT party_id FROM polls WHERE date > '2020-01-01' ORDER BY party_id", (err, rows) => {
        if (!err && rows) {
          console.log('\nParties in recent polls:');
          rows.forEach(row => console.log('  -', row.party_id));
        }
        
        db.close();
      });
    }
  });
});