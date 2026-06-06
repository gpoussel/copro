// @ts-nocheck
// 🎮 CodinGame Puzzle - another-road-construction-site---1
// https://www.codingame.com/training/easy/another-road-construction-site---1

const HIGHWAY_SPEED = 130; // km/h

const roadLength = parseInt(readline());
const zoneQuantity = parseInt(readline());

const zones: { km: number; speed: number }[] = [];
for (let i = 0; i < zoneQuantity; i++) {
  const [zoneKm, zoneSpeed] = readline().split(' ').map(Number);
  zones.push({ km: zoneKm, speed: zoneSpeed });
}

// Sort zones by km (in case they are not ordered)
zones.sort((a, b) => a.km - b.km);

// Build segments: [startKm, endKm, speed]
const segments: { start: number; end: number; speed: number }[] = [];

// First segment: from 0 to first zone (or end of road)
const firstZoneKm = zones.length > 0 ? zones[0].km : roadLength;
if (firstZoneKm > 0) {
  segments.push({ start: 0, end: firstZoneKm, speed: HIGHWAY_SPEED });
}

// Remaining segments: each zone goes until the next zone starts (or end of road)
for (let i = 0; i < zones.length; i++) {
  const start = zones[i].km;
  const end = i + 1 < zones.length ? zones[i + 1].km : roadLength;
  segments.push({ start, end, speed: zones[i].speed });
}

// Calculate actual travel time (in hours)
let actualTime = 0;
for (const seg of segments) {
  const distance = seg.end - seg.start;
  actualTime += distance / seg.speed;
}

// Calculate theoretical time (in hours)
const theoreticalTime = roadLength / HIGHWAY_SPEED;

// Difference in minutes, rounded to nearest minute
const diffMinutes = (actualTime - theoreticalTime) * 60;
console.log(Math.round(diffMinutes));
