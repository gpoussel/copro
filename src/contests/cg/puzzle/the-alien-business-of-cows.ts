// 🎮 CodinGame Puzzle - the-alien-business-of-cows
// https://www.codingame.com/training/medium/the-alien-business-of-cows

const PI = 3.14159265359
const KM_PER_DEGREE = 111.11
const MISSILE_SPEED = 6 // km/s
const MISSILE_ALTITUDE = 160 // km
const HOVER_HEIGHT = 0.5 // km
const ABDUCTION_SPEED = 9.81 // m/s

interface Collector {
  name: string
  speed: number // km/s
  capacity: number
  efficiency: number
  minCows: number
}

const collectors: Collector[] = [
  { name: "VaCoWM Cleaner", speed: 44.7, capacity: 3, efficiency: 0.8, minCows: 1 },
  { name: "L4nd MoWer", speed: 22.38, capacity: 10, efficiency: 1.2, minCows: 6 },
  { name: "Cow Harvester", speed: 11.19, capacity: 20, efficiency: 1.5, minCows: 14 },
]

function parseDms(text: string): number {
  const match = /(\d+)\D+(\d+)\D+([\d.]+)/.exec(text)!
  return Number(match[1]) + Number(match[2]) / 60 + Number(match[3]) / 3600
}

const SILO_LAT = 34 + 45 / 60 + 21.8 / 3600
const SILO_LON = 120 + 37 / 60 + 34.8 / 3600
const SILO_ELEVATION = 0.046 // km

const n = parseInt(readline())
for (let i = 0; i < n; i++) {
  const parts = readline().trim().split(" ")
  const elevation = Number(parts.pop()) / 1000
  const lon = parseDms(parts.pop()!)
  const lat = parseDms(parts.pop()!)
  const name = parts.join(" ")

  const dy = (lat - SILO_LAT) * KM_PER_DEGREE
  const dx = (lon - SILO_LON) * KM_PER_DEGREE * Math.cos((((lat + SILO_LAT) / 2) * PI) / 180)
  const dz = MISSILE_ALTITUDE - SILO_ELEVATION
  const missileTime = Math.sqrt(dx * dx + dy * dy + dz * dz) / MISSILE_SPEED

  // The collector must be above the missile's cruise altitude before the missile gets there
  let best: [Collector, number] | null = null
  for (const collector of collectors) {
    const cowTime = (HOVER_HEIGHT * 1000) / (ABDUCTION_SPEED * collector.efficiency)
    const climbTime = (MISSILE_ALTITUDE - elevation - HOVER_HEIGHT) / collector.speed
    let cows = 0
    while (cows < collector.capacity && (cows + 1) * cowTime + climbTime < missileTime) cows++
    if (cows >= collector.minCows && (best === null || cows > best[1])) best = [collector, cows]
  }

  if (best === null) console.log(`${name}: impossible.`)
  else console.log(`${name}: possible. Send a ${best[0].name} to bring back ${best[1]} cow${best[1] > 1 ? "s" : ""}.`)
}
