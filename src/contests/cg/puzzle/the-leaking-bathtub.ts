// 🎮 CodinGame Puzzle - the-leaking-bathtub
// https://www.codingame.com/

const S: number = parseInt(readline(), 10)
const h: number = parseInt(readline(), 10)
const flow: number = parseInt(readline(), 10)
const n: number = parseInt(readline(), 10)

type Leak = { height: number; flow: number }
const leaks: Leak[] = []
for (let i = 0; i < n; i++) {
  const parts: number[] = readline()
    .split(" ")
    .map((v: string) => parseInt(v, 10))
  leaks.push({ height: parts[0], flow: parts[1] })
}

// Boundary heights where the active-leak set changes: 0, each leak height, h.
const boundaries: number[] = [0, h]
for (const leak of leaks) {
  boundaries.push(leak.height)
}
const uniqueBoundaries: number[] = Array.from(new Set<number>(boundaries)).sort((a: number, b: number) => a - b)

// Volume per cm of height in cm^3 = S. Flow in L/min -> cm^3/min = *1000.
// Time accumulated in minutes.
let totalMinutes: number = 0
let fillable: boolean = true
let stuckHeight: number = 0

for (let i = 0; i < uniqueBoundaries.length - 1; i++) {
  const lower: number = uniqueBoundaries[i]
  const upper: number = uniqueBoundaries[i + 1]
  // Active leaks while filling this segment: those whose height <= lower.
  let leakSum: number = 0
  for (const leak of leaks) {
    if (leak.height <= lower) {
      leakSum += leak.flow
    }
  }
  const netFlow: number = flow - leakSum // L/min
  if (netFlow <= 0) {
    fillable = false
    stuckHeight = lower
    break
  }
  const volume: number = (upper - lower) * S // cm^3
  const minutes: number = volume / (netFlow * 1000)
  totalMinutes += minutes
}

if (!fillable) {
  console.log(`Impossible, ${stuckHeight} cm.`)
} else {
  const totalSeconds: number = Math.floor(totalMinutes * 60)
  const hh: number = Math.floor(totalSeconds / 3600)
  const mm: number = Math.floor((totalSeconds % 3600) / 60)
  const ss: number = totalSeconds % 60
  const pad = (x: number): string => x.toString().padStart(2, "0")
  console.log(`${pad(hh)}:${pad(mm)}:${pad(ss)}`)
}
