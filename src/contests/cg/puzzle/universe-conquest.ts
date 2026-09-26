// 🎮 CodinGame Puzzle - universe-conquest
// https://www.codingame.com/training/hard/universe-conquest

// Only E-R roads matter, and they form a bipartite graph: the answer is a
// minimum weight vertex cover, i.e. a min cut (source -> E -> R -> sink).

const [P, H] = readline().split(" ").map(Number)
const faction: string[] = []
const ships: number[] = []
for (let i = 0; i < P; i++) {
  const [f, s] = readline().split(" ")
  faction.push(f)
  ships.push(Number(s))
}

const N = P + 2
const SRC = P
const SNK = P + 1
const cap: number[][] = Array.from({ length: N }, () => new Array(N).fill(0))
const INF = 1e9
for (let i = 0; i < P; i++) {
  if (faction[i] === "E") cap[SRC][i] = ships[i]
  else cap[i][SNK] = ships[i]
}
for (let i = 0; i < H; i++) {
  const [a, b] = readline()
    .split(" ")
    .map(x => Number(x) - 1)
  if (faction[a] === faction[b]) continue
  const [e, r] = faction[a] === "E" ? [a, b] : [b, a]
  cap[e][r] = INF
}

// Edmonds-Karp
let flow = 0
while (true) {
  const prev = new Array(N).fill(-1)
  prev[SRC] = SRC
  const queue = [SRC]
  for (let qi = 0; qi < queue.length && prev[SNK] < 0; qi++) {
    const u = queue[qi]
    for (let v = 0; v < N; v++) {
      if (prev[v] < 0 && cap[u][v] > 0) {
        prev[v] = u
        queue.push(v)
      }
    }
  }
  if (prev[SNK] < 0) break
  let aug = INF
  for (let v = SNK; v !== SRC; v = prev[v]) aug = Math.min(aug, cap[prev[v]][v])
  for (let v = SNK; v !== SRC; v = prev[v]) {
    cap[prev[v]][v] -= aug
    cap[v][prev[v]] += aug
  }
  flow += aug
}
console.log(flow)
