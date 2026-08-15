const { createClient } = require('@sanity/client');

async function testAllSources() {
  const results = {};

  // 1. Sanity CMS
  try {
    const client = createClient({
      projectId: '8xtd7yiv',
      dataset: 'production',
      apiVersion: '2024-07-09',
      useCdn: false,
      token: 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG'
    });
    const settings = await client.fetch('*[_type == "siteSettings"][0]');
    results['Sanity CMS'] = {
      status: 'OK',
      details: `Project ID: 8xtd7yiv, Dataset: production, Hero Title: "${settings?.heroTitle}"`
    };
  } catch (err) {
    results['Sanity CMS'] = { status: 'FAILED', details: err.message };
  }

  // 2. DMCQuote External API
  try {
    const baseUrl = 'https://dmcquote.com/b2b/api/external/v1';
    const apiKey = 'b2b_BXHjj22isxNfiAAItTnt59LDCyAN';
    const res = await fetch(`${baseUrl}/transfers/zones`, {
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      results['DMCQuote API'] = {
        status: 'OK',
        details: `Connected to ${baseUrl}/transfers/zones, status: ${res.status}, response type: ${Array.isArray(data) ? data.length + ' zones' : typeof data}`
      };
    } else {
      results['DMCQuote API'] = {
        status: `HTTP ${res.status}`,
        details: await res.text()
      };
    }
  } catch (err) {
    results['DMCQuote API'] = { status: 'FAILED', details: err.message };
  }

  // 3. Web3Forms API Key check
  try {
    const accessKey = '3bd556ad-fdfd-466e-921b-6c6b330164ca';
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: 'Connectivity Test',
        from_name: 'System Test',
        name: 'System Test',
        email: 'test@example.com',
        message: 'Ping test'
      })
    });
    const data = await res.json();
    results['Web3Forms'] = {
      status: data.success ? 'OK' : 'KEY ERROR',
      details: data.message || JSON.stringify(data)
    };
  } catch (err) {
    results['Web3Forms'] = { status: 'FAILED', details: err.message };
  }

  // 4. Google Sheets Attractions Feed
  try {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pubhtml';
    const res = await fetch(sheetUrl);
    results['Google Sheets Feed'] = {
      status: res.ok ? 'OK' : `HTTP ${res.status}`,
      details: `Attractions Live Feed published spreadsheet reachable (${res.status})`
    };
  } catch (err) {
    results['Google Sheets Feed'] = { status: 'FAILED', details: err.message };
  }

  console.log('\n===== ALL SOURCES CONNECTIVITY REPORT =====');
  console.log(JSON.stringify(results, null, 2));
  console.log('===========================================\n');
}

testAllSources();
