// 🎮 CodinGame Multiplayer - platinum-rift-episode-2
// https://www.codingame.com/multiplayer/bot-programming/platinum-rift-episode-2
//
// 2 players on a zone graph under fog; taking the enemy base wins (else most
// zones after 250 turns). Pods cost 20 platinum and spawn at the base. Each
// group sends one pod to every unowned neighbour (platinum first, then the
// ones towards the enemy base) and walks the rest down the shortest path to
// the enemy base; a couple of pods stay home when enemies come close.

const [, myId, zoneCount, linkCount] = readline().split(" ").map(Number)
const platinumSource = new Int8Array(zoneCount)
for (let i = 0; i < zoneCount; i++) {
  const [z, p] = readline().split(" ").map(Number)
  platinumSource[z] = p
}
const adj: number[][] = Array.from({ length: zoneCount }, () => [])
for (let i = 0; i < linkCount; i++) {
  const [a, b] = readline().split(" ").map(Number)
  adj[a].push(b)
  adj[b].push(a)
}

function distancesFrom(start: number): Int32Array {
  const d = new Int32Array(zoneCount).fill(1 << 30)
  d[start] = 0
  const q = [start]
  for (let h = 0; h < q.length; h++)
    for (const n of adj[q[h]])
      if (d[n] > d[q[h]] + 1) {
        d[n] = d[q[h]] + 1
        q.push(n)
      }
  return d
}

let myBase = -1
let enemyBase = -1
let toEnemy: Int32Array | null = null

while (true) {
  readline() // platinum
  const owner = new Int8Array(zoneCount)
  const mine = new Int32Array(zoneCount)
  const theirs = new Int32Array(zoneCount)
  for (let i = 0; i < zoneCount; i++) {
    const [z, o, p0, p1] = readline().split(" ").map(Number)
    owner[z] = o
    mine[z] = myId === 0 ? p0 : p1
    theirs[z] = myId === 0 ? p1 : p0
  }
  if (myBase < 0) {
    for (let z = 0; z < zoneCount; z++) {
      if (owner[z] === myId && mine[z] > 0) myBase = z
      if (owner[z] === 1 - myId) enemyBase = z
    }
    if (enemyBase >= 0) toEnemy = distancesFrom(enemyBase)
  }
  const dist = toEnemy ?? new Int32Array(zoneCount)
  const moves: string[] = []
  const claimed = new Set<number>() // neighbours already targeted this turn
  for (let z = 0; z < zoneCount; z++) {
    let pods = mine[z]
    if (pods === 0) continue
    // Defend home when enemies are adjacent to it.
    if (z === myBase && adj[z].some(n => theirs[n] > 0)) pods = Math.max(0, pods - 2)
    const inFight = theirs[z] > 0
    const targets = adj[z]
      .filter(n => owner[n] !== myId && !claimed.has(n) && !(inFight && owner[n] === 1 - myId))
      .sort((a, b) => platinumSource[b] - platinumSource[a] || dist[a] - dist[b])
    for (const n of targets) {
      if (pods <= 1) break
      moves.push(`1 ${z} ${n}`)
      claimed.add(n)
      pods--
    }
    if (pods > 0) {
      // Everyone else heads for the enemy base.
      const step = adj[z].filter(n => !(inFight && owner[n] === 1 - myId)).sort((a, b) => dist[a] - dist[b])[0]
      if (step !== undefined && dist[step] < dist[z]) moves.push(`${pods} ${z} ${step}`)
      else if (targets.length && pods > 0) moves.push(`${pods} ${z} ${targets[0]}`)
    }
  }
  console.log(moves.length ? moves.join(" ") : "WAIT")
  console.log("WAIT")
}
