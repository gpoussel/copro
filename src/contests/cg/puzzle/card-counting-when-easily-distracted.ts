// 🎮 CodinGame Puzzle - card-counting-when-easily-distracted
// https://www.codingame.com/

const stream = readline()
const bustThreshold = Number(readline())

// Card character -> value. Single standard deck: 4 of each value, but the
// four "ten" ranks (T/J/Q/K) share value 10, giving 16 tens.
const value: Record<string, number> = {
  A: 1,
  T: 10,
  J: 10,
  Q: 10,
  K: 10,
}
for (let d = 2; d <= 9; d++) value[String(d)] = d

// Remaining cards per value in a fresh deck.
const remaining: Record<number, number> = {}
for (let v = 1; v <= 9; v++) remaining[v] = 4
remaining[10] = 16

for (const segment of stream.split(".")) {
  // A segment is cards only if it's non-empty and every char is a valid card.
  if (segment.length > 0 && [...segment].every(c => c in value)) {
    for (const c of segment) {
      const v = value[c]
      if (remaining[v] > 0) remaining[v]--
    }
  }
}

let favorable = 0
let total = 0
for (let v = 1; v <= 10; v++) {
  total += remaining[v]
  if (v < bustThreshold) favorable += remaining[v]
}

const pct = total === 0 ? 0 : Math.round((favorable / total) * 100)
console.log(`${pct}%`)
