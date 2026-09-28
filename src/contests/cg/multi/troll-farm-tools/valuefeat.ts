// Features of a game state for the value model (seat p): what is banked, what is carried, what
// stands on our side (by size), the troll force and the stock. Kept small and cheap: the bot calls
// it at the end of every truncated plan simulation.
import { Game, GRASS, bfs, neighbors } from "./engine.js"

const dropCache = new WeakMap<Game, Int16Array[]>()

export function valueFeatures(g: Game, p: number): number[] {
  let dd = dropCache.get(g)
  if (!dd) {
    dd = [0, 1].map(q => bfs(g, neighbors(g, g.shack[q]).filter(c => g.grid[c] === GRASS)))
    dropCache.set(g, dd)
  }
  const inv = g.inv[p]
  const banked = inv[0] + inv[1] + inv[2] + inv[3] + 4 * inv[5]
  let carried = 0
  let n = 0,
    carry = 0,
    chop = 0,
    speed = 0,
    harvest = 0,
    prod = 0
  for (const u of g.trolls) {
    if (u.owner !== p) continue
    carried += 4 * u.inv[5] + u.inv[0] + u.inv[1] + u.inv[2] + u.inv[3]
    n++
    carry += u.carry
    chop += u.chop
    speed += u.speed
    harvest += u.harvest
    prod += Math.min(u.carry, 4) * Math.min(u.chop, 3) * u.speed
  }
  const size = [0, 0, 0, 0, 0]
  let near = 0,
    bananas = 0,
    fruits = 0
  for (const t of g.trees) {
    const a = dd[p][t.cell],
      b = dd[1 - p][t.cell]
    if (a < 0 || (b >= 0 && b <= a)) continue
    size[t.size]++
    if (a <= 2) near++
    if (t.type === 3) bananas++
    fruits += t.fruits
  }
  return [1, banked, carried, size[1], size[2], size[3], size[4], near, bananas, fruits, n, carry, chop, speed, harvest, prod, inv[0], inv[1], inv[2], inv[3], inv[4]]
}
