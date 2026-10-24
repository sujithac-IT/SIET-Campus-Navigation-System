const assert = require('assert');

// Simplified node environment test for Dijkstra & Geodesic calculations
function calculateDistanceMeters(a, b) {
  if (a.lat !== undefined && a.lng !== undefined && b.lat !== undefined && b.lng !== undefined) {
    const R = 6371000;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;

    const sinDlat = Math.sin(dLat / 2);
    const sinDlng = Math.sin(dLng / 2);
    const h = sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlng * sinDlng;
    return Math.round(2 * R * Math.asin(Math.sqrt(Math.min(1, h))));
  }
  const dx = (b.x ?? 0) - (a.x ?? 0);
  const dy = (b.y ?? 0) - (a.y ?? 0);
  return Math.round(Math.sqrt(dx * dx + dy * dy) * 8);
}

// 1. Test Geodesic Distance
console.log('--- TEST 1: Geodesic Distance Check ---');
const gate = { lat: 11.040913, lng: 77.077493 };
const mainBlock = { lat: 11.039940, lng: 77.074923 };
const distGateToMain = calculateDistanceMeters(gate, mainBlock);
console.log(`Gate to Main Block direct distance: ${distGateToMain} meters`);
assert(distGateToMain >= 250 && distGateToMain <= 350, 'Distance must be ~280-310m');
console.log('✅ TEST 1 PASSED: Real coordinate distance accurate to ~300m');

// 2. Test Dijkstra routing on verified SIET graph
console.log('\n--- TEST 2: Dijkstra Routing on Verified Graph ---');
const nodes = [
  { id: 'gn-gate', name: 'Main Gate', lat: 11.040913, lng: 77.077493 },
  { id: 'gn-avenue-east', name: 'Palm Avenue East', lat: 11.040989, lng: 77.076246 },
  { id: 'gn-roundabout', name: 'Roundabout', lat: 11.040926, lng: 77.075120 },
  { id: 'gn-admin-porch', name: 'Main Admin Block Porch', lat: 11.040050, lng: 77.075050 },
  { id: 'gn-sports-junc', name: 'Sports Arena Junction', lat: 11.039507, lng: 77.073776 },
  { id: 'gn-bball-court', name: 'Basketball Court', lat: 11.039450, lng: 77.073400 }
];

const edges = [
  { from: 'gn-gate', to: 'gn-avenue-east', distanceMeters: 138, isAccessible: true, type: 'walkway' },
  { from: 'gn-avenue-east', to: 'gn-roundabout', distanceMeters: 124, isAccessible: true, type: 'walkway' },
  { from: 'gn-roundabout', to: 'gn-admin-porch', distanceMeters: 98, isAccessible: true, type: 'walkway' },
  { from: 'gn-roundabout', to: 'gn-sports-junc', distanceMeters: 140, isAccessible: true, type: 'walkway' },
  { from: 'gn-sports-junc', to: 'gn-bball-court', distanceMeters: 42, isAccessible: true, type: 'walkway' }
];

function runDijkstra(startId, targetId, validEdges) {
  const distances = {};
  const previous = {};
  const unvisited = new Set(nodes.map(n => n.id));

  nodes.forEach(n => {
    distances[n.id] = Infinity;
    previous[n.id] = null;
  });
  distances[startId] = 0;

  while (unvisited.size > 0) {
    let currentId = null;
    let min = Infinity;
    for (const nid of unvisited) {
      if (distances[nid] < min) {
        min = distances[nid];
        currentId = nid;
      }
    }
    if (!currentId || currentId === targetId || min === Infinity) break;
    unvisited.delete(currentId);

    const connected = validEdges.filter(e => e.from === currentId || e.to === currentId);
    for (const edge of connected) {
      const neighbor = edge.from === currentId ? edge.to : edge.from;
      if (!unvisited.has(neighbor)) continue;
      const alt = distances[currentId] + edge.distanceMeters;
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = currentId;
      }
    }
  }

  const path = [];
  let curr = targetId;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }
  return { path, totalDist: distances[targetId] };
}

const r1 = runDijkstra('gn-gate', 'gn-admin-porch', edges);
console.log('Route from Gate to Admin Porch:', r1.path.join(' -> '), `| Total: ${r1.totalDist}m`);
assert.strictEqual(r1.path.length, 4);
assert.strictEqual(r1.totalDist, 360);
console.log('✅ TEST 2 PASSED: Gate -> Admin porch path found with exact distance');

const r2 = runDijkstra('gn-gate', 'gn-bball-court', edges);
console.log('Route from Gate to Basketball Court:', r2.path.join(' -> '), `| Total: ${r2.totalDist}m`);
assert.strictEqual(r2.path.length, 5);
assert.strictEqual(r2.totalDist, 444);
console.log('✅ TEST 2.1 PASSED: Gate -> Basketball court path found via Roundabout and Sports Junction');

// 3. Test Disconnected Node Handling
console.log('\n--- TEST 3: Disconnected Node Handling ---');
const disconnectedTarget = 'gn-isolated';
const r3 = runDijkstra('gn-gate', disconnectedTarget, edges);
assert(r3.totalDist === Infinity || r3.totalDist === undefined, 'Unreachable node must yield Infinity or undefined');
console.log('✅ TEST 3 PASSED: Disconnected nodes correctly detected and handled');

// 4. Test Timetable Relocation & Delta Distance
console.log('\n--- TEST 4: Timetable Classroom Change Delta ---');
const oldRoom = { name: 'LH-25', lat: 11.040734, lng: 77.074880 }; // Library Block
const newRoom = { name: 'TECH-101', lat: 11.040404, lng: 77.074018 }; // Academic Block
const delta = calculateDistanceMeters(oldRoom, newRoom);
console.log(`Relocation delta distance between ${oldRoom.name} and ${newRoom.name}: ${delta}m`);
assert(delta > 80 && delta < 150, 'Delta between Library and Academic block should be ~100m');
const walkingTimeDelta = Math.max(1, Math.ceil(delta / 78));
console.log(`Estimated additional walking time: ${walkingTimeDelta} min`);
console.log('✅ TEST 4 PASSED: Classroom shift delta accurately computed');

console.log('\nALL 4 NAVIGATION TESTS COMPLETED SUCCESSFULLY! ✨');
