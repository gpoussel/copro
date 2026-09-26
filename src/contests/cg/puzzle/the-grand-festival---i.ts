// 🎮 CodinGame Puzzle - the-grand-festival---i
// https://www.codingame.com/training/medium/the-grand-festival---i

const tournamentCount = parseInt(readline(), 10)
const maxStreak = parseInt(readline(), 10)

// best[s] = maximum money so far when the current playing streak is s days (s = 0 means resting)
let best: number[] = [0]
for (let s = 1; s <= maxStreak; s++) best.push(-Infinity)

for (let day = 0; day < tournamentCount; day++) {
  const prize = parseInt(readline(), 10)
  const next: number[] = [Math.max.apply(null, best)]
  for (let s = 1; s <= maxStreak; s++) next.push(best[s - 1] + prize)
  best = next
}
console.log(Math.max.apply(null, best))
