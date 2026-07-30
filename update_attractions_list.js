const fs = require('fs');

async function updateList() {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pub?output=csv';
  const res = await fetch(url);
  const text = await res.text();
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const dataLines = lines.slice(1);
  const names = [];

  for (const line of dataLines) {
    let parts = [];
    let currentPart = '';
    let insideQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') { insideQuote = !insideQuote; }
      else if (char === ',' && !insideQuote) { parts.push(currentPart.trim()); currentPart = ''; }
      else { currentPart += char; }
    }
    parts.push(currentPart.trim());
    if (parts.length >= 1 && parts[0]) {
      const name = parts[0].replace(/^\"|\"$/g, '');
      if (name) names.push(name);
    }
  }

  console.log('Names count from Google Sheet:', names.length);
  console.log('Sample names:', names.slice(0, 10));

  const content = `export const ATTRACTION_NAMES = ${JSON.stringify(names, null, 2)}\n`;
  fs.writeFileSync('sanity/schemaTypes/attractionsList.ts', content);
  console.log('Updated sanity/schemaTypes/attractionsList.ts!');
}

updateList().catch(console.error);
