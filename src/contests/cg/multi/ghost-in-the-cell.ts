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

const MULTI = false
const INC = false
const n = parseInt(readline())
const links = parseInt(readline())
const dist: number[][] = Array.from({ length: n }, () => new Array(n).fill(99))
for (let i = 0; i < links; i++) {
  const [a, b, d] = readline().split(" ").map(Number)
  dist[a][b] = d
  dist[b][a] = d
}

while (true) {
  const count = parseInt(readline())
  const owner = new Array(n).fill(0)
  const cyborgs = new Array(n).fill(0)
  const prod = new Array(n).fill(0)
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
    } else if (p[1] === "TROOP") {
      if (a[0] === 1) incomingMine[a[2]] += a[3]
      else incomingEnemy[a[2]] += a[3]
    }
  }
  const actions: string[] = []
  const spare = new Array(n).fill(0)
  for (let f = 0; f < n; f++)
    if (owner[f] === 1) spare[f] = Math.max(0, cyborgs[f] - Math.max(0, incomingEnemy[f] - incomingMine[f] - prod[f]))
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
        // Reinforce a factory about to fall.
        need = incomingEnemy[t] - cyborgs[t] - incomingMine[t] - prod[t] * d + 1
        if (need <= 0) continue
      } else {
        need = cyborgs[t] + (owner[t] === -1 ? prod[t] * (d + 1) : 0) + incomingEnemy[t] - incomingMine[t] + 1
        if (need <= 0) continue
      }
      const value = owner[t] === 1 ? prod[t] + 2 : prod[t] + (owner[t] === -1 ? 0.5 : 0)
      if (value <= 0) continue
      options.push({ from: f, to: t, need, score: value / (d + need / 4) })
    }
  }
  options.sort((a, b) => b.score - a.score)
  for (const o of options) {
    const avail = spare[o.from] - sent[o.from]
    if (avail < o.need) continue
    actions.push(`MOVE ${o.from} ${o.to} ${o.need}`)
    sent[o.from] += o.need
    incomingMine[o.to] += o.need
    if (!MULTI) break
  }
  // Later leagues: upgrade a quiet factory with spare cyborgs.
  if (INC && MULTI)
    for (let f = 0; f < n; f++)
      if (owner[f] === 1 && prod[f] < 3 && spare[f] - sent[f] >= 10 && incomingEnemy[f] === 0) {
        actions.push(`INC ${f}`)
        sent[f] += 10
      }
  console.log(actions.length ? actions.join(";") : "WAIT")
}
