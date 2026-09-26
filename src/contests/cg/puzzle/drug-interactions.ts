// 🎮 CodinGame Puzzle - drug-interactions
// https://www.codingame.com/training/medium/drug-interactions

// Maximum independent set of the "interaction" graph, solved as a maximum
// clique of the compatibility graph with a greedy-colouring bound (Tomita MCQ)
const drugCount = parseInt(readline())
const letterCounts: number[][] = []
for (let i = 0; i < drugCount; i++) {
  const counts: number[] = []
  for (let k = 0; k < 26; k++) counts.push(0)
  for (const ch of readline().toLowerCase()) {
    const code = ch.charCodeAt(0) - 97
    if (code >= 0 && code < 26) counts[code]++
  }
  letterCounts.push(counts)
}

const compatible: boolean[][] = []
for (let i = 0; i < drugCount; i++) {
  compatible.push([])
  for (let j = 0; j < drugCount; j++) {
    let common = 0
    for (let k = 0; k < 26; k++) common += Math.min(letterCounts[i][k], letterCounts[j][k])
    compatible[i].push(i !== j && common < 3)
  }
}

let best = 0

// Greedy colouring: returns vertices ordered by colour with their colour index
function colourSort(candidates: number[]): [number[], number[]] {
  const classes: number[][] = []
  for (const v of candidates) {
    let placed = false
    for (const cls of classes) {
      if (cls.every(u => !compatible[u][v])) {
        cls.push(v)
        placed = true
        break
      }
    }
    if (!placed) classes.push([v])
  }
  const order: number[] = []
  const colours: number[] = []
  classes.forEach((cls, index) => {
    for (const v of cls) {
      order.push(v)
      colours.push(index + 1)
    }
  })
  return [order, colours]
}

function expand(size: number, candidates: number[]): void {
  const [order, colours] = colourSort(candidates)
  for (let i = order.length - 1; i >= 0; i--) {
    if (size + colours[i] <= best) return
    const v = order[i]
    const next: number[] = []
    for (let j = 0; j < i; j++) if (compatible[v][order[j]]) next.push(order[j])
    if (next.length === 0) best = Math.max(best, size + 1)
    else expand(size + 1, next)
  }
}

const allDrugs: number[] = []
for (let i = 0; i < drugCount; i++) allDrugs.push(i)
expand(0, allDrugs)
console.log(best)
