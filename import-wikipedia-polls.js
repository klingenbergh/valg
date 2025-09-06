const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, 'election.db');
const db = new sqlite3.Database(dbPath);

console.log('Importing REAL 2024-2025 polls from Wikipedia data...\n');

// REAL polls from Wikipedia: Opinion polling for the 2025 Norwegian parliamentary election
const wikipediaPolls = [
  // 2025 polls
  { date: '2025-09-01', pollster: 'Norstat', parties: { 'R': 6.9, 'SV': 6.0, 'MDG': 7.2, 'Ap': 26.4, 'Sp': 6.2, 'V': 4.3, 'KrF': 4.2, 'H': 14.3, 'FrP': 20.4 }},
  { date: '2025-08-28', pollster: 'Verian', parties: { 'R': 5.1, 'SV': 5.8, 'MDG': 5.9, 'Ap': 28.5, 'Sp': 5.7, 'V': 4.2, 'KrF': 3.9, 'H': 14.7, 'FrP': 21.0 }},
  { date: '2025-08-27', pollster: 'Opinion', parties: { 'R': 6.6, 'SV': 8.0, 'MDG': 6.3, 'Ap': 27.5, 'Sp': 5.4, 'V': 4.2, 'KrF': 6.1, 'H': 13.3, 'FrP': 19.6 }},
  { date: '2025-08-28', pollster: 'Verian', parties: { 'R': 5.5, 'SV': 5.6, 'MDG': 6.4, 'Ap': 27.4, 'Sp': 5.8, 'V': 4.2, 'KrF': 4.2, 'H': 14.6, 'FrP': 21.6 }},
  { date: '2025-09-02', pollster: 'InFact', parties: { 'R': 7.3, 'SV': 5.4, 'MDG': 4.6, 'Ap': 26.5, 'Sp': 6.3, 'V': 5.1, 'KrF': 5.2, 'H': 13.6, 'FrP': 21.8 }},
  { date: '2025-08-27', pollster: 'Verian', parties: { 'R': 5.7, 'SV': 6.3, 'MDG': 6.2, 'Ap': 26.2, 'Sp': 6.0, 'V': 4.0, 'KrF': 4.3, 'H': 15.2, 'FrP': 21.3 }},
  { date: '2025-08-27', pollster: 'Respons', parties: { 'R': 6.6, 'SV': 6.2, 'MDG': 7.1, 'Ap': 26.6, 'Sp': 4.8, 'V': 4.6, 'KrF': 4.6, 'H': 14.8, 'FrP': 20.3 }},
  { date: '2025-08-27', pollster: 'Verian', parties: { 'R': 5.6, 'SV': 6.5, 'MDG': 5.8, 'Ap': 25.6, 'Sp': 5.3, 'V': 4.0, 'KrF': 4.5, 'H': 15.6, 'FrP': 22.3 }},
  { date: '2025-08-25', pollster: 'Opinion', parties: { 'R': 6.7, 'SV': 5.2, 'MDG': 7.0, 'Ap': 26.7, 'Sp': 6.5, 'V': 4.6, 'KrF': 3.7, 'H': 13.4, 'FrP': 22.4 }},
  { date: '2025-08-25', pollster: 'Verian', parties: { 'R': 5.5, 'SV': 6.3, 'MDG': 6.0, 'Ap': 28.1, 'Sp': 5.9, 'V': 3.9, 'KrF': 4.5, 'H': 14.5, 'FrP': 20.5 }},
  { date: '2025-08-21', pollster: 'Verian', parties: { 'R': 5.9, 'SV': 6.1, 'MDG': 5.6, 'Ap': 29.3, 'Sp': 6.4, 'V': 3.2, 'KrF': 4.6, 'H': 15.7, 'FrP': 19.2 }},
  { date: '2025-08-20', pollster: 'Respons', parties: { 'R': 5.8, 'SV': 6.6, 'MDG': 5.0, 'Ap': 28.0, 'Sp': 6.8, 'V': 4.5, 'KrF': 4.5, 'H': 16.8, 'FrP': 18.5 }},
  { date: '2025-08-18', pollster: 'Verian', parties: { 'R': 6.8, 'SV': 5.6, 'MDG': 4.7, 'Ap': 27.0, 'Sp': 6.3, 'V': 3.7, 'KrF': 5.4, 'H': 15.8, 'FrP': 21.0 }},
  { date: '2025-08-18', pollster: 'Verian', parties: { 'R': 7.3, 'SV': 5.8, 'MDG': 4.8, 'Ap': 26.7, 'Sp': 6.0, 'V': 3.2, 'KrF': 5.2, 'H': 14.9, 'FrP': 22.8 }},
  { date: '2025-08-07', pollster: 'Norstat', parties: { 'R': 6.4, 'SV': 6.8, 'MDG': 4.6, 'Ap': 27.6, 'Sp': 5.6, 'V': 4.4, 'KrF': 4.7, 'H': 14.6, 'FrP': 21.2 }},
  { date: '2025-08-13', pollster: 'Respons', parties: { 'R': 6.4, 'SV': 6.3, 'MDG': 4.4, 'Ap': 24.8, 'Sp': 7.0, 'V': 5.3, 'KrF': 4.3, 'H': 14.5, 'FrP': 21.9 }},
  { date: '2025-08-11', pollster: 'Opinion', parties: { 'R': 5.6, 'SV': 5.5, 'MDG': 3.6, 'Ap': 24.8, 'Sp': 6.8, 'V': 3.9, 'KrF': 4.5, 'H': 17.9, 'FrP': 21.5 }},
  { date: '2025-08-12', pollster: 'Norstat', parties: { 'R': 6.3, 'SV': 7.1, 'MDG': 4.7, 'Ap': 28.2, 'Sp': 5.3, 'V': 3.8, 'KrF': 4.8, 'H': 14.6, 'FrP': 20.5 }},
  { date: '2025-08-12', pollster: 'InFact', parties: { 'R': 5.7, 'SV': 5.5, 'MDG': 3.7, 'Ap': 26.9, 'Sp': 5.6, 'V': 5.1, 'KrF': 5.6, 'H': 13.2, 'FrP': 23.9 }},
  { date: '2025-08-05', pollster: 'Respons', parties: { 'R': 5.8, 'SV': 7.1, 'MDG': 2.8, 'Ap': 28.0, 'Sp': 7.0, 'V': 5.1, 'KrF': 4.6, 'H': 15.2, 'FrP': 20.7 }},
  { date: '2025-08-04', pollster: 'Verian', parties: { 'R': 6.3, 'SV': 6.2, 'MDG': 3.5, 'Ap': 28.8, 'Sp': 4.9, 'V': 4.4, 'KrF': 4.6, 'H': 16.2, 'FrP': 20.7 }},
  { date: '2025-08-05', pollster: 'Norfakta', parties: { 'R': 6.3, 'SV': 6.2, 'MDG': 4.2, 'Ap': 26.8, 'Sp': 6.7, 'V': 5.6, 'KrF': 3.8, 'H': 14.4, 'FrP': 20.9 }},
  { date: '2025-07-28', pollster: 'Opinion', parties: { 'R': 5.8, 'SV': 6.7, 'MDG': 3.2, 'Ap': 26.7, 'Sp': 6.2, 'V': 3.3, 'KrF': 3.1, 'H': 15.8, 'FrP': 23.6 }},
  { date: '2025-07-01', pollster: 'Norfakta', parties: { 'R': 6.6, 'SV': 8.9, 'MDG': 4.4, 'Ap': 26.9, 'Sp': 5.8, 'V': 5.0, 'KrF': 3.7, 'H': 15.7, 'FrP': 19.2 }},
  { date: '2025-07-01', pollster: 'InFact', parties: { 'R': 6.1, 'SV': 7.9, 'MDG': 2.8, 'Ap': 25.2, 'Sp': 7.2, 'V': 4.4, 'KrF': 3.2, 'H': 14.8, 'FrP': 23.9 }},
  { date: '2025-06-24', pollster: 'Verian', parties: { 'R': 5.1, 'SV': 7.8, 'MDG': 3.3, 'Ap': 30.9, 'Sp': 6.0, 'V': 4.8, 'KrF': 2.6, 'H': 14.0, 'FrP': 21.5 }},
  { date: '2025-06-10', pollster: 'Opinion', parties: { 'R': 7.3, 'SV': 7.0, 'MDG': 2.3, 'Ap': 26.8, 'Sp': 5.4, 'V': 5.1, 'KrF': 3.3, 'H': 14.2, 'FrP': 22.8 }},
  { date: '2025-06-10', pollster: 'Norstat', parties: { 'R': 5.6, 'SV': 8.0, 'MDG': 2.1, 'Ap': 30.0, 'Sp': 5.3, 'V': 4.2, 'KrF': 3.3, 'H': 15.8, 'FrP': 21.3 }},
  { date: '2025-06-03', pollster: 'Norfakta', parties: { 'R': 6.3, 'SV': 5.5, 'MDG': 3.7, 'Ap': 27.3, 'Sp': 5.9, 'V': 4.6, 'KrF': 3.5, 'H': 18.2, 'FrP': 21.5 }},
  { date: '2025-06-03', pollster: 'InFact', parties: { 'R': 6.1, 'SV': 8.7, 'MDG': 2.2, 'Ap': 26.7, 'Sp': 5.5, 'V': 4.6, 'KrF': 4.0, 'H': 17.0, 'FrP': 21.0 }},
  { date: '2025-05-26', pollster: 'Opinion', parties: { 'R': 5.7, 'SV': 5.5, 'MDG': 3.8, 'Ap': 30.9, 'Sp': 4.6, 'V': 5.3, 'KrF': 4.6, 'H': 13.9, 'FrP': 19.6 }},
  { date: '2025-05-26', pollster: 'Verian', parties: { 'R': 6.6, 'SV': 5.0, 'MDG': 3.8, 'Ap': 31.6, 'Sp': 6.3, 'V': 2.7, 'KrF': 3.9, 'H': 17.5, 'FrP': 19.1 }},
  { date: '2025-05-12', pollster: 'Opinion', parties: { 'R': 4.3, 'SV': 7.2, 'MDG': 2.7, 'Ap': 27.5, 'Sp': 6.2, 'V': 4.2, 'KrF': 3.4, 'H': 17.5, 'FrP': 21.0 }},
  { date: '2025-04-29', pollster: 'Norstat', parties: { 'R': 5.4, 'SV': 6.5, 'MDG': 3.1, 'Ap': 29.4, 'Sp': 5.5, 'V': 4.0, 'KrF': 3.5, 'H': 18.4, 'FrP': 20.6 }},
  { date: '2025-05-07', pollster: 'Respons', parties: { 'R': 4.9, 'SV': 6.9, 'MDG': 2.6, 'Ap': 29.3, 'Sp': 5.2, 'V': 4.8, 'KrF': 4.3, 'H': 18.6, 'FrP': 21.1 }},
  { date: '2025-05-06', pollster: 'Norfakta', parties: { 'R': 6.0, 'SV': 7.0, 'MDG': 2.5, 'Ap': 28.4, 'Sp': 6.1, 'V': 4.2, 'KrF': 4.2, 'H': 20.7, 'FrP': 17.5 }},
  { date: '2025-05-06', pollster: 'InFact', parties: { 'R': 5.5, 'SV': 7.3, 'MDG': 2.8, 'Ap': 29.0, 'Sp': 5.8, 'V': 3.0, 'KrF': 3.0, 'H': 18.6, 'FrP': 21.2 }},
  { date: '2025-04-29', pollster: 'Norstat', parties: { 'R': 5.5, 'SV': 7.1, 'MDG': 3.1, 'Ap': 28.4, 'Sp': 5.3, 'V': 4.0, 'KrF': 2.3, 'H': 19.1, 'FrP': 20.3 }},
  { date: '2025-04-28', pollster: 'Opinion', parties: { 'R': 5.0, 'SV': 6.5, 'MDG': 2.5, 'Ap': 26.0, 'Sp': 5.4, 'V': 4.6, 'KrF': 3.6, 'H': 18.5, 'FrP': 22.9 }},
  { date: '2025-04-28', pollster: 'Verian', parties: { 'R': 5.4, 'SV': 7.4, 'MDG': 2.5, 'Ap': 30.0, 'Sp': 5.8, 'V': 4.2, 'KrF': 4.6, 'H': 18.1, 'FrP': 19.0 }},
  { date: '2025-04-14', pollster: 'Opinion', parties: { 'R': 4.6, 'SV': 6.6, 'MDG': 3.7, 'Ap': 30.4, 'Sp': 7.0, 'V': 3.5, 'KrF': 3.1, 'H': 17.4, 'FrP': 20.1 }},
  { date: '2025-04-02', pollster: 'Respons', parties: { 'R': 4.7, 'SV': 6.4, 'MDG': 3.8, 'Ap': 30.1, 'Sp': 5.9, 'V': 3.9, 'KrF': 3.0, 'H': 20.4, 'FrP': 18.6 }},
  { date: '2025-03-31', pollster: 'Norstat', parties: { 'R': 3.7, 'SV': 6.3, 'MDG': 3.3, 'Ap': 27.9, 'Sp': 7.2, 'V': 3.8, 'KrF': 3.2, 'H': 18.9, 'FrP': 21.0 }},
  { date: '2025-04-01', pollster: 'Norfakta', parties: { 'R': 4.0, 'SV': 6.7, 'MDG': 3.0, 'Ap': 24.0, 'Sp': 8.4, 'V': 5.3, 'KrF': 3.5, 'H': 21.6, 'FrP': 19.2 }},
  { date: '2025-04-01', pollster: 'InFact', parties: { 'R': 5.4, 'SV': 5.8, 'MDG': 3.1, 'Ap': 29.5, 'Sp': 6.6, 'V': 3.1, 'KrF': 3.3, 'H': 18.1, 'FrP': 21.3 }},
  { date: '2025-03-25', pollster: 'Verian', parties: { 'R': 6.1, 'SV': 6.4, 'MDG': 2.5, 'Ap': 29.4, 'Sp': 6.5, 'V': 4.1, 'KrF': 3.8, 'H': 19.5, 'FrP': 19.0 }},
  { date: '2025-03-24', pollster: 'Opinion', parties: { 'R': 5.3, 'SV': 6.2, 'MDG': 2.5, 'Ap': 25.1, 'Sp': 5.3, 'V': 3.8, 'KrF': 3.1, 'H': 22.5, 'FrP': 21.1 }},
  { date: '2025-03-10', pollster: 'Opinion', parties: { 'R': 6.0, 'SV': 9.2, 'MDG': 2.8, 'Ap': 25.8, 'Sp': 4.7, 'V': 4.5, 'KrF': 3.7, 'H': 19.5, 'FrP': 19.7 }},
  { date: '2025-03-05', pollster: 'Respons', parties: { 'R': 5.0, 'SV': 7.1, 'MDG': 1.9, 'Ap': 27.4, 'Sp': 4.6, 'V': 5.4, 'KrF': 3.9, 'H': 20.2, 'FrP': 21.5 }},
  { date: '2025-03-04', pollster: 'Norstat', parties: { 'R': 4.5, 'SV': 6.4, 'MDG': 2.5, 'Ap': 30.1, 'Sp': 5.0, 'V': 4.4, 'KrF': 2.6, 'H': 18.1, 'FrP': 23.0 }},
  { date: '2025-03-04', pollster: 'Norfakta', parties: { 'R': 5.0, 'SV': 7.1, 'MDG': 2.5, 'Ap': 26.5, 'Sp': 4.8, 'V': 4.1, 'KrF': 2.6, 'H': 19.7, 'FrP': 24.3 }},
  { date: '2025-03-04', pollster: 'InFact', parties: { 'R': 4.0, 'SV': 6.6, 'MDG': 3.0, 'Ap': 29.5, 'Sp': 5.4, 'V': 4.3, 'KrF': 3.3, 'H': 16.4, 'FrP': 24.1 }},
  { date: '2025-02-24', pollster: 'Opinion', parties: { 'R': 4.2, 'SV': 6.3, 'MDG': 3.7, 'Ap': 28.2, 'Sp': 5.4, 'V': 3.2, 'KrF': 2.6, 'H': 18.5, 'FrP': 24.8 }},
  { date: '2025-02-24', pollster: 'Verian', parties: { 'R': 3.5, 'SV': 7.9, 'MDG': 2.6, 'Ap': 29.5, 'Sp': 4.6, 'V': 4.1, 'KrF': 3.2, 'H': 19.3, 'FrP': 21.7 }},
  { date: '2025-02-10', pollster: 'Opinion', parties: { 'R': 5.5, 'SV': 7.2, 'MDG': 2.1, 'Ap': 26.6, 'Sp': 6.0, 'V': 3.9, 'KrF': 3.5, 'H': 19.1, 'FrP': 22.4 }},
  { date: '2025-02-04', pollster: 'Norstat', parties: { 'R': 5.3, 'SV': 7.4, 'MDG': 2.7, 'Ap': 28.7, 'Sp': 6.0, 'V': 3.1, 'KrF': 2.1, 'H': 16.2, 'FrP': 25.3 }},
  { date: '2025-02-04', pollster: 'Respons', parties: { 'R': 4.9, 'SV': 6.8, 'MDG': 1.6, 'Ap': 26.7, 'Sp': 6.8, 'V': 4.9, 'KrF': 3.0, 'H': 19.1, 'FrP': 23.6 }},
  { date: '2025-02-05', pollster: 'InFact', parties: { 'R': 5.5, 'SV': 6.5, 'MDG': 2.3, 'Ap': 30.7, 'Sp': 6.0, 'V': 3.4, 'KrF': 3.0, 'H': 15.6, 'FrP': 24.3 }},
  { date: '2025-02-04', pollster: 'Norfakta', parties: { 'R': 5.7, 'SV': 7.6, 'MDG': 2.7, 'Ap': 24.7, 'Sp': 6.1, 'V': 4.6, 'KrF': 3.0, 'H': 18.2, 'FrP': 24.7 }},
  { date: '2025-02-04', pollster: 'Verian', parties: { 'R': 3.7, 'SV': 6.8, 'MDG': 2.4, 'Ap': 25.7, 'Sp': 6.9, 'V': 3.2, 'KrF': 3.2, 'H': 18.4, 'FrP': 26.9 }},
  { date: '2025-01-30', pollster: 'Respons', parties: { 'R': 5.9, 'SV': 8.0, 'MDG': 1.9, 'Ap': 18.3, 'Sp': 7.5, 'V': 6.5, 'KrF': 3.7, 'H': 22.0, 'FrP': 24.2 }},
  { date: '2025-01-27', pollster: 'Opinion', parties: { 'R': 6.1, 'SV': 8.1, 'MDG': 3.8, 'Ap': 22.0, 'Sp': 5.2, 'V': 4.2, 'KrF': 3.0, 'H': 18.2, 'FrP': 25.0 }},
  { date: '2025-01-27', pollster: 'Verian', parties: { 'R': 5.6, 'SV': 8.4, 'MDG': 1.8, 'Ap': 19.8, 'Sp': 8.6, 'V': 4.2, 'KrF': 2.5, 'H': 18.9, 'FrP': 25.1 }},
  { date: '2025-01-30', pollster: 'InFact', parties: { 'R': 4.5, 'SV': 9.1, 'MDG': 3.4, 'Ap': 18.4, 'Sp': 8.2, 'V': 4.7, 'KrF': 3.0, 'H': 18.3, 'FrP': 26.1 }},
  { date: '2025-01-13', pollster: 'Opinion', parties: { 'R': 5.0, 'SV': 8.3, 'MDG': 3.1, 'Ap': 18.8, 'Sp': 5.5, 'V': 2.8, 'KrF': 3.5, 'H': 21.8, 'FrP': 26.2 }},
  { date: '2025-01-08', pollster: 'Norstat', parties: { 'R': 5.9, 'SV': 8.7, 'MDG': 3.3, 'Ap': 20.2, 'Sp': 4.9, 'V': 5.8, 'KrF': 3.9, 'H': 19.8, 'FrP': 23.7 }},
  { date: '2025-01-08', pollster: 'Respons', parties: { 'R': 5.2, 'SV': 7.7, 'MDG': 3.8, 'Ap': 16.7, 'Sp': 6.1, 'V': 5.9, 'KrF': 3.1, 'H': 24.0, 'FrP': 24.5 }},
  { date: '2025-01-06', pollster: 'Verian', parties: { 'R': 5.4, 'SV': 6.9, 'MDG': 3.6, 'Ap': 21.0, 'Sp': 5.6, 'V': 3.4, 'KrF': 3.9, 'H': 23.8, 'FrP': 24.3 }},
  { date: '2025-01-07', pollster: 'Norfakta', parties: { 'R': 6.0, 'SV': 8.1, 'MDG': 3.2, 'Ap': 18.4, 'Sp': 6.6, 'V': 4.3, 'KrF': 3.2, 'H': 23.2, 'FrP': 21.1 }},
  { date: '2025-01-06', pollster: 'InFact', parties: { 'R': 5.7, 'SV': 7.5, 'MDG': 3.0, 'Ap': 20.6, 'Sp': 6.5, 'V': 4.5, 'KrF': 3.2, 'H': 21.0, 'FrP': 24.2 }},
  { date: '2025-01-02', pollster: 'Opinion', parties: { 'R': 5.7, 'SV': 8.7, 'MDG': 2.8, 'Ap': 18.1, 'Sp': 6.3, 'V': 4.7, 'KrF': 3.2, 'H': 21.6, 'FrP': 25.0 }},

  // 2024 polls (continuing with full data...)
];

// Part 2 - 2024 polls
const wikipedia2024Polls = [
  { date: '2024-12-10', pollster: 'Norstat', parties: { 'R': 6.8, 'SV': 6.9, 'MDG': 3.9, 'Ap': 16.8, 'Sp': 4.7, 'V': 4.8, 'KrF': 4.2, 'H': 20.7, 'FrP': 27.7 }},
  { date: '2024-12-04', pollster: 'Respons', parties: { 'R': 6.4, 'SV': 9.4, 'MDG': 2.3, 'Ap': 18.9, 'Sp': 5.3, 'V': 6.1, 'KrF': 3.5, 'H': 20.3, 'FrP': 23.9 }},
  { date: '2024-12-03', pollster: 'Opinion', parties: { 'R': 5.7, 'SV': 9.4, 'MDG': 3.1, 'Ap': 17.7, 'Sp': 4.9, 'V': 5.8, 'KrF': 4.0, 'H': 20.5, 'FrP': 25.3 }},
  { date: '2024-12-02', pollster: 'Norstat', parties: { 'R': 5.5, 'SV': 11.0, 'MDG': 3.5, 'Ap': 14.2, 'Sp': 3.8, 'V': 4.7, 'KrF': 4.3, 'H': 21.5, 'FrP': 27.4 }},
  { date: '2024-12-03', pollster: 'Norfakta', parties: { 'R': 5.3, 'SV': 8.7, 'MDG': 2.9, 'Ap': 18.1, 'Sp': 5.4, 'V': 4.6, 'KrF': 4.2, 'H': 22.9, 'FrP': 23.7 }},
  { date: '2024-12-03', pollster: 'InFact', parties: { 'R': 5.0, 'SV': 9.0, 'MDG': 3.6, 'Ap': 18.1, 'Sp': 6.7, 'V': 4.6, 'KrF': 3.9, 'H': 19.3, 'FrP': 26.3 }},
  { date: '2024-11-26', pollster: 'Opinion', parties: { 'R': 6.1, 'SV': 10.7, 'MDG': 2.9, 'Ap': 17.6, 'Sp': 5.3, 'V': 5.9, 'KrF': 3.3, 'H': 21.0, 'FrP': 24.4 }},
  { date: '2024-11-25', pollster: 'Verian', parties: { 'R': 5.5, 'SV': 9.9, 'MDG': 2.4, 'Ap': 16.5, 'Sp': 6.1, 'V': 3.8, 'KrF': 3.0, 'H': 23.0, 'FrP': 24.1 }},
  { date: '2024-11-12', pollster: 'Norstat', parties: { 'R': 5.3, 'SV': 9.3, 'MDG': 3.5, 'Ap': 17.5, 'Sp': 5.4, 'V': 4.4, 'KrF': 2.9, 'H': 21.0, 'FrP': 25.3 }},
  { date: '2024-11-06', pollster: 'Respons', parties: { 'R': 5.6, 'SV': 9.4, 'MDG': 3.0, 'Ap': 19.0, 'Sp': 6.8, 'V': 6.3, 'KrF': 3.7, 'H': 20.9, 'FrP': 22.4 }},
  { date: '2024-11-05', pollster: 'Opinion', parties: { 'R': 6.0, 'SV': 9.1, 'MDG': 3.1, 'Ap': 18.7, 'Sp': 6.7, 'V': 5.6, 'KrF': 3.1, 'H': 22.4, 'FrP': 21.3 }},
  { date: '2024-11-05', pollster: 'Norfakta', parties: { 'R': 4.8, 'SV': 9.3, 'MDG': 3.3, 'Ap': 20.9, 'Sp': 7.4, 'V': 4.4, 'KrF': 2.6, 'H': 22.4, 'FrP': 21.3 }},
  { date: '2024-10-30', pollster: 'Opinion', parties: { 'R': 7.1, 'SV': 8.5, 'MDG': 3.5, 'Ap': 19.4, 'Sp': 5.8, 'V': 3.8, 'KrF': 3.1, 'H': 24.1, 'FrP': 20.1 }},
  { date: '2024-11-04', pollster: 'InFact', parties: { 'R': 7.0, 'SV': 8.4, 'MDG': 4.3, 'Ap': 17.7, 'Sp': 6.2, 'V': 5.1, 'KrF': 3.5, 'H': 20.3, 'FrP': 24.2 }},
  { date: '2024-10-28', pollster: 'Verian', parties: { 'R': 5.7, 'SV': 9.1, 'MDG': 3.4, 'Ap': 17.7, 'Sp': 7.7, 'V': 6.1, 'KrF': 2.8, 'H': 25.7, 'FrP': 19.7 }},
  { date: '2024-10-15', pollster: 'Norstat', parties: { 'R': 6.2, 'SV': 9.0, 'MDG': 3.5, 'Ap': 19.3, 'Sp': 4.9, 'V': 6.0, 'KrF': 2.4, 'H': 22.7, 'FrP': 22.0 }},
  { date: '2024-10-10', pollster: 'Respons', parties: { 'R': 4.7, 'SV': 8.3, 'MDG': 3.5, 'Ap': 20.7, 'Sp': 5.3, 'V': 6.3, 'KrF': 3.5, 'H': 25.7, 'FrP': 19.2 }},
  { date: '2024-10-01', pollster: 'Opinion', parties: { 'R': 5.6, 'SV': 10.6, 'MDG': 2.8, 'Ap': 18.0, 'Sp': 4.9, 'V': 5.5, 'KrF': 4.3, 'H': 23.1, 'FrP': 22.5 }},
  { date: '2024-09-30', pollster: 'Verian', parties: { 'R': 5.8, 'SV': 8.7, 'MDG': 3.7, 'Ap': 22.2, 'Sp': 5.7, 'V': 4.6, 'KrF': 3.1, 'H': 24.5, 'FrP': 17.9 }},
  { date: '2024-10-03', pollster: 'InFact', parties: { 'R': 6.4, 'SV': 6.7, 'MDG': 3.7, 'Ap': 20.2, 'Sp': 6.9, 'V': 5.0, 'KrF': 3.6, 'H': 20.1, 'FrP': 23.3 }},
  { date: '2024-10-01', pollster: 'Norfakta', parties: { 'R': 5.3, 'SV': 10.2, 'MDG': 3.7, 'Ap': 20.3, 'Sp': 6.9, 'V': 5.4, 'KrF': 2.5, 'H': 24.0, 'FrP': 16.6 }},
  { date: '2024-09-23', pollster: 'Opinion', parties: { 'R': 7.0, 'SV': 8.1, 'MDG': 3.5, 'Ap': 18.5, 'Sp': 5.9, 'V': 6.0, 'KrF': 3.6, 'H': 23.6, 'FrP': 20.3 }},
  { date: '2024-09-17', pollster: 'Norstat', parties: { 'R': 5.0, 'SV': 8.4, 'MDG': 4.0, 'Ap': 20.2, 'Sp': 5.1, 'V': 4.8, 'KrF': 2.5, 'H': 25.5, 'FrP': 19.5 }},
  { date: '2024-09-04', pollster: 'Respons', parties: { 'R': 5.1, 'SV': 10.6, 'MDG': 2.6, 'Ap': 21.9, 'Sp': 5.0, 'V': 5.0, 'KrF': 2.9, 'H': 23.6, 'FrP': 19.8 }},
  { date: '2024-09-03', pollster: 'Opinion', parties: { 'R': 5.8, 'SV': 8.6, 'MDG': 2.6, 'Ap': 20.2, 'Sp': 6.0, 'V': 5.6, 'KrF': 2.0, 'H': 23.7, 'FrP': 20.2 }},
  { date: '2024-09-03', pollster: 'Norfakta', parties: { 'R': 5.4, 'SV': 9.5, 'MDG': 3.2, 'Ap': 20.8, 'Sp': 7.5, 'V': 4.8, 'KrF': 3.4, 'H': 25.1, 'FrP': 17.2 }},
  { date: '2024-09-03', pollster: 'InFact', parties: { 'R': 5.5, 'SV': 8.2, 'MDG': 3.9, 'Ap': 21.4, 'Sp': 6.1, 'V': 4.2, 'KrF': 3.7, 'H': 21.0, 'FrP': 21.9 }},
  { date: '2024-08-27', pollster: 'Opinion', parties: { 'R': 6.7, 'SV': 8.8, 'MDG': 3.2, 'Ap': 21.1, 'Sp': 5.9, 'V': 5.6, 'KrF': 2.5, 'H': 25.4, 'FrP': 16.8 }},
  { date: '2024-08-26', pollster: 'Verian', parties: { 'R': 6.0, 'SV': 8.6, 'MDG': 3.3, 'Ap': 18.6, 'Sp': 6.2, 'V': 5.4, 'KrF': 3.6, 'H': 27.6, 'FrP': 16.9 }},
  { date: '2024-08-07', pollster: 'Respons', parties: { 'R': 5.7, 'SV': 10.0, 'MDG': 2.3, 'Ap': 22.0, 'Sp': 5.4, 'V': 5.3, 'KrF': 3.3, 'H': 24.5, 'FrP': 17.5 }},
  { date: '2024-08-06', pollster: 'Opinion', parties: { 'R': 6.4, 'SV': 10.2, 'MDG': 3.3, 'Ap': 19.8, 'Sp': 6.0, 'V': 4.1, 'KrF': 4.0, 'H': 27.1, 'FrP': 14.7 }},
  { date: '2024-08-05', pollster: 'Norstat', parties: { 'R': 6.1, 'SV': 7.9, 'MDG': 3.9, 'Ap': 20.0, 'Sp': 6.4, 'V': 5.8, 'KrF': 3.6, 'H': 24.5, 'FrP': 18.0 }},
  { date: '2024-08-05', pollster: 'Norstat', parties: { 'R': 5.8, 'SV': 8.6, 'MDG': 3.2, 'Ap': 20.6, 'Sp': 7.6, 'V': 4.9, 'KrF': 4.3, 'H': 25.2, 'FrP': 16.0 }},
  { date: '2024-08-05', pollster: 'Verian', parties: { 'R': 3.8, 'SV': 10.3, 'MDG': 4.5, 'Ap': 21.1, 'Sp': 5.9, 'V': 5.0, 'KrF': 4.7, 'H': 24.4, 'FrP': 16.3 }},
  { date: '2024-08-08', pollster: 'InFact', parties: { 'R': 6.1, 'SV': 7.6, 'MDG': 4.1, 'Ap': 22.0, 'Sp': 6.0, 'V': 4.6, 'KrF': 3.3, 'H': 22.2, 'FrP': 18.5 }},
  { date: '2024-08-06', pollster: 'Norfakta', parties: { 'R': 5.6, 'SV': 11.3, 'MDG': 4.2, 'Ap': 18.5, 'Sp': 6.3, 'V': 4.8, 'KrF': 3.3, 'H': 26.4, 'FrP': 15.4 }},
  { date: '2024-07-30', pollster: 'Opinion', parties: { 'R': 5.9, 'SV': 7.0, 'MDG': 3.1, 'Ap': 21.2, 'Sp': 5.8, 'V': 6.9, 'KrF': 4.6, 'H': 26.9, 'FrP': 15.0 }},
  { date: '2024-07-04', pollster: 'InFact', parties: { 'R': 5.4, 'SV': 8.4, 'MDG': 3.7, 'Ap': 20.4, 'Sp': 5.1, 'V': 5.9, 'KrF': 4.2, 'H': 22.4, 'FrP': 20.7 }},
  { date: '2024-07-02', pollster: 'Norfakta', parties: { 'R': 6.0, 'SV': 9.0, 'MDG': 3.7, 'Ap': 20.6, 'Sp': 4.6, 'V': 4.9, 'KrF': 4.1, 'H': 27.4, 'FrP': 13.0 }},
  { date: '2024-06-24', pollster: 'Verian', parties: { 'R': 4.9, 'SV': 11.0, 'MDG': 3.8, 'Ap': 22.4, 'Sp': 4.5, 'V': 5.9, 'KrF': 3.5, 'H': 24.8, 'FrP': 15.7 }},
  { date: '2024-06-11', pollster: 'Norstat', parties: { 'R': 6.1, 'SV': 8.6, 'MDG': 4.7, 'Ap': 22.0, 'Sp': 4.5, 'V': 6.5, 'KrF': 2.8, 'H': 25.0, 'FrP': 16.8 }},
  { date: '2024-06-05', pollster: 'Respons', parties: { 'R': 5.5, 'SV': 8.5, 'MDG': 3.0, 'Ap': 19.9, 'Sp': 7.6, 'V': 5.9, 'KrF': 3.7, 'H': 26.2, 'FrP': 17.5 }},
  { date: '2024-06-04', pollster: 'Opinion', parties: { 'R': 5.1, 'SV': 10.8, 'MDG': 3.6, 'Ap': 19.9, 'Sp': 7.2, 'V': 6.5, 'KrF': 3.3, 'H': 19.8, 'FrP': 19.3 }},
  { date: '2024-06-04', pollster: 'Norfakta', parties: { 'R': 8.0, 'SV': 9.9, 'MDG': 3.4, 'Ap': 18.9, 'Sp': 7.5, 'V': 5.8, 'KrF': 3.5, 'H': 23.4, 'FrP': 15.7 }},
  { date: '2024-06-04', pollster: 'InFact', parties: { 'R': 6.0, 'SV': 8.8, 'MDG': 3.0, 'Ap': 18.9, 'Sp': 5.7, 'V': 5.8, 'KrF': 3.9, 'H': 25.4, 'FrP': 17.8 }},
  { date: '2024-05-27', pollster: 'Verian', parties: { 'R': 8.9, 'SV': 11.5, 'MDG': 2.7, 'Ap': 18.6, 'Sp': 5.4, 'V': 4.8, 'KrF': 3.7, 'H': 25.5, 'FrP': 15.9 }},
  { date: '2024-05-21', pollster: 'Norstat', parties: { 'R': 3.8, 'SV': 9.6, 'MDG': 3.3, 'Ap': 20.3, 'Sp': 6.6, 'V': 6.4, 'KrF': 4.2, 'H': 23.4, 'FrP': 17.3 }},
  { date: '2024-05-14', pollster: 'Norstat', parties: { 'R': 5.7, 'SV': 9.3, 'MDG': 3.8, 'Ap': 19.6, 'Sp': 5.2, 'V': 6.5, 'KrF': 4.8, 'H': 23.6, 'FrP': 18.5 }},
  { date: '2024-05-07', pollster: 'Norfakta', parties: { 'R': 4.9, 'SV': 10.5, 'MDG': 3.3, 'Ap': 17.8, 'Sp': 6.6, 'V': 6.6, 'KrF': 3.4, 'H': 26.5, 'FrP': 15.4 }},
  { date: '2024-05-02', pollster: 'Respons', parties: { 'R': 5.8, 'SV': 8.7, 'MDG': 3.6, 'Ap': 20.3, 'Sp': 7.5, 'V': 5.3, 'KrF': 4.0, 'H': 25.9, 'FrP': 15.1 }},
  { date: '2024-04-30', pollster: 'Opinion', parties: { 'R': 4.6, 'SV': 9.7, 'MDG': 3.5, 'Ap': 17.3, 'Sp': 5.9, 'V': 5.8, 'KrF': 4.4, 'H': 28.0, 'FrP': 17.8 }},
  { date: '2024-04-29', pollster: 'Verian', parties: { 'R': 5.0, 'SV': 10.2, 'MDG': 3.1, 'Ap': 21.3, 'Sp': 5.2, 'V': 6.8, 'KrF': 3.8, 'H': 24.9, 'FrP': 16.5 }},
  { date: '2024-05-02', pollster: 'InFact', parties: { 'R': 5.1, 'SV': 8.9, 'MDG': 4.4, 'Ap': 20.0, 'Sp': 6.1, 'V': 4.4, 'KrF': 4.4, 'H': 23.5, 'FrP': 18.8 }},
  { date: '2024-04-23', pollster: 'Opinion', parties: { 'R': 5.0, 'SV': 7.7, 'MDG': 4.2, 'Ap': 22.6, 'Sp': 5.6, 'V': 5.5, 'KrF': 3.5, 'H': 25.4, 'FrP': 17.0 }},
  { date: '2024-04-09', pollster: 'Opinion', parties: { 'R': 5.9, 'SV': 10.9, 'MDG': 2.8, 'Ap': 19.3, 'Sp': 6.0, 'V': 7.3, 'KrF': 3.0, 'H': 22.2, 'FrP': 16.8 }},
  { date: '2024-04-03', pollster: 'Respons', parties: { 'R': 6.9, 'SV': 8.9, 'MDG': 4.1, 'Ap': 21.2, 'Sp': 5.7, 'V': 5.5, 'KrF': 3.3, 'H': 28.4, 'FrP': 13.4 }},
  { date: '2024-04-02', pollster: 'Norfakta', parties: { 'R': 4.9, 'SV': 10.6, 'MDG': 3.6, 'Ap': 21.0, 'Sp': 5.5, 'V': 5.2, 'KrF': 4.4, 'H': 28.3, 'FrP': 13.0 }},
  { date: '2024-04-02', pollster: 'Norstat', parties: { 'R': 5.9, 'SV': 10.4, 'MDG': 4.0, 'Ap': 17.1, 'Sp': 6.9, 'V': 4.6, 'KrF': 4.1, 'H': 25.5, 'FrP': 17.6 }},
  { date: '2024-04-02', pollster: 'Opinion', parties: { 'R': 4.2, 'SV': 9.4, 'MDG': 3.4, 'Ap': 19.0, 'Sp': 5.3, 'V': 5.2, 'KrF': 3.3, 'H': 30.5, 'FrP': 15.3 }},
  { date: '2024-04-04', pollster: 'InFact', parties: { 'R': 5.7, 'SV': 10.2, 'MDG': 3.4, 'Ap': 18.4, 'Sp': 5.4, 'V': 5.7, 'KrF': 4.5, 'H': 25.4, 'FrP': 15.3 }},
  { date: '2024-04-02', pollster: 'Verian', parties: { 'R': 5.0, 'SV': 9.4, 'MDG': 3.6, 'Ap': 20.5, 'Sp': 8.6, 'V': 5.3, 'KrF': 2.9, 'H': 24.6, 'FrP': 14.9 }},
  { date: '2024-03-06', pollster: 'Respons', parties: { 'R': 5.6, 'SV': 10.2, 'MDG': 3.6, 'Ap': 17.9, 'Sp': 6.1, 'V': 5.8, 'KrF': 4.4, 'H': 28.5, 'FrP': 14.4 }},
  { date: '2024-03-05', pollster: 'Norstat', parties: { 'R': 6.2, 'SV': 10.1, 'MDG': 3.5, 'Ap': 18.2, 'Sp': 6.7, 'V': 6.1, 'KrF': 4.0, 'H': 27.0, 'FrP': 15.2 }},
  { date: '2024-03-05', pollster: 'Norfakta', parties: { 'R': 5.0, 'SV': 9.4, 'MDG': 4.4, 'Ap': 18.6, 'Sp': 5.9, 'V': 6.4, 'KrF': 4.8, 'H': 25.7, 'FrP': 14.8 }},
  { date: '2024-03-04', pollster: 'InFact', parties: { 'R': 6.7, 'SV': 9.2, 'MDG': 4.1, 'Ap': 17.8, 'Sp': 7.2, 'V': 5.7, 'KrF': 3.5, 'H': 26.0, 'FrP': 15.7 }},
  { date: '2024-02-27', pollster: 'Opinion', parties: { 'R': 5.8, 'SV': 10.9, 'MDG': 4.9, 'Ap': 18.8, 'Sp': 5.4, 'V': 5.8, 'KrF': 2.6, 'H': 24.9, 'FrP': 16.3 }},
  { date: '2024-02-26', pollster: 'Verian', parties: { 'R': 5.6, 'SV': 9.1, 'MDG': 3.3, 'Ap': 19.5, 'Sp': 6.2, 'V': 5.8, 'KrF': 3.0, 'H': 26.9, 'FrP': 13.8 }},
  { date: '2024-02-19', pollster: 'Opinion', parties: { 'R': 5.8, 'SV': 10.1, 'MDG': 4.5, 'Ap': 16.8, 'Sp': 7.9, 'V': 5.5, 'KrF': 4.2, 'H': 26.7, 'FrP': 13.3 }},
  { date: '2024-02-19', pollster: 'Norstat', parties: { 'R': 6.2, 'SV': 10.6, 'MDG': 4.0, 'Ap': 18.6, 'Sp': 6.4, 'V': 4.9, 'KrF': 3.6, 'H': 25.1, 'FrP': 16.4 }},
  { date: '2024-02-07', pollster: 'Respons', parties: { 'R': 4.8, 'SV': 11.0, 'MDG': 3.7, 'Ap': 19.1, 'Sp': 5.1, 'V': 5.8, 'KrF': 4.1, 'H': 27.4, 'FrP': 14.7 }},
  { date: '2024-02-06', pollster: 'Opinion', parties: { 'R': 5.2, 'SV': 10.0, 'MDG': 3.7, 'Ap': 17.8, 'Sp': 7.7, 'V': 5.8, 'KrF': 4.2, 'H': 29.5, 'FrP': 13.6 }},
  { date: '2024-02-06', pollster: 'Norstat', parties: { 'R': 5.3, 'SV': 9.5, 'MDG': 3.6, 'Ap': 17.8, 'Sp': 6.8, 'V': 6.6, 'KrF': 3.7, 'H': 26.5, 'FrP': 14.3 }},
  { date: '2024-02-06', pollster: 'Norfakta', parties: { 'R': 4.3, 'SV': 9.1, 'MDG': 2.7, 'Ap': 20.5, 'Sp': 6.5, 'V': 5.7, 'KrF': 3.5, 'H': 27.6, 'FrP': 13.7 }},
  { date: '2024-01-29', pollster: 'Opinion', parties: { 'R': 4.6, 'SV': 10.0, 'MDG': 4.3, 'Ap': 17.6, 'Sp': 4.6, 'V': 5.9, 'KrF': 4.7, 'H': 31.2, 'FrP': 11.8 }},
  { date: '2024-01-29', pollster: 'Verian', parties: { 'R': 5.8, 'SV': 8.7, 'MDG': 3.1, 'Ap': 22.0, 'Sp': 6.6, 'V': 6.1, 'KrF': 4.0, 'H': 27.6, 'FrP': 11.6 }},
  { date: '2024-02-01', pollster: 'InFact', parties: { 'R': 5.7, 'SV': 10.3, 'MDG': 4.0, 'Ap': 18.8, 'Sp': 5.8, 'V': 5.9, 'KrF': 4.2, 'H': 26.8, 'FrP': 14.6 }},
  { date: '2024-01-10', pollster: 'Norstat', parties: { 'R': 4.9, 'SV': 11.4, 'MDG': 3.3, 'Ap': 19.4, 'Sp': 5.7, 'V': 6.0, 'KrF': 3.7, 'H': 26.8, 'FrP': 12.1 }},
  { date: '2024-01-02', pollster: 'Opinion', parties: { 'R': 6.2, 'SV': 11.1, 'MDG': 3.6, 'Ap': 19.4, 'Sp': 6.2, 'V': 4.8, 'KrF': 3.8, 'H': 26.0, 'FrP': 12.8 }},
  { date: '2024-01-02', pollster: 'Verian', parties: { 'R': 4.8, 'SV': 10.7, 'MDG': 2.9, 'Ap': 19.2, 'Sp': 6.9, 'V': 7.2, 'KrF': 3.5, 'H': 27.3, 'FrP': 11.4 }},
  { date: '2024-01-03', pollster: 'Respons', parties: { 'R': 5.4, 'SV': 10.7, 'MDG': 3.5, 'Ap': 20.5, 'Sp': 7.6, 'V': 5.9, 'KrF': 4.1, 'H': 26.2, 'FrP': 13.5 }},
  { date: '2024-01-03', pollster: 'Norfakta', parties: { 'R': 5.3, 'SV': 10.6, 'MDG': 3.5, 'Ap': 19.0, 'Sp': 6.6, 'V': 5.9, 'KrF': 4.1, 'H': 25.2, 'FrP': 14.2 }},
  { date: '2024-01-03', pollster: 'InFact', parties: { 'R': 5.6, 'SV': 9.1, 'MDG': 3.6, 'Ap': 18.5, 'Sp': 7.8, 'V': 5.3, 'KrF': 4.6, 'H': 23.5, 'FrP': 14.5 }}
];

// Combine all polls
const allPolls = [...wikipediaPolls, ...wikipedia2024Polls];

console.log(`Importing ${allPolls.length} REAL polls from Wikipedia...`);

// First, clear ALL existing polls from 2024 onwards
db.run("DELETE FROM polls WHERE date >= '2024-01-01'", (err) => {
  if (err) {
    console.error('Error clearing old polls:', err);
    return;
  }
  
  console.log('✓ Cleared all existing 2024-2025 polls\n');
  
  // Now insert the new polls
  db.serialize(() => {
    const stmt = db.prepare("INSERT INTO polls (year, date, pollster, party_id, pct, source) VALUES (?, ?, ?, ?, ?, ?)");
    
    let successCount = 0;
    let errorCount = 0;
    
    allPolls.forEach(poll => {
      // All polls from 2024 onwards are associated with 2025 election
      const year = 2025;
      
      Object.entries(poll.parties).forEach(([party, pct]) => {
        stmt.run(year, poll.date, poll.pollster, party, pct, 'Wikipedia 2025 election polling', (err) => {
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
          "SELECT COUNT(DISTINCT date || '_' || pollster) as poll_count, MIN(date) as earliest, MAX(date) as latest FROM polls WHERE date >= '2024-01-01'",
          (err, rows) => {
            if (!err && rows[0]) {
              console.log('\n✓ Import complete!');
              console.log(`  - ${rows[0].poll_count} unique polls added`);
              console.log(`  - Date range: ${rows[0].earliest} to ${rows[0].latest}`);
              console.log('\nThese are REAL polls from:');
              console.log('  - Wikipedia: Opinion polling for the 2025 Norwegian parliamentary election');
              console.log('  - Actual polling organizations: Norstat, Verian, Opinion, InFact, Respons, Norfakta');
              
              // Show breakdown by year
              db.all(
                "SELECT SUBSTR(date, 1, 4) as year, COUNT(DISTINCT date || '_' || pollster) as count FROM polls WHERE date >= '2024-01-01' GROUP BY SUBSTR(date, 1, 4)",
                (err, yearBreakdown) => {
                  if (!err && yearBreakdown) {
                    console.log('\nPolls by year:');
                    yearBreakdown.forEach(y => {
                      console.log(`  - ${y.year}: ${y.count} polls`);
                    });
                  }
                  
                  // Show total for 2025 election
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
              );
            }
          }
        );
      }, 1000);
    });
  });
});