const https = require('https');
const fs = require('fs');

const query = `[out:json][timeout:30];
(
  node(11.037,77.071,11.045,77.079);
  way(11.037,77.071,11.045,77.079);
  relation(11.037,77.071,11.045,77.079);
);
out body;
>;
out skel qt;`;

const postData = 'data=' + encodeURIComponent(query);

const req = https.request({
  hostname: 'overpass-api.de',
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'SIET-SmartNav-Research/1.0'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      fs.writeFileSync('siet_osm_raw.json', data);
      const parsed = JSON.parse(data);
      console.log('OSM Elements found:', parsed.elements.length);
      const tagged = parsed.elements.filter(e => e.tags && (e.tags.building || e.tags.amenity || e.tags.leisure || e.tags.highway || e.tags.name));
      console.log('Tagged features count:', tagged.length);
      tagged.forEach(b => {
        console.log('ID:', b.id, 'Type:', b.type, 'Tags:', JSON.stringify(b.tags));
      });
    } catch (e) {
      console.error('Error parsing JSON:', e.message, data.slice(0, 300));
    }
  });
});
req.on('error', console.error);
req.write(postData);
req.end();
