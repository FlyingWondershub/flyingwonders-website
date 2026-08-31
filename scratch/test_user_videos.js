const https = require('https');

const userVideos = [
  { name: 'Science Centre', url: 'https://www.youtube.com/watch?v=Yuq0NgUrfO4' },
  { name: 'Discovery Centre', url: 'https://www.youtube.com/watch?v=l2icwMDpt3E' },
  { name: 'Marina Barrage', url: 'https://www.youtube.com/watch?v=wiHoE2q1_2s' },
  { name: 'SUTD', url: 'https://www.youtube.com/watch?v=NQvj2Fh1oM8' },
  { name: 'SMU', url: 'https://www.youtube.com/watch?v=8EUX0DzJmKM' },
  { name: 'NTU', url: 'https://www.youtube.com/watch?v=4npS2JMGQa8' },
  { name: 'NUS', url: 'https://www.youtube.com/watch?v=DYhF88rJjlw' },
];

function testOembed(url) {
  return new Promise((resolve) => {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    https.get(oembedUrl, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        resolve({ url, statusCode: res.statusCode, title: res.statusCode === 200 ? JSON.parse(body).title : 'ERROR' });
      });
    }).on('error', () => {
      resolve({ url, statusCode: 500, title: 'ERROR' });
    });
  });
}

async function verifyAll() {
  console.log("Verifying all 7 restored user video URLs against YouTube oEmbed API:\n");
  for (const item of userVideos) {
    const res = await testOembed(item.url);
    console.log(`[${res.statusCode === 200 ? '✅ 200 OK' : '❌ ERROR'}] ${item.name}: "${res.title}" (${item.url})`);
  }
}

verifyAll();
