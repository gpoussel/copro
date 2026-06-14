// 🎮 CodinGame Puzzle - timer-for-clash-of-code
// https://www.codingame.com/training/timer-for-clash-of-code

const n = parseInt(readline())
const joins: number[] = []
for (let i = 0; i < n; i++) {
  const parts = readline().split(":")
  joins.push(parseInt(parts[0]) * 60 + parseInt(parts[1]))
}

const fmt = (s: number): string => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, "0")}`
}

if (n === 0) {
  console.log("NO GAME")
} else {
  let players = 1
  let stop = 0
  let result = 0
  for (let i = 0; i < n; i++) {
    const t = joins[i]
    if (t < stop) break
    let newStop = t - 256 / Math.pow(2, players - 1)
    if (newStop < 0) newStop = 0
    stop = newStop
    players++
    result = stop
    if (players === 8) {
      result = t
      break
    }
  }
  console.log(fmt(result))
}
