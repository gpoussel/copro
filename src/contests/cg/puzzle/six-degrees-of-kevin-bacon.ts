// 🎮 CodinGame Puzzle - six-degrees-of-kevin-bacon
// https://www.codingame.com/training/easy/six-degrees-of-kevin-bacon

const actorName = readline().trim()
const n = Number(readline())

// Build the co-starring graph: actors sharing a movie are one degree apart.
const adj = new Map<string, Set<string>>()
const link = (a: string, b: string) => {
  if (!adj.has(a)) adj.set(a, new Set())
  adj.get(a)!.add(b)
}

for (let i = 0; i < n; i++) {
  const line = readline()
  const cast = line.slice(line.indexOf(": ") + 2).split(", ")
  for (const a of cast) {
    for (const b of cast) {
      if (a !== b) link(a, b)
    }
  }
}

const TARGET = "Kevin Bacon"

// BFS from the queried actor to Kevin Bacon, one step per shared movie.
const dist = new Map<string, number>([[actorName, 0]])
let frontier = [actorName]
while (frontier.length > 0 && !dist.has(TARGET)) {
  const next: string[] = []
  for (const actor of frontier) {
    for (const other of adj.get(actor) ?? []) {
      if (!dist.has(other)) {
        dist.set(other, dist.get(actor)! + 1)
        next.push(other)
      }
    }
  }
  frontier = next
}

console.log(dist.get(TARGET) ?? 0)
