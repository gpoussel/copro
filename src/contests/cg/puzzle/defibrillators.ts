// @ts-nocheck
// 🎮 CodinGame Puzzle - defibrillators
// https://www.codingame.com/training/easy/defibrillators

// Read user's position
const userLonDeg = parseFloat(readline().replace(',', '.'));
const userLatDeg = parseFloat(readline().replace(',', '.'));

const N = parseInt(readline());

// Convert degrees to radians
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Haversine-based distance formula as given in puzzle:
// x = (lonB - lonA) * cos((latA + latB) / 2)
// y = latB - latA
// d = sqrt(x*x + y*y) * 6371
function distance(lonA: number, latA: number, lonB: number, latB: number): number {
  const lonARad = toRad(lonA);
  const latARad = toRad(latA);
  const lonBRad = toRad(lonB);
  const latBRad = toRad(latB);

  const x = (lonBRad - lonARad) * Math.cos((latARad + latBRad) / 2);
  const y = latBRad - latARad;
  return Math.sqrt(x * x + y * y) * 6371;
}

let closestName = '';
let closestDist = Infinity;

for (let i = 0; i < N; i++) {
  const line = readline();
  const parts = line.split(';');
  // fields: id;name;address;phone;longitude;latitude
  const name = parts[1];
  const lon = parseFloat(parts[4].replace(',', '.'));
  const lat = parseFloat(parts[5].replace(',', '.'));

  const dist = distance(userLonDeg, userLatDeg, lon, lat);
  if (dist < closestDist) {
    closestDist = dist;
    closestName = name;
  }
}

console.log(closestName);
