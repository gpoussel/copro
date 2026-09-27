// 🎮 CodinGame Multiplayer - summer-challenge-2024-olymbits
// https://www.codingame.com/multiplayer/bot-programming/summer-challenge-2024-olymbits
//
// Three players share one controller over four mini-games; one action
// (UP / DOWN / LEFT / RIGHT) drives all of them. Final score = product over
// games of (3·gold + silver), so a weak game weighs most.
// Per game, each action gets a value in about [−1, 1]:
// - hurdles (0): backwards DP of turns to the finish (a hit stuns 3 turns);
// - archery (1): DP over the known winds of the best final distance to 0,0;
// - roller (2): cells gained, minus a stun (risk ≥ 5) when it would trigger;
// - diving (3): matching the objective keeps the combo.
// Weights: 1 / (our score in that game + 1); nothing for a game in reset.
// In league 2 all four consoles run hurdles; the GPU tells the games apart.

const me = parseInt(readline())
const nbGames = parseInt(readline())
const ACTIONS = ["UP", "DOWN", "LEFT", "RIGHT"]

// Hurdles.
const MOVES: Record<string, [number, boolean]> = { RIGHT: [3, false], DOWN: [2, false], UP: [2, true], LEFT: [1, false] }
function step(track: string, pos: number, dist: number, jump: boolean): [number, boolean] {
  for (let k = 1; k <= dist; k++) {
    const p = pos + k
    if (p >= track.length - 1) return [track.length - 1, false]
    if (track[p] === "#" && !(jump && k === 1)) return [p, true]
  }
  return [pos + dist, false]
}
function hurdleValues(track: string, pos: number): number[] {
  const L = track.length
  const cost = new Array(L).fill(0)
  for (let p = L - 2; p >= 0; p--) {
    let best = Infinity
    for (const a of ACTIONS) {
      const [q, hit] = step(track, p, ...MOVES[a])
      best = Math.min(best, 1 + (hit ? 3 : 0) + cost[q])
    }
    cost[p] = best
  }
  const c = ACTIONS.map(a => {
    const [q, hit] = step(track, pos, ...MOVES[a])
    return 1 + (hit ? 3 : 0) + cost[q]
  })
  const min = Math.min(...c)
  return c.map(v => Math.max(-1, 1 - (v - min) * 0.5))
}

// Archery: winds known in advance; DP of the best final distance.
const ARCH: Record<string, [number, number]> = { UP: [0, -1], DOWN: [0, 1], LEFT: [-1, 0], RIGHT: [1, 0] }
function archeryValues(winds: string, x: number, y: number): number[] {
  const clamp = (v: number) => Math.max(-20, Math.min(20, v))
  const T = winds.length
  // best[(x, y)] = best final squared distance from the current turn on.
  const key = (a: number, b: number) => (a + 20) * 41 + (b + 20)
  let best = new Float64Array(41 * 41)
  for (let a = -20; a <= 20; a++) for (let b = -20; b <= 20; b++) best[key(a, b)] = a * a + b * b
  for (let t = T - 1; t >= 1; t--) {
    const w = +winds[t]
    const next = new Float64Array(41 * 41)
    for (let a = -20; a <= 20; a++)
      for (let b = -20; b <= 20; b++) {
        let v = Infinity
        for (const d of ACTIONS) {
          const [dx, dy] = ARCH[d]
          v = Math.min(v, best[key(clamp(a + dx * w), clamp(b + dy * w))])
        }
        next[key(a, b)] = v
      }
    best = next
  }
  const w0 = +winds[0]
  const vals = ACTIONS.map(d => {
    const [dx, dy] = ARCH[d]
    return Math.sqrt(best[key(clamp(x + dx * w0), clamp(y + dy * w0))])
  })
  const min = Math.min(...vals)
  return vals.map(v => Math.max(-1, 1 - (v - min) / 4))
}

// Roller: GPU = risk order (index 0..3 = 1, 2, 2, 3 cells; risk −1, 0, +1, +2).
function rollerValues(order: string, regs: number[]): number[] {
  const risk = regs[3 + me]
  if (risk < 0) return [0, 0, 0, 0]
  const pos = regs[me]
  const others = [0, 1, 2].filter(i => i !== me).map(i => regs[i] % 10)
  const cells = [1, 2, 2, 3]
  const delta = [-1, 0, 1, 2]
  return ACTIONS.map(a => {
    const i = order.indexOf(a[0])
    let r = Math.max(0, risk + delta[i])
    if (others.includes((pos + cells[i]) % 10)) r += 2
    return r >= 5 ? -1 : (cells[i] - 1) / 2 - (r >= 4 ? 0.3 : 0)
  })
}

// Diving: the objective index is tracked (reset when the GPU changes).
let divingGpu = ""
let divingTurn = 0
function divingValues(goal: string, regs: number[]): number[] {
  if (goal !== divingGpu) {
    divingGpu = goal
    divingTurn = 0
  }
  const target = goal[divingTurn] ?? ""
  divingTurn++
  const combo = regs[3 + me]
  return ACTIONS.map(a => (a[0] === target ? 1 : -Math.min(1, combo / 5)))
}

while (true) {
  const scoreLines: number[][] = []
  for (let i = 0; i < 3; i++) scoreLines.push(readline().trim().split(" ").map(Number))
  const mine = scoreLines[me]
  const total = [0, 0, 0, 0]
  for (let g = 0; g < nbGames; g++) {
    const parts = readline().trim().split(" ")
    const gpu = parts[0]
    const regs = parts.slice(1).map(Number)
    if (gpu === "GAME_OVER") {
      if (g === 3) divingGpu = ""
      continue
    }
    const medals = mine.length >= 13 ? mine[1 + g * 3] * 3 + mine[2 + g * 3] : 0
    const weight = 1 / (medals + 1)
    let vals: number[]
    if (/^[.#]+$/.test(gpu)) {
      if (regs[3 + me] > 0) continue // stunned
      vals = hurdleValues(gpu, regs[me])
    } else if (/^\d+$/.test(gpu)) vals = archeryValues(gpu, regs[2 * me], regs[2 * me + 1])
    else if (gpu.length === 4 && g === 2) vals = rollerValues(gpu, regs)
    else vals = divingValues(gpu, regs)
    vals.forEach((v, i) => (total[i] += weight * v))
  }
  let best = 0
  for (let i = 1; i < 4; i++) if (total[i] > total[best]) best = i
  console.log(ACTIONS[best])
}
