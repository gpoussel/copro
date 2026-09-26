// 🎮 CodinGame Puzzle - basic-decision-tree---2
// https://www.codingame.com/training/hard/basic-decision-tree---2

// For every FM-subset of features (in lexicographic order), greedily build the
// decision tree: split a node on the (feature, pupa value) threshold that gives
// the lowest weighted entropy (value < threshold goes left), as long as it
// strictly lowers the node entropy. Keep the subset with the lowest leaf entropy.

const pn = parseInt(readline())
const fn = parseInt(readline())
const fm = parseInt(readline())
const species: number[] = []
const features: number[][] = []
for (let i = 0; i < pn; i++) {
  const row = readline().trim().split(/\s+/).map(Number)
  species.push(row[1])
  features.push(row.slice(2))
}

const EPS = 1e-9

const entropy = (group: number[]): number => {
  const counts = new Map<number, number>()
  for (const p of group) counts.set(species[p], (counts.get(species[p]) ?? 0) + 1)
  let h = 0
  for (const c of counts.values()) {
    const q = c / group.length
    h -= q * Math.log2(q)
  }
  return h
}

// Total weighted leaf entropy (times group size) after greedy splitting
const build = (group: number[], feats: number[]): number => {
  const current = entropy(group)
  let best = current * group.length
  let bestSplit: [number[], number[]] | null = null
  for (const f of feats) {
    for (const p of group) {
      const threshold = features[p][f]
      const left = group.filter(q => features[q][f] < threshold)
      if (left.length === 0 || left.length === group.length) continue
      const right = group.filter(q => features[q][f] >= threshold)
      const e = entropy(left) * left.length + entropy(right) * right.length
      if (e < best - EPS) {
        best = e
        bestSplit = [left, right]
      }
    }
  }
  if (!bestSplit) return current * group.length
  return build(bestSplit[0], feats) + build(bestSplit[1], feats)
}

const all = Array.from({ length: pn }, (_, i) => i)
let bestSet: number[] = []
let bestEntropy = Infinity
const chosen: number[] = []
const choose = (start: number): void => {
  if (chosen.length === fm) {
    const e = build(all, chosen) / pn
    if (e < bestEntropy - EPS) {
      bestEntropy = e
      bestSet = [...chosen]
    }
    return
  }
  for (let f = start; f < fn; f++) {
    chosen.push(f)
    choose(f + 1)
    chosen.pop()
  }
}
choose(0)

console.log(bestSet.map(f => f + 1).join(" "))
