// 🎮 CodinGame Multiplayer - platinum-rift-episode-1
// https://www.codingame.com/multiplayer/bot-programming/platinum-rift-episode-1
//
// 2-4 players on a zone graph, most zones wins. Pods cost 20 and can be
// bought onto neutral (or own) zones. Buy onto the richest neutral zones
// first (then our zones next to enemies); each pod group sends one pod to
// every unowned neighbour (platinum first) and the rest towards the nearest
// unowned zone.

const [playerCount, myId, zoneCount, linkCount] = readline().split(" ").map(Number)
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

while (true) {
  const platinum = parseInt(readline())
  const owner = new Int8Array(zoneCount)
  const pods: number[][] = []
  for (let i = 0; i < zoneCount; i++) {
    const v = readline().split(" ").map(Number)
    owner[v[0]] = v[1]
    pods[v[0]] = v.slice(2, 2 + 4)
  }
  const mine = (z: number) => pods[z][myId]
  const enemies = (z: number) => pods[z].reduce((s, n, p) => (p === myId ? s : s + n), 0)

  // Distance (in zones) to the nearest zone we do not own, for every zone.
  const toUnowned = new Int32Array(zoneCount).fill(1 << 20)
  const q: number[] = []
  for (let z = 0; z < zoneCount; z++)
    if (owner[z] !== myId) {
      toUnowned[z] = 0
      q.push(z)
    }
  for (let h = 0; h < q.length; h++)
    for (const n of adj[q[h]])
      if (toUnowned[n] > toUnowned[q[h]] + 1) {
        toUnowned[n] = toUnowned[q[h]] + 1
        q.push(n)
      }

  const moves: string[] = []
  const claimed = new Set<number>()
  for (let z = 0; z < zoneCount; z++) {
    let n = mine(z)
    if (n === 0) continue
    const targets = adj[z]
      .filter(t => owner[t] !== myId && !claimed.has(t) && enemies(t) < n)
      .sort((a, b) => platinumSource[b] - platinumSource[a])
    for (const t of targets) {
      if (n <= 0) break
      moves.push(`1 ${z} ${t}`)
      claimed.add(t)
      n--
    }
    if (n > 0 && enemies(z) === 0) {
      const step = adj[z].slice().sort((a, b) => toUnowned[a] - toUnowned[b])[0]
      if (step !== undefined && toUnowned[step] < toUnowned[z]) moves.push(`${n} ${z} ${step}`)
    }
  }

  const buys: string[] = []
  let budget = Math.floor(platinum / 20)
  const neutral = [...Array(zoneCount).keys()]
    .filter(z => owner[z] === -1 && enemies(z) === 0 && !claimed.has(z))
    .sort((a, b) => platinumSource[b] - platinumSource[a])
  for (const z of neutral) {
    if (budget <= 0 || platinumSource[z] === 0) break
    buys.push(`1 ${z}`)
    budget--
  }
  // Remaining pods: reinforce our zones that touch enemies.
  const frontier = [...Array(zoneCount).keys()].filter(z => owner[z] === myId && adj[z].some(t => enemies(t) > 0))
  for (let k = 0; budget > 0 && frontier.length; k++, budget--) buys.push(`1 ${frontier[k % frontier.length]}`)
  if (budget > 0) {
    const anyNeutral = [...Array(zoneCount).keys()].find(z => owner[z] === -1 && enemies(z) === 0)
    if (anyNeutral !== undefined) buys.push(`${budget} ${anyNeutral}`)
  }
  void playerCount
  console.log(moves.length ? moves.join(" ") : "WAIT")
  console.log(buys.length ? buys.join(" ") : "WAIT")
}
