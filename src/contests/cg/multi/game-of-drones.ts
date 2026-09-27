// 🎮 CodinGame Multiplayer - game-of-drones
// https://www.codingame.com/multiplayer/bot-programming/game-of-drones
//
// 2-4 players, D drones each, Z zones (radius 100); a zone is taken by being
// alone in it or by outnumbering its owner there; 1 point per zone per turn.
// Greedy allocation: each zone needs (strongest nearby enemy group + 1)
// drones; zones are served cheapest first (need × distance) with the nearest
// free drones; leftovers reinforce the most contested zone.

const [P, ID, D, Z] = readline().split(" ").map(Number)
const zones: [number, number][] = []
for (let i = 0; i < Z; i++) zones.push(readline().split(" ").map(Number) as [number, number])
const NEAR = 600

while (true) {
  const owner: number[] = []
  for (let i = 0; i < Z; i++) owner.push(parseInt(readline()))
  const drones: [number, number][][] = []
  for (let p = 0; p < P; p++) {
    const list: [number, number][] = []
    for (let d = 0; d < D; d++) list.push(readline().split(" ").map(Number) as [number, number])
    drones.push(list)
  }
  const mine = drones[ID]
  const dist = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1])
  // Strongest enemy group near each zone.
  const threat = zones.map(z => {
    let worst = 0
    for (let p = 0; p < P; p++) {
      if (p === ID) continue
      worst = Math.max(worst, drones[p].filter(d => dist(d, z) < NEAR).length)
    }
    return worst
  })
  const need = zones.map((_, i) => (owner[i] === ID && threat[i] === 0 ? 1 : threat[i] + 1))
  const targets: ([number, number] | null)[] = new Array(D).fill(null)
  const free = new Set(mine.map((_, i) => i))
  const order = zones
    .map((z, i) => {
      const nearest = mine.map(d => dist(d, z)).sort((a, b) => a - b)
      const cost = nearest.slice(0, need[i]).reduce((s, x) => s + x, 0) + need[i] * 200
      return { i, cost }
    })
    .sort((a, b) => a.cost - b.cost)
  for (const { i } of order) {
    if (free.size < need[i]) continue
    const chosen = [...free].sort((a, b) => dist(mine[a], zones[i]) - dist(mine[b], zones[i])).slice(0, need[i])
    for (const d of chosen) {
      targets[d] = zones[i]
      free.delete(d)
    }
  }
  // Leftovers: the zone with the highest threat we do not own.
  const contested = zones
    .map((z, i) => ({ z, v: threat[i] - (owner[i] === ID ? 0.5 : 0) }))
    .sort((a, b) => b.v - a.v)[0].z
  for (const d of free) targets[d] = contested
  console.log(targets.map((t, d) => (t ? `${t[0]} ${t[1]}` : `${mine[d][0]} ${mine[d][1]}`)).join("\n"))
}
