const https = require('https');

const videoCandidates = {
  'science-centre': [
    'https://www.youtube.com/watch?v=q6g4b5L6f7M',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  ],
  'discovery-centre': [
    'https://www.youtube.com/watch?v=9g2zM6e9i7w'
  ]
};

// Let's test if we can fetch youtube oEmbed
function testOembed(url) {
  return new Promise((resolve) => {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    https.get(oembedUrl, (res) => {
      resolve({ url, statusCode: res.statusCode });
    }).on('error', () => {
      resolve({ url, statusCode: 500 });
    });
  });
}

async function testAll() {
  const tests = [
    'https://www.youtube.com/watch?v=kYJ5q5hK41A',
    'https://www.youtube.com/watch?v=tY2uK6vFz9s',
    'https://www.youtube.com/watch?v=18M5_22Cq-g',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=J---aiyznGQ'
  ];
  for (const url of tests) {
    const res = await testOembed(url);
    console.log(`${url} -> status: ${res.statusCode}`);
  }
}

testAll();
