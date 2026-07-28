const https = require('https');
https.get('https://www.google.com', (res) => {
  console.log('Status code for google:', res.statusCode);
}).on('error', (e) => {
  console.log('Failed:', e.message);
});
