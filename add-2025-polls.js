const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, 'election.db');
const db = new sqlite3.Database(dbPath);

console.log('Adding 2025 opinion polls...\n');

// 2025 polls (projected/hypothetical polls for the election year)
const polls2025 = [
  // September 2025 - Final polls before election
  { date: '2025-09-06', pollster: 'Norstat', parties: { 'H': 25.8, 'FrP': 20.1, 'Ap': 17.2, 'SV': 9.5, 'Sp': 5.5, 'V': 5.0, 'R': 5.3, 'MDG': 3.4, 'KrF': 3.9 }},
  { date: '2025-09-05', pollster: 'Opinion', parties: { 'H': 26.2, 'FrP': 19.8, 'Ap': 16.9, 'SV': 9.8, 'Sp': 5.3, 'V': 4.9, 'R': 5.5, 'KrF': 4.1, 'MDG': 3.3 }},
  { date: '2025-09-04', pollster: 'Respons', parties: { 'H': 25.5, 'FrP': 20.3, 'Ap': 17.5, 'SV': 9.3, 'Sp': 5.7, 'V': 5.1, 'R': 5.1, 'MDG': 3.5, 'KrF': 3.8 }},
  { date: '2025-09-03', pollster: 'Kantar TNS', parties: { 'H': 26.0, 'FrP': 19.9, 'Ap': 17.1, 'SV': 9.6, 'Sp': 5.6, 'V': 5.2, 'R': 5.2, 'KrF': 4.0, 'MDG': 3.4 }},
  { date: '2025-09-01', pollster: 'Norstat', parties: { 'H': 25.9, 'FrP': 19.7, 'Ap': 17.3, 'SV': 9.4, 'Sp': 5.8, 'V': 5.0, 'R': 5.4, 'MDG': 3.6, 'KrF': 3.9 }},
  
  // August 2025
  { date: '2025-08-25', pollster: 'Opinion', parties: { 'H': 26.5, 'FrP': 19.2, 'Ap': 17.0, 'SV': 9.7, 'Sp': 5.4, 'V': 5.1, 'R': 5.6, 'KrF': 4.2, 'MDG': 3.2 }},
  { date: '2025-08-15', pollster: 'Respons', parties: { 'H': 26.1, 'FrP': 19.5, 'Ap': 17.4, 'SV': 9.2, 'Sp': 5.9, 'V': 5.0, 'R': 5.2, 'MDG': 3.7, 'KrF': 3.9 }},
  { date: '2025-08-10', pollster: 'Kantar TNS', parties: { 'H': 26.3, 'FrP': 19.3, 'Ap': 17.2, 'SV': 9.5, 'Sp': 5.7, 'V': 5.3, 'R': 5.3, 'KrF': 4.1, 'MDG': 3.3 }},
  { date: '2025-08-01', pollster: 'Norstat', parties: { 'H': 26.7, 'FrP': 18.9, 'Ap': 17.6, 'SV': 9.1, 'Sp': 6.0, 'V': 4.9, 'R': 5.5, 'MDG': 3.8, 'KrF': 3.8 }},
  
  // July 2025
  { date: '2025-07-20', pollster: 'Opinion', parties: { 'H': 27.0, 'FrP': 18.6, 'Ap': 17.3, 'SV': 9.4, 'Sp': 5.6, 'V': 5.2, 'R': 5.7, 'KrF': 4.3, 'MDG': 3.1 }},
  { date: '2025-07-15', pollster: 'Respons', parties: { 'H': 26.8, 'FrP': 18.8, 'Ap': 17.7, 'SV': 9.0, 'Sp': 6.1, 'V': 4.8, 'R': 5.3, 'MDG': 3.9, 'KrF': 3.9 }},
  { date: '2025-07-01', pollster: 'Kantar TNS', parties: { 'H': 26.9, 'FrP': 18.7, 'Ap': 17.5, 'SV': 9.3, 'Sp': 5.8, 'V': 5.4, 'R': 5.4, 'KrF': 4.2, 'MDG': 3.2 }},
  
  // June 2025
  { date: '2025-06-20', pollster: 'Norstat', parties: { 'H': 27.2, 'FrP': 18.3, 'Ap': 17.8, 'SV': 8.9, 'Sp': 6.2, 'V': 4.7, 'R': 5.6, 'MDG': 4.0, 'KrF': 3.7 }},
  { date: '2025-06-15', pollster: 'Opinion', parties: { 'H': 27.5, 'FrP': 18.1, 'Ap': 17.4, 'SV': 9.2, 'Sp': 5.7, 'V': 5.3, 'R': 5.8, 'KrF': 4.4, 'MDG': 3.0 }},
  { date: '2025-06-01', pollster: 'Respons', parties: { 'H': 27.1, 'FrP': 18.4, 'Ap': 17.9, 'SV': 8.8, 'Sp': 6.3, 'V': 4.6, 'R': 5.4, 'MDG': 4.1, 'KrF': 3.8 }},
  
  // May 2025
  { date: '2025-05-20', pollster: 'Kantar TNS', parties: { 'H': 27.3, 'FrP': 18.2, 'Ap': 17.6, 'SV': 9.1, 'Sp': 5.9, 'V': 5.5, 'R': 5.5, 'KrF': 4.3, 'MDG': 3.1 }},
  { date: '2025-05-15', pollster: 'Norstat', parties: { 'H': 27.6, 'FrP': 17.9, 'Ap': 18.0, 'SV': 8.7, 'Sp': 6.4, 'V': 4.5, 'R': 5.7, 'MDG': 4.2, 'KrF': 3.6 }},
  { date: '2025-05-01', pollster: 'Opinion', parties: { 'H': 27.8, 'FrP': 17.7, 'Ap': 17.5, 'SV': 9.0, 'Sp': 5.8, 'V': 5.4, 'R': 5.9, 'KrF': 4.5, 'MDG': 2.9 }},
  
  // April 2025
  { date: '2025-04-20', pollster: 'Respons', parties: { 'H': 27.4, 'FrP': 18.0, 'Ap': 18.1, 'SV': 8.6, 'Sp': 6.5, 'V': 4.4, 'R': 5.5, 'MDG': 4.3, 'KrF': 3.7 }},
  { date: '2025-04-15', pollster: 'Kantar TNS', parties: { 'H': 27.5, 'FrP': 17.8, 'Ap': 17.7, 'SV': 8.9, 'Sp': 6.0, 'V': 5.6, 'R': 5.6, 'KrF': 4.4, 'MDG': 3.0 }},
  { date: '2025-04-01', pollster: 'Norstat', parties: { 'H': 27.9, 'FrP': 17.5, 'Ap': 18.2, 'SV': 8.5, 'Sp': 6.6, 'V': 4.3, 'R': 5.8, 'MDG': 4.4, 'KrF': 3.5 }},
  
  // March 2025
  { date: '2025-03-20', pollster: 'Opinion', parties: { 'H': 28.1, 'FrP': 17.3, 'Ap': 17.6, 'SV': 8.8, 'Sp': 5.9, 'V': 5.5, 'R': 6.0, 'KrF': 4.6, 'MDG': 2.8 }},
  { date: '2025-03-15', pollster: 'Respons', parties: { 'H': 27.6, 'FrP': 17.6, 'Ap': 18.3, 'SV': 8.4, 'Sp': 6.7, 'V': 4.2, 'R': 5.6, 'MDG': 4.5, 'KrF': 3.6 }},
  { date: '2025-03-01', pollster: 'Kantar TNS', parties: { 'H': 27.7, 'FrP': 17.4, 'Ap': 17.8, 'SV': 8.7, 'Sp': 6.1, 'V': 5.7, 'R': 5.7, 'KrF': 4.5, 'MDG': 2.9 }},
  
  // February 2025
  { date: '2025-02-20', pollster: 'Norstat', parties: { 'H': 28.0, 'FrP': 17.1, 'Ap': 18.4, 'SV': 8.3, 'Sp': 6.8, 'V': 4.1, 'R': 5.9, 'MDG': 4.6, 'KrF': 3.4 }},
  { date: '2025-02-15', pollster: 'Opinion', parties: { 'H': 28.3, 'FrP': 16.9, 'Ap': 17.7, 'SV': 8.6, 'Sp': 6.0, 'V': 5.6, 'R': 6.1, 'KrF': 4.7, 'MDG': 2.7 }},
  { date: '2025-02-01', pollster: 'Respons', parties: { 'H': 27.8, 'FrP': 17.2, 'Ap': 18.5, 'SV': 8.2, 'Sp': 6.9, 'V': 4.0, 'R': 5.7, 'MDG': 4.7, 'KrF': 3.5 }},
  
  // January 2025
  { date: '2025-01-20', pollster: 'Kantar TNS', parties: { 'H': 27.9, 'FrP': 17.0, 'Ap': 17.9, 'SV': 8.5, 'Sp': 6.2, 'V': 5.8, 'R': 5.8, 'KrF': 4.6, 'MDG': 2.8 }},
  { date: '2025-01-15', pollster: 'Norstat', parties: { 'H': 28.2, 'FrP': 16.8, 'Ap': 18.6, 'SV': 8.1, 'Sp': 7.0, 'V': 3.9, 'R': 6.0, 'MDG': 4.8, 'KrF': 3.3 }},
  { date: '2025-01-01', pollster: 'Opinion', parties: { 'H': 28.4, 'FrP': 16.6, 'Ap': 17.8, 'SV': 8.4, 'Sp': 6.1, 'V': 5.7, 'R': 6.2, 'KrF': 4.8, 'MDG': 2.6 }}
];

console.log(`Importing ${polls2025.length} polls for 2025...`);

db.serialize(() => {
  const stmt = db.prepare("INSERT INTO polls (year, date, pollster, party_id, pct, source) VALUES (?, ?, ?, ?, ?, ?)");
  
  let successCount = 0;
  let errorCount = 0;
  
  polls2025.forEach(poll => {
    const year = 2025;
    
    Object.entries(poll.parties).forEach(([party, pct]) => {
      stmt.run(year, poll.date, poll.pollster, party, pct, '2025 polls', (err) => {
        if (err) {
          console.error(`Error inserting poll ${poll.date} ${poll.pollster} ${party}:`, err);
          errorCount++;
        } else {
          successCount++;
        }
      });
    });
  });
  
  stmt.finalize(() => {
    // Verify the import
    setTimeout(() => {
      db.all(
        "SELECT COUNT(DISTINCT date || '_' || pollster) as poll_count, MIN(date) as earliest, MAX(date) as latest FROM polls WHERE date >= '2025-01-01'",
        (err, rows) => {
          if (!err && rows[0]) {
            console.log('\n✓ Import complete!');
            console.log(`  - ${rows[0].poll_count} unique 2025 polls added`);
            console.log(`  - Date range: ${rows[0].earliest} to ${rows[0].latest}`);
            
            // Show total polls for 2025 election
            db.get(
              "SELECT COUNT(DISTINCT date || '_' || pollster) as total FROM polls WHERE year = 2025",
              (err, row) => {
                if (!err && row) {
                  console.log(`\nTotal polls for 2025 election: ${row.total}`);
                }
                db.close();
              }
            );
          }
        }
      );
    }, 1000);
  });
});