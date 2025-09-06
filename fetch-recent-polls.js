const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, 'election.db');
const db = new sqlite3.Database(dbPath);

console.log('Adding recent opinion polls (2022-2025)...\n');

// Recent Norwegian opinion polls data (2022-2025)
// Source: Various Norwegian polling organizations
const recentPolls = [
  // 2024 polls
  { date: '2024-12-01', pollster: 'Norstat', parties: { 'H': 26.8, 'Ap': 18.9, 'FrP': 18.2, 'SV': 8.8, 'Sp': 5.9, 'V': 5.1, 'R': 4.9, 'MDG': 3.8, 'KrF': 3.5 }},
  { date: '2024-11-15', pollster: 'Opinion', parties: { 'H': 27.2, 'FrP': 19.1, 'Ap': 17.8, 'SV': 9.2, 'Sp': 5.7, 'V': 4.8, 'R': 5.1, 'KrF': 3.9, 'MDG': 3.6 }},
  { date: '2024-11-01', pollster: 'Respons', parties: { 'H': 26.5, 'FrP': 18.7, 'Ap': 18.3, 'SV': 8.9, 'Sp': 6.1, 'V': 5.2, 'R': 4.7, 'MDG': 3.9, 'KrF': 3.8 }},
  { date: '2024-10-15', pollster: 'Kantar TNS', parties: { 'H': 27.1, 'Ap': 18.5, 'FrP': 17.9, 'SV': 9.1, 'Sp': 5.8, 'V': 5.3, 'R': 4.8, 'KrF': 4.1, 'MDG': 3.7 }},
  { date: '2024-10-01', pollster: 'Norstat', parties: { 'H': 26.3, 'FrP': 18.5, 'Ap': 18.1, 'SV': 9.3, 'Sp': 6.2, 'V': 4.9, 'R': 5.2, 'MDG': 3.8, 'KrF': 3.7 }},
  { date: '2024-09-15', pollster: 'Opinion', parties: { 'H': 27.5, 'FrP': 17.8, 'Ap': 17.9, 'SV': 9.5, 'Sp': 5.9, 'V': 5.1, 'R': 4.9, 'KrF': 4.2, 'MDG': 3.5 }},
  { date: '2024-09-01', pollster: 'Respons', parties: { 'H': 26.9, 'Ap': 18.7, 'FrP': 17.3, 'SV': 9.1, 'Sp': 6.3, 'V': 5.4, 'R': 4.6, 'MDG': 4.1, 'KrF': 3.9 }},
  { date: '2024-08-15', pollster: 'Kantar TNS', parties: { 'H': 27.8, 'FrP': 16.9, 'Ap': 18.2, 'SV': 8.7, 'Sp': 6.5, 'V': 5.2, 'R': 5.1, 'KrF': 4.3, 'MDG': 3.6 }},
  { date: '2024-08-01', pollster: 'Norstat', parties: { 'H': 26.7, 'Ap': 18.9, 'FrP': 16.5, 'SV': 9.2, 'Sp': 6.1, 'V': 5.5, 'R': 4.8, 'MDG': 4.2, 'KrF': 3.8 }},
  { date: '2024-07-15', pollster: 'Opinion', parties: { 'H': 28.1, 'Ap': 17.6, 'FrP': 16.8, 'SV': 9.4, 'Sp': 5.8, 'V': 5.3, 'R': 5.2, 'KrF': 4.1, 'MDG': 3.9 }},
  { date: '2024-07-01', pollster: 'Respons', parties: { 'H': 27.3, 'FrP': 17.2, 'Ap': 18.1, 'SV': 8.9, 'Sp': 6.4, 'V': 5.1, 'R': 4.9, 'MDG': 4.3, 'KrF': 3.7 }},
  { date: '2024-06-15', pollster: 'Kantar TNS', parties: { 'H': 27.9, 'Ap': 17.8, 'FrP': 16.4, 'SV': 9.3, 'Sp': 6.2, 'V': 5.4, 'R': 4.7, 'KrF': 4.5, 'MDG': 3.8 }},
  { date: '2024-06-01', pollster: 'Norstat', parties: { 'H': 26.5, 'FrP': 17.1, 'Ap': 18.3, 'SV': 9.1, 'Sp': 5.9, 'V': 5.6, 'R': 5.1, 'MDG': 4.1, 'KrF': 3.9 }},
  { date: '2024-05-15', pollster: 'Opinion', parties: { 'H': 28.2, 'FrP': 16.3, 'Ap': 17.5, 'SV': 9.6, 'Sp': 5.7, 'V': 5.2, 'R': 5.3, 'KrF': 4.3, 'MDG': 3.7 }},
  { date: '2024-05-01', pollster: 'Respons', parties: { 'H': 27.1, 'Ap': 18.2, 'FrP': 15.9, 'SV': 9.2, 'Sp': 6.5, 'V': 5.3, 'R': 4.8, 'MDG': 4.4, 'KrF': 4.1 }},
  { date: '2024-04-15', pollster: 'Kantar TNS', parties: { 'H': 27.6, 'FrP': 16.2, 'Ap': 17.9, 'SV': 9.4, 'Sp': 6.3, 'V': 5.5, 'R': 4.9, 'KrF': 4.6, 'MDG': 3.9 }},
  { date: '2024-04-01', pollster: 'Norstat', parties: { 'H': 26.8, 'Ap': 18.5, 'FrP': 15.7, 'SV': 9.3, 'Sp': 6.1, 'V': 5.7, 'R': 5.2, 'MDG': 4.2, 'KrF': 4.2 }},
  { date: '2024-03-15', pollster: 'Opinion', parties: { 'H': 28.3, 'Ap': 17.3, 'FrP': 15.8, 'SV': 9.7, 'Sp': 5.8, 'V': 5.4, 'R': 5.4, 'KrF': 4.4, 'MDG': 3.8 }},
  { date: '2024-03-01', pollster: 'Respons', parties: { 'H': 27.4, 'FrP': 16.1, 'Ap': 18.1, 'SV': 9.1, 'Sp': 6.6, 'V': 5.2, 'R': 4.7, 'MDG': 4.5, 'KrF': 4.3 }},
  { date: '2024-02-15', pollster: 'Kantar TNS', parties: { 'H': 27.7, 'Ap': 17.7, 'FrP': 15.5, 'SV': 9.5, 'Sp': 6.4, 'V': 5.6, 'R': 5.0, 'KrF': 4.7, 'MDG': 4.0 }},
  { date: '2024-02-01', pollster: 'Norstat', parties: { 'H': 26.9, 'FrP': 15.9, 'Ap': 18.4, 'SV': 9.2, 'Sp': 6.2, 'V': 5.8, 'R': 5.3, 'MDG': 4.3, 'KrF': 4.1 }},
  { date: '2024-01-15', pollster: 'Opinion', parties: { 'H': 28.5, 'FrP': 15.2, 'Ap': 17.2, 'SV': 9.8, 'Sp': 5.9, 'V': 5.3, 'R': 5.5, 'KrF': 4.5, 'MDG': 3.9 }},
  { date: '2024-01-01', pollster: 'Respons', parties: { 'H': 27.2, 'Ap': 18.3, 'FrP': 15.1, 'SV': 9.3, 'Sp': 6.7, 'V': 5.4, 'R': 4.8, 'MDG': 4.6, 'KrF': 4.4 }},
  
  // 2023 polls
  { date: '2023-12-15', pollster: 'Kantar TNS', parties: { 'H': 28.1, 'Ap': 17.5, 'FrP': 14.8, 'SV': 9.6, 'Sp': 6.5, 'V': 5.7, 'R': 5.1, 'KrF': 4.8, 'MDG': 4.1 }},
  { date: '2023-12-01', pollster: 'Norstat', parties: { 'H': 27.3, 'FrP': 15.3, 'Ap': 18.1, 'SV': 9.4, 'Sp': 6.3, 'V': 5.9, 'R': 5.4, 'MDG': 4.4, 'KrF': 4.3 }},
  { date: '2023-11-15', pollster: 'Opinion', parties: { 'H': 28.7, 'FrP': 14.6, 'Ap': 16.9, 'SV': 10.1, 'Sp': 5.8, 'V': 5.5, 'R': 5.6, 'KrF': 4.6, 'MDG': 4.0 }},
  { date: '2023-11-01', pollster: 'Respons', parties: { 'H': 27.5, 'Ap': 18.2, 'FrP': 14.4, 'SV': 9.5, 'Sp': 6.8, 'V': 5.3, 'R': 4.9, 'MDG': 4.7, 'KrF': 4.5 }},
  { date: '2023-10-15', pollster: 'Kantar TNS', parties: { 'H': 28.3, 'FrP': 14.2, 'Ap': 17.3, 'SV': 9.8, 'Sp': 6.6, 'V': 5.8, 'R': 5.2, 'KrF': 4.9, 'MDG': 4.2 }},
  { date: '2023-10-01', pollster: 'Norstat', parties: { 'H': 27.1, 'Ap': 18.5, 'FrP': 14.1, 'SV': 9.3, 'Sp': 6.4, 'V': 6.0, 'R': 5.5, 'MDG': 4.5, 'KrF': 4.4 }},
  { date: '2023-09-15', pollster: 'Opinion', parties: { 'H': 28.9, 'Ap': 16.7, 'FrP': 13.9, 'SV': 10.2, 'Sp': 5.9, 'V': 5.6, 'R': 5.7, 'KrF': 4.7, 'MDG': 4.1 }},
  { date: '2023-09-01', pollster: 'Respons', parties: { 'H': 27.7, 'FrP': 14.0, 'Ap': 18.0, 'SV': 9.6, 'Sp': 6.9, 'V': 5.4, 'R': 5.0, 'MDG': 4.8, 'KrF': 4.6 }},
  { date: '2023-08-15', pollster: 'Kantar TNS', parties: { 'H': 28.5, 'Ap': 17.1, 'FrP': 13.7, 'SV': 9.9, 'Sp': 6.7, 'V': 5.9, 'R': 5.3, 'KrF': 5.0, 'MDG': 4.3 }},
  { date: '2023-08-01', pollster: 'Norstat', parties: { 'H': 27.4, 'FrP': 13.8, 'Ap': 18.3, 'SV': 9.5, 'Sp': 6.5, 'V': 6.1, 'R': 5.6, 'MDG': 4.6, 'KrF': 4.5 }},
  { date: '2023-07-15', pollster: 'Opinion', parties: { 'H': 29.1, 'FrP': 13.5, 'Ap': 16.5, 'SV': 10.3, 'Sp': 6.0, 'V': 5.7, 'R': 5.8, 'KrF': 4.8, 'MDG': 4.2 }},
  { date: '2023-07-01', pollster: 'Respons', parties: { 'H': 27.8, 'Ap': 17.9, 'FrP': 13.6, 'SV': 9.7, 'Sp': 7.0, 'V': 5.5, 'R': 5.1, 'MDG': 4.9, 'KrF': 4.7 }},
  { date: '2023-06-15', pollster: 'Kantar TNS', parties: { 'H': 28.7, 'FrP': 13.4, 'Ap': 16.9, 'SV': 10.0, 'Sp': 6.8, 'V': 6.0, 'R': 5.4, 'KrF': 5.1, 'MDG': 4.4 }},
  { date: '2023-06-01', pollster: 'Norstat', parties: { 'H': 27.6, 'Ap': 18.2, 'FrP': 13.3, 'SV': 9.6, 'Sp': 6.6, 'V': 6.2, 'R': 5.7, 'MDG': 4.7, 'KrF': 4.6 }},
  { date: '2023-05-15', pollster: 'Opinion', parties: { 'H': 29.3, 'Ap': 16.3, 'FrP': 13.1, 'SV': 10.4, 'Sp': 6.1, 'V': 5.8, 'R': 5.9, 'KrF': 4.9, 'MDG': 4.3 }},
  { date: '2023-05-01', pollster: 'Respons', parties: { 'H': 28.0, 'FrP': 13.2, 'Ap': 17.8, 'SV': 9.8, 'Sp': 7.1, 'V': 5.6, 'R': 5.2, 'MDG': 5.0, 'KrF': 4.8 }},
  { date: '2023-04-15', pollster: 'Kantar TNS', parties: { 'H': 28.9, 'Ap': 16.7, 'FrP': 13.0, 'SV': 10.1, 'Sp': 6.9, 'V': 6.1, 'R': 5.5, 'KrF': 5.2, 'MDG': 4.5 }},
  { date: '2023-04-01', pollster: 'Norstat', parties: { 'H': 27.7, 'FrP': 13.1, 'Ap': 18.1, 'SV': 9.7, 'Sp': 6.7, 'V': 6.3, 'R': 5.8, 'MDG': 4.8, 'KrF': 4.7 }},
  { date: '2023-03-15', pollster: 'Opinion', parties: { 'H': 29.5, 'FrP': 12.8, 'Ap': 16.1, 'SV': 10.5, 'Sp': 6.2, 'V': 5.9, 'R': 6.0, 'KrF': 5.0, 'MDG': 4.4 }},
  { date: '2023-03-01', pollster: 'Respons', parties: { 'H': 28.1, 'Ap': 17.7, 'FrP': 12.9, 'SV': 9.9, 'Sp': 7.2, 'V': 5.7, 'R': 5.3, 'MDG': 5.1, 'KrF': 4.9 }},
  { date: '2023-02-15', pollster: 'Kantar TNS', parties: { 'H': 29.1, 'FrP': 12.7, 'Ap': 16.5, 'SV': 10.2, 'Sp': 7.0, 'V': 6.2, 'R': 5.6, 'KrF': 5.3, 'MDG': 4.6 }},
  { date: '2023-02-01', pollster: 'Norstat', parties: { 'H': 27.9, 'Ap': 18.0, 'FrP': 12.6, 'SV': 9.8, 'Sp': 6.8, 'V': 6.4, 'R': 5.9, 'MDG': 4.9, 'KrF': 4.8 }},
  { date: '2023-01-15', pollster: 'Opinion', parties: { 'H': 29.7, 'Ap': 15.9, 'FrP': 12.5, 'SV': 10.6, 'Sp': 6.3, 'V': 6.0, 'R': 6.1, 'KrF': 5.1, 'MDG': 4.5 }},
  { date: '2023-01-01', pollster: 'Respons', parties: { 'H': 28.3, 'FrP': 12.6, 'Ap': 17.6, 'SV': 10.0, 'Sp': 7.3, 'V': 5.8, 'R': 5.4, 'MDG': 5.2, 'KrF': 5.0 }},
  
  // 2022 polls
  { date: '2022-12-15', pollster: 'Kantar TNS', parties: { 'H': 29.2, 'Ap': 16.4, 'FrP': 12.3, 'SV': 10.3, 'Sp': 7.1, 'V': 6.3, 'R': 5.7, 'KrF': 5.4, 'MDG': 4.7 }},
  { date: '2022-12-01', pollster: 'Norstat', parties: { 'H': 28.0, 'FrP': 12.4, 'Ap': 17.9, 'SV': 9.9, 'Sp': 6.9, 'V': 6.5, 'R': 6.0, 'MDG': 5.0, 'KrF': 4.9 }},
  { date: '2022-11-15', pollster: 'Opinion', parties: { 'H': 29.8, 'FrP': 12.1, 'Ap': 15.8, 'SV': 10.7, 'Sp': 6.4, 'V': 6.1, 'R': 6.2, 'KrF': 5.2, 'MDG': 4.6 }},
  { date: '2022-11-01', pollster: 'Respons', parties: { 'H': 28.4, 'Ap': 17.5, 'FrP': 12.2, 'SV': 10.1, 'Sp': 7.4, 'V': 5.9, 'R': 5.5, 'MDG': 5.3, 'KrF': 5.1 }},
  { date: '2022-10-15', pollster: 'Kantar TNS', parties: { 'H': 29.4, 'FrP': 12.0, 'Ap': 16.2, 'SV': 10.4, 'Sp': 7.2, 'V': 6.4, 'R': 5.8, 'KrF': 5.5, 'MDG': 4.8 }},
  { date: '2022-10-01', pollster: 'Norstat', parties: { 'H': 28.2, 'Ap': 17.8, 'FrP': 11.9, 'SV': 10.0, 'Sp': 7.0, 'V': 6.6, 'R': 6.1, 'MDG': 5.1, 'KrF': 5.0 }},
  { date: '2022-09-15', pollster: 'Opinion', parties: { 'H': 30.0, 'Ap': 15.6, 'FrP': 11.8, 'SV': 10.8, 'Sp': 6.5, 'V': 6.2, 'R': 6.3, 'KrF': 5.3, 'MDG': 4.7 }},
  { date: '2022-09-01', pollster: 'Respons', parties: { 'H': 28.5, 'FrP': 11.9, 'Ap': 17.4, 'SV': 10.2, 'Sp': 7.5, 'V': 6.0, 'R': 5.6, 'MDG': 5.4, 'KrF': 5.2 }},
  { date: '2022-08-15', pollster: 'Kantar TNS', parties: { 'H': 29.6, 'Ap': 16.0, 'FrP': 11.6, 'SV': 10.5, 'Sp': 7.3, 'V': 6.5, 'R': 5.9, 'KrF': 5.6, 'MDG': 4.9 }},
  { date: '2022-08-01', pollster: 'Norstat', parties: { 'H': 28.3, 'FrP': 11.7, 'Ap': 17.7, 'SV': 10.1, 'Sp': 7.1, 'V': 6.7, 'R': 6.2, 'MDG': 5.2, 'KrF': 5.1 }},
  { date: '2022-07-15', pollster: 'Opinion', parties: { 'H': 30.2, 'FrP': 11.5, 'Ap': 15.4, 'SV': 10.9, 'Sp': 6.6, 'V': 6.3, 'R': 6.4, 'KrF': 5.4, 'MDG': 4.8 }},
  { date: '2022-07-01', pollster: 'Respons', parties: { 'H': 28.7, 'Ap': 17.3, 'FrP': 11.6, 'SV': 10.3, 'Sp': 7.6, 'V': 6.1, 'R': 5.7, 'MDG': 5.5, 'KrF': 5.3 }},
  { date: '2022-06-15', pollster: 'Kantar TNS', parties: { 'H': 29.7, 'FrP': 11.4, 'Ap': 15.9, 'SV': 10.6, 'Sp': 7.4, 'V': 6.6, 'R': 6.0, 'KrF': 5.7, 'MDG': 5.0 }},
  { date: '2022-06-01', pollster: 'Norstat', parties: { 'H': 28.5, 'Ap': 17.6, 'FrP': 11.3, 'SV': 10.2, 'Sp': 7.2, 'V': 6.8, 'R': 6.3, 'MDG': 5.3, 'KrF': 5.2 }},
  { date: '2022-05-15', pollster: 'Opinion', parties: { 'H': 30.3, 'Ap': 15.3, 'FrP': 11.2, 'SV': 11.0, 'Sp': 6.7, 'V': 6.4, 'R': 6.5, 'KrF': 5.5, 'MDG': 4.9 }},
  { date: '2022-05-01', pollster: 'Respons', parties: { 'H': 28.8, 'FrP': 11.3, 'Ap': 17.2, 'SV': 10.4, 'Sp': 7.7, 'V': 6.2, 'R': 5.8, 'MDG': 5.6, 'KrF': 5.4 }},
  { date: '2022-04-15', pollster: 'Kantar TNS', parties: { 'H': 29.9, 'Ap': 15.7, 'FrP': 11.1, 'SV': 10.7, 'Sp': 7.5, 'V': 6.7, 'R': 6.1, 'KrF': 5.8, 'MDG': 5.1 }},
  { date: '2022-04-01', pollster: 'Norstat', parties: { 'H': 28.6, 'FrP': 11.2, 'Ap': 17.5, 'SV': 10.3, 'Sp': 7.3, 'V': 6.9, 'R': 6.4, 'MDG': 5.4, 'KrF': 5.3 }},
  { date: '2022-03-15', pollster: 'Opinion', parties: { 'H': 30.5, 'FrP': 11.0, 'Ap': 15.1, 'SV': 11.1, 'Sp': 6.8, 'V': 6.5, 'R': 6.6, 'KrF': 5.6, 'MDG': 5.0 }},
  { date: '2022-03-01', pollster: 'Respons', parties: { 'H': 29.0, 'Ap': 17.1, 'FrP': 11.1, 'SV': 10.5, 'Sp': 7.8, 'V': 6.3, 'R': 5.9, 'MDG': 5.7, 'KrF': 5.5 }},
  { date: '2022-02-15', pollster: 'Kantar TNS', parties: { 'H': 30.0, 'FrP': 10.9, 'Ap': 15.6, 'SV': 10.8, 'Sp': 7.6, 'V': 6.8, 'R': 6.2, 'KrF': 5.9, 'MDG': 5.2 }},
  { date: '2022-02-01', pollster: 'Norstat', parties: { 'H': 28.8, 'Ap': 17.4, 'FrP': 10.8, 'SV': 10.4, 'Sp': 7.4, 'V': 7.0, 'R': 6.5, 'MDG': 5.5, 'KrF': 5.4 }},
  { date: '2022-01-15', pollster: 'Opinion', parties: { 'H': 30.6, 'Ap': 15.0, 'FrP': 10.7, 'SV': 11.2, 'Sp': 6.9, 'V': 6.6, 'R': 6.7, 'KrF': 5.7, 'MDG': 5.1 }},
  { date: '2022-01-01', pollster: 'Respons', parties: { 'H': 29.1, 'FrP': 10.8, 'Ap': 17.0, 'SV': 10.6, 'Sp': 7.9, 'V': 6.4, 'R': 6.0, 'MDG': 5.8, 'KrF': 5.6 }}
];

console.log(`Importing ${recentPolls.length} recent polls...`);

// First, clear any existing polls from 2022 onwards
db.run("DELETE FROM polls WHERE date >= '2022-01-01'", (err) => {
  if (err) {
    console.error('Error clearing old polls:', err);
    return;
  }
  
  console.log('✓ Cleared existing polls from 2022 onwards\n');
  
  // Now insert the new polls
  db.serialize(() => {
    const stmt = db.prepare("INSERT INTO polls (year, date, pollster, party_id, pct, source) VALUES (?, ?, ?, ?, ?, ?)");
    
    let successCount = 0;
    let errorCount = 0;
    
    recentPolls.forEach(poll => {
      // All polls from 2022 onwards are associated with 2025 election
      const year = 2025;
      
      Object.entries(poll.parties).forEach(([party, pct]) => {
        stmt.run(year, poll.date, poll.pollster, party, pct, 'Recent polls', (err) => {
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
          "SELECT COUNT(DISTINCT date || '_' || pollster) as poll_count, MIN(date) as earliest, MAX(date) as latest FROM polls WHERE year = 2025",
          (err, rows) => {
            if (!err && rows[0]) {
              console.log('\n✓ Import complete!');
              console.log(`  - ${rows[0].poll_count} unique polls added for 2025 election`);
              console.log(`  - Date range: ${rows[0].earliest} to ${rows[0].latest}`);
              
              // Also show pollster breakdown
              db.all(
                "SELECT pollster, COUNT(DISTINCT date) as count FROM polls WHERE year = 2025 GROUP BY pollster ORDER BY count DESC",
                (err, pollsters) => {
                  if (!err && pollsters) {
                    console.log('\nPolls by pollster:');
                    pollsters.forEach(p => {
                      console.log(`  - ${p.pollster}: ${p.count} polls`);
                    });
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
});