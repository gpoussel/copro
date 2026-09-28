// 🎮 CodinGame Multiplayer - keep-off-the-grass-fall-challenge-2022
// https://www.codingame.com/multiplayer/bot-programming/keep-off-the-grass-fall-challenge-2022
// Referee: https://github.com/CodinGameCommunity/FallChallenge2022-KeepOffTheGrass
//
// Territory game on a scrap grid (0 scrap = grass, impassable). Per turn:
// - BUILD: a few economy recyclers early on the own cell whose range holds the
//   most scrap, plus blocking recyclers on own cells an enemy stack could
//   take next turn when we cannot hold them;
// - MOVE: every unit goes to the nearest cell we do not own (distinct
//   targets while there are enough of them), enemy stacks are matched;
// - SPAWN: the rest of the matter on own frontier cells closest to the enemy.

const [W, H] = readline().split(" ").map(Number)
const N = W * H
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]
const neighbours: number[][] = []
for (let c = 0; c < N; c++) {
  const x = c % W
  const y = Math.floor(c / W)
  neighbours.push(
    DIRS.filter(([dx, dy]) => x + dx >= 0 && y + dy >= 0 && x + dx < W && y + dy < H).map(
      ([dx, dy]) => (y + dy) * W + x + dx,
    ),
  )
}
let turn = 0

while (true) {
  turn++
  let [matter] = readline().split(" ").map(Number)
  const scrap = new Int32Array(N)
  const owner = new Int32Array(N)
  const units = new Int32Array(N)
  const recycler = new Uint8Array(N)
  const canBuild = new Uint8Array(N)
  const canSpawn = new Uint8Array(N)
  const inRange = new Uint8Array(N)
  for (let c = 0; c < N; c++) {
    const v = readline().split(" ").map(Number)
    ;[scrap[c], owner[c], units[c], recycler[c], canBuild[c], canSpawn[c], inRange[c]] = v
  }
  // Walkable: scrap left and no recycler (a cell in range with 1 scrap dies).
  const walkable = (c: number) => scrap[c] > 0 && !recycler[c] && !(inRange[c] && scrap[c] === 1)
  const bfsFrom = (sources: number[]) => {
    const d = new Int32Array(N).fill(-1)
    for (const s of sources) d[s] = 0
    const q = [...sources]
    for (let h = 0; h < q.length; h++)
      for (const m of neighbours[q[h]])
        if (d[m] < 0 && walkable(m)) {
          d[m] = d[q[h]] + 1
          q.push(m)
        }
    return d
  }
  const enemyCells: number[] = []
  for (let c = 0; c < N; c++) if (owner[c] === 0 && scrap[c] > 0) enemyCells.push(c)
  const distEnemy = bfsFrom(enemyCells)

  const actions: string[] = []
  const built = new Set<number>()
  let myRecyclers = 0
  for (let c = 0; c < N; c++) if (recycler[c] && owner[c] === 1) myRecyclers++

  // Defensive recyclers: an own cell next to an enemy stack bigger than ours.
  for (let c = 0; c < N && matter >= 10; c++) {
    if (!canBuild[c] || owner[c] !== 1) continue
    const threat = neighbours[c].reduce((s, m) => s + (owner[m] === 0 && !recycler[m] ? units[m] : 0), 0)
    if (threat > 0 && threat >= units[c] + 1 && distEnemy[c] === 1) {
      actions.push(`BUILD ${c % W} ${Math.floor(c / W)}`)
      built.add(c)
      matter -= 10
    }
  }
  // Economy recyclers during the opening.
  if (turn <= 12 && myRecyclers + built.size < 3 && matter >= 10) {
    let best = -1
    let bestGain = 0
    for (let c = 0; c < N; c++) {
      if (!canBuild[c] || built.has(c) || units[c]) continue
      if (neighbours[c].some(m => recycler[m])) continue
      let gain = scrap[c]
      for (const m of neighbours[c]) if (scrap[m] > 0 && !inRange[m]) gain += Math.min(scrap[m], scrap[c])
      if (gain > bestGain) {
        bestGain = gain
        best = c
      }
    }
    if (best >= 0 && bestGain >= 20) {
      actions.push(`BUILD ${best % W} ${Math.floor(best / W)}`)
      built.add(best)
      matter -= 10
    }
  }

  // Moves: distinct targets among the cells we do not own.
  const targets: number[] = []
  for (let c = 0; c < N; c++) if (owner[c] !== 1 && walkable(c) && !built.has(c)) targets.push(c)
  const claimed = new Map<number, number>()
  for (let c = 0; c < N; c++) {
    if (owner[c] !== 1 || units[c] === 0 || built.has(c)) continue
    const d = bfsFrom([c])
    for (let u = 0; u < units[c]; u++) {
      let best = -1
      let bestScore = Infinity
      for (const t of targets) {
        if (d[t] < 0) continue
        const score = d[t] * 10 + (claimed.get(t) ?? 0) * 25 + (owner[t] === 0 ? -5 : 0) + distEnemy[t]
        if (score < bestScore) {
          bestScore = score
          best = t
        }
      }
      if (best < 0) break
      claimed.set(best, (claimed.get(best) ?? 0) + 1)
      actions.push(`MOVE 1 ${c % W} ${Math.floor(c / W)} ${best % W} ${Math.floor(best / W)}`)
    }
  }

  // Spawns on the own cells closest to the enemy that touch unowned cells.
  const spawnCells: number[] = []
  for (let c = 0; c < N; c++)
    if (canSpawn[c] && !built.has(c) && neighbours[c].some(m => owner[m] !== 1 && walkable(m))) spawnCells.push(c)
  spawnCells.sort((a, b) => (distEnemy[a] < 0 ? 99 : distEnemy[a]) - (distEnemy[b] < 0 ? 99 : distEnemy[b]))
  for (let i = 0; matter >= 10 && spawnCells.length; i++) {
    const c = spawnCells[i % Math.min(spawnCells.length, 3)]
    actions.push(`SPAWN 1 ${c % W} ${Math.floor(c / W)}`)
    matter -= 10
  }
  console.log(actions.length ? actions.join(";") : "WAIT")
}
