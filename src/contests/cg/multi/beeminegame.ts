// 🎮 CodinGame Multiplayer - beeminegame
// https://www.codingame.com/multiplayer/bot-programming/beeminegame
//
// League 1: 19x9 board, grow the territory one neutral square per turn (both
// players at once; a clash leaves it neutral). Each beehive gives a point per
// turn to the strictly closer territory (Manhattan). Greedy: the adjacent
// neutral square that wins the most hives, ties broken by the distances to
// the hives still contested.

const W = 19
const H = 9
const MINE = 0
const THEIRS = 1
const NEUTRAL = 2
const HIVE = 4

const manhattanTo = (cells: number[], x: number, y: number) =>
  cells.reduce((m, c) => Math.min(m, Math.abs((c % W) - x) + Math.abs(Math.floor(c / W) - y)), 999)

while (true) {
  const type = new Int8Array(W * H)
  for (let i = 0; i < W * H; i++) {
    const [x, y, t] = readline().split(" ").map(Number)
    type[y * W + x] = t
  }
  const mine: number[] = []
  const theirs: number[] = []
  const hives: number[] = []
  for (let i = 0; i < W * H; i++) {
    if (type[i] === MINE) mine.push(i)
    else if (type[i] === THEIRS) theirs.push(i)
    else if (type[i] === HIVE) hives.push(i)
  }
  const theirDist = hives.map(h => manhattanTo(theirs, h % W, Math.floor(h / W)))
  const myDist = hives.map(h => manhattanTo(mine, h % W, Math.floor(h / W)))

  let best = -1
  let bestScore = -Infinity
  for (let i = 0; i < W * H; i++) {
    if (type[i] !== NEUTRAL) continue
    const x = i % W
    const y = Math.floor(i / W)
    const adjacent = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].some(([dx, dy]) => {
      const nx = x + dx
      const ny = y + dy
      return nx >= 0 && ny >= 0 && nx < W && ny < H && type[ny * W + nx] === MINE
    })
    if (!adjacent) continue
    let won = 0
    let closeness = 0
    hives.forEach((h, k) => {
      const d = Math.min(myDist[k], Math.abs((h % W) - x) + Math.abs(Math.floor(h / W) - y))
      if (d < theirDist[k]) won++
      if (d >= theirDist[k] - 1) closeness -= d // still contested: get closer
    })
    const score = won * 100 + closeness
    if (score > bestScore) {
      bestScore = score
      best = i
    }
  }
  console.log(best >= 0 ? `${best % W} ${Math.floor(best / W)}` : "1 1")
}
