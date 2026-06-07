// 🎮 CodinGame Puzzle - hello-world
// https://www.codingame.com/training/easy/hello-world

function parseCoord(lat: string, lon: string): [number, number] {
  // latitude: N/S + dd + mm + ss
  const latSign = lat[0] === "N" ? 1 : -1
  const latDeg = parseInt(lat.slice(1, 3), 10)
  const latMin = parseInt(lat.slice(3, 5), 10)
  const latSec = parseInt(lat.slice(5, 7), 10)
  const latDecimal = latSign * (latDeg + latMin / 60 + latSec / 3600)

  // longitude: E/W + ddd + mm + ss
  const lonSign = lon[0] === "E" ? 1 : -1
  const lonDeg = parseInt(lon.slice(1, 4), 10)
  const lonMin = parseInt(lon.slice(4, 6), 10)
  const lonSec = parseInt(lon.slice(6, 8), 10)
  const lonDecimal = lonSign * (lonDeg + lonMin / 60 + lonSec / 3600)

  return [(latDecimal * Math.PI) / 180, (lonDecimal * Math.PI) / 180]
}

function orthodromicDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Great-circle distance using arccos formula
  const R = 6371 // km
  const sinProduct = Math.sin(lat1) * Math.sin(lat2)
  const cosProduct = Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
  const arg = sinProduct + cosProduct
  // Clamp to [-1, 1] to avoid NaN from floating point errors
  const clamped = Math.max(-1, Math.min(1, arg))
  return R * Math.acos(clamped)
}

const n = parseInt(readline())
const m = parseInt(readline())

const capitals: { lat: number; lon: number }[] = []
const capitalLines: string[] = []
for (let i = 0; i < n; i++) {
  capitalLines.push(readline())
}
const messages: string[] = []
for (let i = 0; i < n; i++) {
  messages.push(readline())
}

for (let i = 0; i < n; i++) {
  const parts = capitalLines[i].split(" ")
  // parts[0] = name, parts[1] = latitude, parts[2] = longitude
  const [lat, lon] = parseCoord(parts[1], parts[2])
  capitals.push({ lat, lon })
}

for (let j = 0; j < m; j++) {
  const parts = readline().split(" ")
  const [tLat, tLon] = parseCoord(parts[0], parts[1])

  // Compute distances from this travel point to all capitals
  const distances: number[] = capitals.map(c => orthodromicDistance(tLat, tLon, c.lat, c.lon))

  // Round to integer km using half-up rounding
  const roundedDistances = distances.map(d => Math.floor(d + 0.5))

  const minDist = Math.min(...roundedDistances)

  // Collect all capitals with the minimum distance (in order)
  const result: string[] = []
  for (let i = 0; i < n; i++) {
    if (roundedDistances[i] === minDist) {
      result.push(messages[i])
    }
  }

  console.log(result.join(" "))
}
