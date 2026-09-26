// 🎮 CodinGame Puzzle - the-parking
// https://www.codingame.com/training/medium/the-parking

// Fees in tenths of euro per started 15 minutes, full day in tenths as well
const RATE: { [kind: string]: number } = { C: 12, M: 7 }
const SLOTS: { [kind: string]: number } = { C: 7, M: 2 }
const FULL_DAY = 300

const parked: { [plate: string]: number } = {}
const used: { [kind: string]: number } = { C: 0, M: 0 }
const rejected: { [kind: string]: number } = { C: 0, M: 0 }
let total = 0

const h = parseInt(readline())
for (let i = 0; i < h; i++) {
  const [time, direction, ...plates] = readline().trim().split(/\s+/)
  const [hh, mm] = time.split(":").map(Number)
  const minute = hh * 60 + mm
  for (const plate of plates) {
    const kind = plate[0]
    if (direction === ">") {
      if (used[kind] < SLOTS[kind]) {
        used[kind]++
        parked[plate] = minute
      } else rejected[kind]++
    } else if (plate in parked) {
      const duration = minute - parked[plate]
      if (duration >= 30) total += Math.ceil(duration / 15) * RATE[kind]
      delete parked[plate]
      used[kind]--
    }
  }
}
total += FULL_DAY * Object.keys(parked).length

console.log(`${(total / 10).toFixed(1)} ${rejected.C} ${rejected.M}`)
