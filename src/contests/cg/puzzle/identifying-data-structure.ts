// 🎮 CodinGame Puzzle - identifying-data-structure
// https://www.codingame.com/training/medium/identifying-data-structure

type Extractor = (bag: number[]) => number // index of the element taken out

const extractors: { label: string; pick: Extractor }[] = [
  { label: "queue", pick: () => 0 },
  { label: "stack", pick: (bag) => bag.length - 1 },
  {
    label: "priority queue",
    pick: (bag) => {
      let best = 0
      for (let i = 1; i < bag.length; i++) if (bag[i] > bag[best]) best = i
      return best
    },
  },
]

function behavesLike(operations: string[], pick: Extractor): boolean {
  const bag: number[] = []
  for (const op of operations) {
    const value = parseInt(op.substr(1), 10)
    if (op[0] === "i") bag.push(value)
    else {
      if (bag.length === 0) return false
      const idx = pick(bag)
      if (bag[idx] !== value) return false
      bag.splice(idx, 1)
    }
  }
  return true
}

const sequenceCount = parseInt(readline(), 10)
for (let i = 0; i < sequenceCount; i++) {
  const operations = readline().split(" ").filter((s) => s.length > 0)
  const matches = extractors.filter((e) => behavesLike(operations, e.pick))
  if (matches.length === 0) console.log("mystery")
  else if (matches.length > 1) console.log("unsure")
  else console.log(matches[0].label)
}
