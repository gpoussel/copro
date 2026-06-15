// 🎮 CodinGame Puzzle - timer-for-clash-of-code
// https://www.codingame.com/

const n: number = parseInt(readline(), 10)

if (n === 0) {
  console.log("NO GAME")
} else {
  const parse = (s: string): number => {
    const [m, sec] = s.split(":")
    return parseInt(m, 10) * 60 + parseInt(sec, 10)
  }

  let stop: number = -1
  let players: number = 1
  let joined: number = 0
  let lastJoin: number = 0

  for (let i = 0; i < n; i++) {
    const t: number = parse(readline())
    if (stop >= 0 && t < stop) {
      break
    }
    lastJoin = t
    stop = t - 256 / 2 ** (players - 1)
    if (stop < 0) {
      stop = 0
    }
    players++
    joined++
  }

  if (joined === 7) {
    stop = lastJoin
  }

  const mins: number = Math.floor(stop / 60)
  const secs: number = stop % 60
  console.log(`${mins}:${secs.toString().padStart(2, "0")}`)
}
