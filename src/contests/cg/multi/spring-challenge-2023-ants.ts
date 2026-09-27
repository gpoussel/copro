// 🎮 CodinGame Multiplayer - spring-challenge-2023-ants
// https://www.codingame.com/multiplayer/bot-programming/spring-challenge-2023-ants
//
// Hex cells with crystals (type 2) and eggs (type 1, later leagues); ants
// follow beacons, and a resource is harvested at the rate of the weakest
// cell of an unbroken chain of our ants from it to a base. Plan: LINE from
// our nearest base to the closest resources, adding targets while the ants
// can keep ~2 per chain cell (eggs weighted first while the game is young).

const n = parseInt(readline())
const type = new Int8Array(n)
const adj: number[][] = []
for (let i = 0; i < n; i++) {
  const v = readline().split(" ").map(Number)
  type[i] = v[0]
  adj.push(v.slice(2).filter(x => x >= 0))
}
const nb = parseInt(readline())
const myBases = readline().split(" ").map(Number).slice(0, nb)
readline() // opponent bases

// Distance from our bases, and the base each cell is closest to.
const dist = new Int32Array(n).fill(1 << 20)
const nearestBase = new Int32Array(n)
const q: number[] = []
for (const b of myBases) {
  dist[b] = 0
  nearestBase[b] = b
  q.push(b)
}
for (let h = 0; h < q.length; h++) {
  for (const m of adj[q[h]]) {
    if (dist[m] > dist[q[h]] + 1) {
      dist[m] = dist[q[h]] + 1
      nearestBase[m] = nearestBase[q[h]]
      q.push(m)
    }
  }
}

let turn = 0
while (true) {
  turn++
  const resources = new Int32Array(n)
  let myAnts = 0
  for (let i = 0; i < n; i++) {
    const [r, m] = readline().split(" ").map(Number)
    resources[i] = r
    myAnts += m
  }
  const targets = [...Array(n).keys()]
    .filter(i => resources[i] > 0 && type[i] > 0)
    .sort((a, b) => {
      const w = (i: number) => dist[i] - (type[i] === 1 && turn < 40 ? 2 : 0)
      return w(a) - w(b)
    })
  const actions: string[] = []
  let cells = 0
  for (const t of targets) {
    const cost = dist[t] + 1
    if (actions.length > 0 && (cells + cost) * 2 > myAnts) break
    actions.push(`LINE ${nearestBase[t]} ${t} 1`)
    cells += cost
  }
  console.log(actions.length ? actions.join(";") : "WAIT")
}
