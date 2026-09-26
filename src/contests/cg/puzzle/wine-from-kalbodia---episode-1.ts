// 🎮 CodinGame Puzzle - wine-from-kalbodia---episode-1
// https://www.codingame.com/training/medium/wine-from-kalbodia---episode-1

// Canonical shape of a string: each letter replaced by the rank of its first appearance
const shape = (s: string): string => {
  const ranks: { [c: string]: number } = {}
  let next = 0
  return s
    .split("")
    .map(c => {
      if (!(c in ranks)) ranks[c] = next++
      return ranks[c]
    })
    .join(",")
}

const n = parseInt(readline())
const requests: string[] = []
for (let i = 0; i < n; i++) requests.push(shape(readline().trim()))
const crates = new Map<string, number>()
for (let j = 1; j <= n; j++) crates.set(shape(readline().trim()), j)

for (const request of requests) console.log(crates.get(request))
