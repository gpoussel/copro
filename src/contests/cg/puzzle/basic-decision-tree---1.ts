// 🎮 CodinGame Puzzle - basic-decision-tree---1
// https://www.codingame.com/training/hard/basic-decision-tree---1

interface Pupa {
  idx: number
  horn: number
  species: number
}

const pupaCount = parseInt(readline())
const pupae: Pupa[] = []
for (let i = 0; i < pupaCount; i++) {
  const [idx, horn, species] = readline().trim().split(/\s+/).map(Number)
  pupae.push({ idx, horn, species })
}

const entropy = (group: Pupa[]): number => {
  const counts = new Map<number, number>()
  for (const p of group) counts.set(p.species, (counts.get(p.species) ?? 0) + 1)
  let h = 0
  for (const c of counts.values()) {
    const q = c / group.length
    h -= q * Math.log2(q)
  }
  return h
}

// Recursively split (smaller-horn group first), remembering the last separator used
let lastSeparator = -1
const split = (group: Pupa[]): void => {
  if (entropy(group) === 0) return
  let best: Pupa | null = null
  let bestScore = Infinity
  const ordered = [...group].sort((a, b) => a.idx - b.idx)
  for (const sep of ordered) {
    const left = group.filter(p => p.horn < sep.horn)
    const right = group.filter(p => p.horn >= sep.horn)
    if (left.length === 0) continue // no actual split
    const score = (left.length * entropy(left) + right.length * entropy(right)) / group.length
    if (score < bestScore - 1e-12) {
      bestScore = score
      best = sep
    }
  }
  if (best === null) return
  lastSeparator = best.idx
  const pivot = best.horn
  split(group.filter(p => p.horn < pivot))
  split(group.filter(p => p.horn >= pivot))
}

split(pupae)
console.log(lastSeparator)
