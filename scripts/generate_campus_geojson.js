const fs = require('fs');

const osmFeatures = JSON.parse(fs.readFileSync('siet_campus_osm_features.geojson', 'utf8'));

// Filter only features strictly within SIET campus boundary (lat 11.0375 to 11.0435, lon 77.0720 to 77.0785)
const campusFeatures = osmFeatures.features.filter(f => {
  const coords = f.geometry.type === 'Polygon' ? f.geometry.coordinates[0] : f.geometry.coordinates;
  const inCampus = coords.some(c => c[1] >= 11.0375 && c[1] <= 11.0435 && c[0] >= 77.0720 && c[0] <= 77.0785);
  return inCampus;
});

console.log('Filtered campus features:', campusFeatures.length);

const campusGeoJSON = {
  type: 'FeatureCollection',
  features: campusFeatures
};

fs.writeFileSync('client/src/lib/data/siet_campus.geojson.json', JSON.stringify(campusGeoJSON, null, 2));
console.log('Wrote client/src/lib/data/siet_campus.geojson.json');
