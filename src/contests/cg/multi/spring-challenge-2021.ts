// 🎮 CodinGame Multiplayer - spring-challenge-2021
// https://www.codingame.com/multiplayer/bot-programming/spring-challenge-2021
//
// Photosynthesis on 37 hex cells, 24 days; possible actions are listed.
// Heuristic (one action per turn, WAIT ends our day):
// 1. COMPLETE a size-3 tree (richest cell first) from day 19, or earlier
//    once we have ≥ 4 big trees from day 11;
// 2. GROW the biggest affordable tree (richest first), nothing that cannot
//    pay off before the end (no seed→1 after day 20, 1→2 after 21, 2→3
//    after 22);
// 3. SEED when it is free (no seed of ours) before day 19, on the richest
//    cell not next to one of our trees (self-shade);
// 4. WAIT.

const cells = parseInt(readline())
const richness: number[] = []
const neigh: number[][] = []
for (let i = 0; i < cells; i++) {
  const v = readline().split(" ").map(Number)
  richness[v[0]] = v[1]
  neigh[v[0]] = v.slice(2)
}

while (true) {
  const day = parseInt(readline())
  readline() // nutrients
  const [sun] = readline().split(" ").map(Number)
  readline() // opponent
  const nt = parseInt(readline())
  const trees = new Map<number, { size: number; mine: boolean; dormant: boolean }>()
  for (let i = 0; i < nt; i++) {
    const [c, size, mine, dormant] = readline().split(" ").map(Number)
    trees.set(c, { size, mine: mine === 1, dormant: dormant === 1 })
  }
  const na = parseInt(readline())
  const actions: string[] = []
  for (let i = 0; i < na; i++) actions.push(readline().trim())
  const mineOf = (size: number) => [...trees.values()].filter(t => t.mine && t.size === size).length
  const bigCount = mineOf(3)
  let choice = "WAIT"
  // 1. Complete.
  const completes = actions
    .filter(a => a.startsWith("COMPLETE"))
    .sort((a, b) => richness[+b.split(" ")[1]] - richness[+a.split(" ")[1]])
  if (completes.length && (day >= 19 || (bigCount >= 4 && day >= 11))) choice = completes[0]
  // 2. Grow.
  if (choice === "WAIT") {
    const grows = actions
      .filter(a => a.startsWith("GROW"))
      .map(a => ({ a, c: +a.split(" ")[1] }))
      .filter(({ c }) => {
        const s = trees.get(c)!.size
        return (s === 0 && day <= 20) || (s === 1 && day <= 21) || (s === 2 && day <= 22)
      })
      .sort((x, y) => trees.get(y.c)!.size - trees.get(x.c)!.size || richness[y.c] - richness[x.c])
    if (grows.length) choice = grows[0].a
  }
  // 3. Seed (free while we have no seed).
  if (choice === "WAIT" && mineOf(0) === 0 && day < 19) {
    const ours = new Set([...trees.entries()].filter(([, t]) => t.mine).map(([c]) => c))
    const seeds = actions
      .filter(a => a.startsWith("SEED"))
      .map(a => ({ a, c: +a.split(" ")[2] }))
      .filter(({ c }) => !neigh[c].some(n => ours.has(n)))
      .sort((x, y) => richness[y.c] - richness[x.c])
    if (seeds.length) choice = seeds[0].a
  }
  void sun
  console.log(choice)
}
