// 🎮 CodinGame Multiplayer - ghost-in-the-cell
// https://www.codingame.com/multiplayer/bot-programming/ghost-in-the-cell
//
// Factories (7-15) with production 0-3, troops travel `distance` turns.
// Wood 3 allows one command per turn (MULTI = false); later leagues allow
// several (";"), BOMB and INC (+1 production for 10 cyborgs).
// Per turn: each own factory keeps what the enemy troops heading to it
// require; spare cyborgs go to the best target by production / (distance +
// cost / 4), sending just enough (defenders, plus the enemy's production
// until arrival, plus enemy troops heading there, minus ours) + 1.

const MULTI = true
const INC = true
const n = parseInt(readline())
const links = parseInt(readline())
const dist: number[][] = Array.from({ length: n }, () => new Array(n).fill(99))
for (let i = 0; i < links; i++) {
  const [a, b, d] = readline().split(" ").map(Number)
  dist[a][b] = d
  dist[b][a] = d
}

const bombSeen = new Map<number, number>() // enemy bomb id -> turn first seen
let bombsLeft = 2
let turn = 0

while (true) {
  turn++
  const count = parseInt(readline())
  const enemyBombs: { id: number; src: number }[] = []
  const myBombTargets = new Set<number>()
  const owner = new Array(n).fill(0)
  const cyborgs = new Array(n).fill(0)
  const prod = new Array(n).fill(0)
  const disabled = new Array(n).fill(0)
  const arrivals: { to: number; turn: number; owner: number; count: number }[] = []
  const incomingEnemy = new Array(n).fill(0)
  const incomingMine = new Array(n).fill(0)
  for (let i = 0; i < count; i++) {
    const p = readline().trim().split(" ")
    const a = p.slice(2).map(Number)
    if (p[1] === "FACTORY") {
      const id = +p[0]
      owner[id] = a[0]
      cyborgs[id] = a[1]
      prod[id] = a[2]
      disabled[id] = a[3]
    } else if (p[1] === "TROOP") {
      arrivals.push({ to: a[2], turn: a[4], owner: a[0], count: a[3] })
      if (a[0] === 1) incomingMine[a[2]] += a[3]
      else incomingEnemy[a[2]] += a[3]
    } else if (p[1] === "BOMB") {
      if (a[0] === 1) myBombTargets.add(a[2])
      else {
        const id = +p[0]
        if (!bombSeen.has(id)) bombSeen.set(id, turn)
        enemyBombs.push({ id, src: a[1] })
      }
    }
  }
  const actions: string[] = []
  // Enemy bombs (target unknown): evacuate every own factory it could hit
  // next turn, to the nearest other factory.
  const evacuate = new Set<number>()
  for (const b of enemyBombs)
    for (let f = 0; f < n; f++)
      if (owner[f] === 1 && dist[b.src][f] - (turn - bombSeen.get(b.id)!) <= 1) evacuate.add(f)
  for (const f of evacuate) {
    if (cyborgs[f] === 0) continue
    let to = -1
    for (let t = 0; t < n; t++) if (t !== f && !evacuate.has(t) && (to < 0 || dist[f][t] < dist[f][to])) to = t
    if (to >= 0) {
      actions.push(`MOVE ${f} ${to} ${cyborgs[f]}`)
      if (owner[to] === 1) incomingMine[to] += cyborgs[f]
    }
    cyborgs[f] = 0
  }
  // Our bombs: the enemy's best factory (its start first), one at a time.
  if (MULTI && bombsLeft > 0 && myBombTargets.size === 0 && (turn === 1 || turn > 30)) {
    let target = -1
    for (let t = 0; t < n; t++)
      if (owner[t] === -1 && (target < 0 || prod[t] * 10 + cyborgs[t] > prod[target] * 10 + cyborgs[target])) target = t
    let from = -1
    for (let f = 0; f < n; f++)
      if (owner[f] === 1 && target >= 0 && (from < 0 || dist[f][target] < dist[from][target])) from = f
    if (target >= 0 && from >= 0 && (turn === 1 || prod[target] >= 2)) {
      actions.push(`BOMB ${from} ${target}`)
      bombsLeft--
    }
  }
  // Timeline of a factory over `horizon` turns (referee order: produce,
  // then arrivals fight each other, then the survivors fight the garrison).
  // Returns the owner / cyborgs after each turn (index 0 = now).
  const timeline = (f: number, horizon: number, extra?: { turn: number; count: number }) => {
    let own = owner[f]
    let cyb = cyborgs[f]
    const owners = [own]
    const counts = [cyb]
    for (let t = 1; t <= horizon; t++) {
      if (own !== 0 && disabled[f] < t) cyb += prod[f]
      let mine = 0
      let theirs = 0
      for (const a of arrivals)
        if (a.to === f && a.turn === t) {
          if (a.owner === 1) mine += a.count
          else theirs += a.count
        }
      if (extra && extra.turn === t) mine += extra.count
      const diff = mine - theirs
      if (diff !== 0) {
        const side = diff > 0 ? 1 : -1
        if (own === side) cyb += Math.abs(diff)
        else {
          cyb -= Math.abs(diff)
          if (cyb < 0) {
            own = side
            cyb = -cyb
          }
        }
      }
      owners.push(own)
      counts.push(cyb)
    }
    return { owners, counts }
  }
  const HORIZON = 20
  // Own factories: what can leave now without losing it (min garrison over
  // the horizon), or how many it lacks and by when.
  const spare = new Array(n).fill(0)
  const lack = new Array(n).fill(0)
  const fallsAt = new Array(n).fill(0)
  for (let f = 0; f < n; f++) {
    if (owner[f] !== 1) continue
    const { owners, counts } = timeline(f, HORIZON)
    const t = owners.findIndex(o => o !== 1)
    if (t >= 0) {
      fallsAt[f] = t
      lack[f] = counts[t] + 1
    } else spare[f] = Math.max(0, Math.min(cyborgs[f], ...counts))
  }
  const sent = new Array(n).fill(0)
  // Candidate moves, best first.
  const options: { from: number; to: number; need: number; score: number }[] = []
  for (let f = 0; f < n; f++) {
    if (owner[f] !== 1 || spare[f] <= 0) continue
    for (let t = 0; t < n; t++) {
      if (t === f) continue
      const d = dist[f][t]
      let need: number
      if (owner[t] === 1) {
        // Reinforce a factory about to fall, in time.
        if (!lack[t] || d > fallsAt[t]) continue
        need = lack[t]
      } else {
        const { owners, counts } = timeline(t, d)
        if (owners[d] === 1) continue
        need = counts[d] + 1
      }
      const value = owner[t] === 1 ? prod[t] + 2 : prod[t] + (owner[t] === -1 ? 0.5 : 0)
      if (value <= 0) continue
      options.push({ from: f, to: t, need, score: value / (d + need / 4) })
    }
  }
  options.sort((a, b) => b.score - a.score)
  const served = new Set<number>()
  for (const o of options) {
    const avail = spare[o.from] - sent[o.from]
    if (avail < o.need) continue
    if (served.has(o.to)) continue
    actions.push(`MOVE ${o.from} ${o.to} ${o.need}`)
    sent[o.from] += o.need
    served.add(o.to)
    if (!MULTI) break
  }
  // Later leagues: upgrade a quiet factory with spare cyborgs.
  // While an enemy bomb flies, our two most productive factories are its
  // likely targets: do not upgrade those.
  const likelyBombed = new Set(
    enemyBombs.length
      ? [...Array(n).keys()]
          .filter(f => owner[f] === 1)
          .sort((a, b) => prod[b] - prod[a])
          .slice(0, 2)
      : []
  )
  if (INC && MULTI)
    for (let f = 0; f < n; f++)
      if (
        owner[f] === 1 &&
        prod[f] < 3 &&
        spare[f] - sent[f] >= 10 &&
        incomingEnemy[f] === 0 &&
        !evacuate.has(f) &&
        !likelyBombed.has(f)
      ) {
        actions.push(`INC ${f}`)
        sent[f] += 10
      }
  console.log(actions.length ? actions.join(";") : "WAIT")
}
