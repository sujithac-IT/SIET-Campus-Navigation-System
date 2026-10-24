const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

(async () => {
  try {
    const html = await get('https://www.siet.ac.in/');
    console.log('Homepage length:', html.length);
    // Find department links, facility mentions, etc.
    const depts = [...html.matchAll(/href="([^"]*(?:department|campus|facility|infrastructure|about)[^"]*)"/gi)].map(m => m[1]);
    console.log('Relevant links found:', [...new Set(depts)].slice(0, 20));
  } catch (err) {
    console.error('Error fetching siet.ac.in:', err.message);
  }
})();
