// 🎮 CodinGame Puzzle - tbr-out-of-control
// https://www.codingame.com/

const b: number = parseInt(readline(), 10)
const newTitles: Set<string> = new Set<string>()
for (let i = 0; i < b; i++) {
  newTitles.add(readline())
}

const n: number = parseInt(readline(), 10)
const ranks: Map<string, number | null> = new Map<string, number | null>()
let maxRank: number = -1
for (let i = 0; i < n; i++) {
  const line: string = readline()
  const sep: number = line.lastIndexOf(" ")
  const name: string = line.slice(0, sep)
  const rankStr: string = line.slice(sep + 1)
  const rank: number | null = rankStr === "None" ? null : parseInt(rankStr, 10)
  ranks.set(name, rank)
  if (rank !== null && rank > maxRank) {
    maxRank = rank
  }
}

// Current distinct books on the shelf (by name).
const current: Set<string> = new Set<string>(ranks.keys())
// All new books must be placed (forced into the final shelf).
for (const title of newTitles) {
  current.add(title)
}

let possible: boolean = true
while (current.size > n) {
  // Find the smallest removable rank: not a new book, not TBR (None),
  // not a favorite (max rank).
  let smallest: number = Number.POSITIVE_INFINITY
  for (const name of current) {
    if (newTitles.has(name)) {
      continue
    }
    const rank: number | null | undefined = ranks.get(name)
    if (rank === undefined || rank === null || rank === maxRank) {
      continue
    }
    if (rank < smallest) {
      smallest = rank
    }
  }
  if (smallest === Number.POSITIVE_INFINITY) {
    possible = false
    break
  }
  // Remove every book sharing that ranking (except protected new books).
  const toRemove: Array<string> = []
  for (const name of current) {
    if (!newTitles.has(name) && ranks.get(name) === smallest) {
      toRemove.push(name)
    }
  }
  for (const name of toRemove) {
    current.delete(name)
  }
}

if (!possible) {
  console.log("Your TBR is out of control Clara!")
} else {
  const result: Array<string> = Array.from(current).sort()
  for (const name of result) {
    console.log(name)
  }
}
