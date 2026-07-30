const fs = require('fs');

async function searchKlook(name) {
  try {
    const url = `https://www.klook.com/v1/usrv3/search/search_result/?query=${encodeURIComponent(name)}&page=1&limit=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const text = await res.text();
    fs.writeFileSync('klook_test.json', text);
    console.log(`Saved klook_test.json for ${name}`);
  } catch(e) {
    console.error(e);
  }
}

searchKlook('Canopy Park Jewel');
