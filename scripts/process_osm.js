const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('siet_osm_raw.json', 'utf8'));

// Build node map
const nodeMap = new Map();
for (const el of raw.elements) {
  if (el.type === 'node') {
    nodeMap.set(el.id, [el.lon, el.lat]);
  }
}

console.log('Total nodes indexed:', nodeMap.size);

const geojson = {
  type: 'FeatureCollection',
  features: []
};

for (const el of raw.elements) {
  if (el.type === 'way' && el.nodes && el.nodes.length > 0) {
    const coords = el.nodes.map(nid => nodeMap.get(nid)).filter(Boolean);
    if (coords.length < 2) continue;

    const isClosed = el.nodes[0] === el.nodes[el.nodes.length - 1] && coords.length >= 4;
    const isBuilding = el.tags && (el.tags.building || el.tags.amenity === 'college' || el.tags.amenity === 'parking');

    let geomType = (isClosed && isBuilding) ? 'Polygon' : 'LineString';
    let geomCoords = (geomType === 'Polygon') ? [coords] : coords;

    geojson.features.push({
      type: 'Feature',
      id: el.id,
      properties: {
        id: el.id,
        tags: el.tags || {},
        name: el.tags?.name || (el.tags?.building ? `Building ${el.id}` : undefined),
        building: el.tags?.building,
        highway: el.tags?.highway,
        amenity: el.tags?.amenity,
        levels: el.tags?.['building:levels'],
        surface: el.tags?.surface
      },
      geometry: {
        type: geomType,
        coordinates: geomCoords
      }
    });
  }
}

fs.writeFileSync('siet_campus_osm_features.geojson', JSON.stringify(geojson, null, 2));
console.log('Saved siet_campus_osm_features.geojson with features:', geojson.features.length);

// Log details of all college and building features
console.log('\n--- COLLEGE BOUNDARY & BUILDINGS ---');
for (const f of geojson.features) {
  if (f.properties.amenity === 'college' || f.properties.building) {
    // compute bbox / center
    const pts = f.geometry.type === 'Polygon' ? f.geometry.coordinates[0] : f.geometry.coordinates;
    const lons = pts.map(p => p[0]);
    const lats = pts.map(p => p[1]);
    const minLon = Math.min(...lons), maxLon = Math.max(...lons);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const center = [((minLon + maxLon)/2).toFixed(7), ((minLat + maxLat)/2).toFixed(7)];
    console.log(`ID: ${f.id} | Name: ${f.properties.name || f.properties.tags?.building || 'building'} | Center: [${center[1]}, ${center[0]}] | Levels: ${f.properties.levels || 'N/A'}`);
  }
}
