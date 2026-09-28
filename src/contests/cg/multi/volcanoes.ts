// 🎮 CodinGame Multiplayer - volcanoes
// https://www.codingame.com/multiplayer/bot-programming/volcanoes
// Referee: https://github.com/skotz/codingame-volcanoes (Board.java)
//
// 80 tiles, 3 neighbours each. Turn cycle (6): P1, P2, growth, P2, P1,
// growth. A move places a level-1 volcano on an empty tile or raises one of
// ours (non-dormant) by 1. Level 4 erupts and becomes dormant (stays 4):
// neighbours get +1 (empty → level 1 of the erupter, own → +1, enemy →
// −4 which clears it); cascades are resolved in phases. A side wins when a
// chain of its volcanoes joins Nk and Sk.
// Bot: flat Monte Carlo — UCB1 over our legal moves, random playouts of the
// exact rules (cycle, growth, eruptions) until a chain wins.

const count = parseInt(readline())
const names: string[] = []
const adj: number[][] = []
for (let i = 0; i < count; i++) {
  const p = readline().trim().split(" ")
  names.push(p[0])
  adj.push(p.slice(1, 4).map(Number))
}
const index = new Map(names.map((n, i) => [n, i]))
const antipode = names.map(n => index.get((n[0] === "N" ? "S" : "N") + n.slice(1)) ?? -1)

// Apply eruptions (queue of indexes), exactly as the referee does.
function erupt(t: Int8Array, queue: number[]) {
  const dormant = (i: number) => Math.abs(t[i]) >= 4
  const done = new Uint8Array(count)
  for (let phase = 0; phase < 100 && queue.length; phase++) {
    const delta = new Int8Array(count)
    const touched: number[] = []
    for (const i of queue) {
      if (done[i]) continue
      done[i] = 1 // becomes dormant (level stays ±4)
      const sign = t[i] > 0 ? 1 : -1
      for (const a of adj[i]) {
        touched.push(a)
        if (t[a] === 0) delta[a] += sign
        else if (Math.sign(t[a]) === sign) delta[a] += sign
        else delta[a] -= 4 * Math.sign(t[a])
      }
    }
    queue = []
    for (const a of touched) {
      if (delta[a] === 0) continue
      const was = Math.sign(t[a])
      let v = t[a] + delta[a]
      delta[a] = 0
      if (was !== 0 && Math.sign(v) !== was) v = 0 // enemy volcano destroyed
      if (Math.abs(v) >= 4) {
        v = Math.sign(v) * 4
        if (!done[a] && !dormant(a)) queue.push(a)
      } else if (done[a]) done[a] = 0
      t[a] = v
    }
  }
}
function play(t: Int8Array, i: number, side: number) {
  t[i] += side
  if (Math.abs(t[i]) >= 4) {
    t[i] = side * 4
    erupt(t, [i])
  }
}
function grow(t: Int8Array) {
  const q: number[] = []
  for (let i = 0; i < count; i++) {
    if (t[i] === 0 || Math.abs(t[i]) >= 4) continue
    t[i] += Math.sign(t[i])
    if (Math.abs(t[i]) >= 4) q.push(i)
  }
  if (q.length) erupt(t, q)
}
// 1 / −1 for a chain of that sign, 0 none (both at once counts as 0).
const comp = new Int32Array(80)
function winner(t: Int8Array): number {
  comp.fill(-1)
  let c = 0
  const stack: number[] = []
  for (let i = 0; i < count; i++) {
    if (t[i] === 0 || comp[i] >= 0) continue
    comp[i] = c
    stack.push(i)
    while (stack.length) {
      const x = stack.pop()!
      for (const a of adj[x]) if (comp[a] < 0 && Math.sign(t[a]) === Math.sign(t[i])) (comp[a] = c), stack.push(a)
    }
    c++
  }
  let w = 0
  for (let i = 0; i < count; i++) {
    const j = antipode[i]
    if (j < 0 || t[i] === 0 || comp[i] !== comp[j]) continue
    const s = Math.sign(t[i])
    if (w !== 0 && w !== s) return 0
    w = s
  }
  return w
}
// Mover at cycle index k (mod 6): 0,4 → P1; 1,3 → P2; 2,5 → growth.
const moverAt = (k: number) => [1, 2, 0, 2, 1, 0][k % 6]

let myTurns = 0
let iAmFirst = true
const empty: number[] = []
while (true) {
  const pos = readline().trim().split(" ").map(Number)
  const validNames = readline().trim().split(" ")
  if (myTurns === 0) iAmFirst = pos.every(v => v === 0)
  const k = myTurns
  const idx = iAmFirst ? (k % 2 === 0 ? 6 * (k / 2) : 6 * ((k - 1) / 2) + 4) : k % 2 === 0 ? 6 * (k / 2) + 1 : 6 * ((k - 1) / 2) + 3
  myTurns++
  const base = Int8Array.from(pos)
  const moves = validNames.map(n => index.get(n)!).filter(v => v !== undefined)
  const wins = new Float64Array(moves.length)
  const visits = new Float64Array(moves.length)
  const deadline = Date.now() + (k === 0 ? 400 : 80)
  let total = 0
  let decided = -1
  // Immediate wins first.
  moves.forEach((m, i) => {
    const t = base.slice()
    play(t, m, 1)
    if (winner(t) === 1) decided = i
  })
  while (decided < 0 && Date.now() < deadline) {
    for (let rep = 0; rep < 16; rep++) {
      // UCB1.
      let pick = 0
      let bestU = -Infinity
      for (let i = 0; i < moves.length; i++) {
        const u = visits[i] === 0 ? 1e9 : wins[i] / visits[i] + 0.7 * Math.sqrt(Math.log(total + 1) / visits[i])
        if (u > bestU) {
          bestU = u
          pick = i
        }
      }
      const t = base.slice()
      play(t, moves[pick], 1)
      let result = winner(t)
      for (let step = idx + 1; result === 0 && step < idx + 160; step++) {
        const who = moverAt(step)
        if (who === 0) grow(t)
        else {
          const side = who === (iAmFirst ? 1 : 2) ? 1 : -1
          empty.length = 0
          for (let i = 0; i < count; i++)
            if (t[i] === 0 || (Math.sign(t[i]) === side && Math.abs(t[i]) < 4)) empty.push(i)
          if (!empty.length) continue
          play(t, empty[Math.floor(Math.random() * empty.length)], side)
        }
        result = winner(t)
      }
      wins[pick] += result === 1 ? 1 : result === 0 ? 0.5 : 0
      visits[pick]++
      total++
    }
  }
  let best = decided >= 0 ? decided : 0
  if (decided < 0) for (let i = 0; i < moves.length; i++) if (visits[i] > visits[best]) best = i
  console.log(moves.length ? names[moves[best]] : "RANDOM")
}
