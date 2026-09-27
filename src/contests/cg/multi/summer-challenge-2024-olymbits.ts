// 🎮 CodinGame Multiplayer - summer-challenge-2024-olymbits
// https://www.codingame.com/multiplayer/bot-programming/summer-challenge-2024-olymbits
//
// Three players share one controller over several mini-games (league 1: a
// single hurdle race). Hurdles: LEFT 1, DOWN 2, RIGHT 3 cells, UP jumps 2
// cells over the next one; running into a hurdle stuns for 3 turns.
// League 2: four hurdle races at once, one action for all of them.
// Bot: per race, backwards DP of the minimum turns to the finish (a hurdle
// hit costs the stun); play the action with the smallest weighted total.

const me = parseInt(readline())
const nbGames = parseInt(readline())

const MOVES: [string, number, boolean][] = [
  ["RIGHT", 3, false],
  ["DOWN", 2, false],
  ["UP", 2, true],
  ["LEFT", 1, false],
]

// Where a move ends and whether it hits a hurdle (the runner stops on it).
function step(track: string, pos: number, dist: number, jump: boolean): [number, boolean] {
  for (let k = 1; k <= dist; k++) {
    const p = pos + k
    if (p >= track.length - 1) return [track.length - 1, false]
    if (track[p] === "#" && !(jump && k === 1)) return [p, true]
  }
  return [pos + dist, false]
}

// Minimum turns from each position to the end (stun = 3 lost turns).
function hurdleCosts(track: string): number[] {
  const L = track.length
  const cost = new Array(L).fill(0)
  for (let p = L - 2; p >= 0; p--) {
    let best = Infinity
    for (const [, d, j] of MOVES) {
      const [q, hit] = step(track, p, d, j)
      best = Math.min(best, 1 + (hit ? 3 : 0) + cost[q])
    }
    cost[p] = best
  }
  return cost
}

// One action drives every console: pick the move with the smallest total
// remaining time over the races we can still influence (not stunned).
while (true) {
  for (let i = 0; i < 3; i++) readline() // scores
  const total = new Map<string, number>(MOVES.map(([name]) => [name, 0]))
  for (let g = 0; g < nbGames; g++) {
    const parts = readline().trim().split(" ")
    const gpu = parts[0]
    const regs = parts.slice(1).map(Number)
    if (gpu === "GAME_OVER" || regs[3 + me] > 0) continue
    const cost = hurdleCosts(gpu)
    const pos = regs[me]
    // Races we lead or can still win weigh more than lost ones.
    const rivals = [0, 1, 2].filter(i => i !== me).map(i => regs[i])
    const weight = rivals.every(r => r <= pos + 6) ? 1 : 0.3
    for (const [name, d, j] of MOVES) {
      const [q, hit] = step(gpu, pos, d, j)
      total.set(name, total.get(name)! + weight * (1 + (hit ? 3 : 0) + cost[q]))
    }
  }
  let answer = "RIGHT"
  for (const [name, t] of total) if (t < total.get(answer)!) answer = name
  console.log(answer)
}
