// 🎮 CodinGame Puzzle - a-bit-of-accounting---lettering
// https://www.codingame.com/

const n: number = parseInt(readline(), 10)
const m: number = parseInt(readline(), 10)
const invoices: number[] = []
for (let i = 0; i < n; i++) invoices.push(parseInt(readline(), 10))
const entries: number[] = []
for (let i = 0; i < m; i++) entries.push(parseInt(readline(), 10))

const used: boolean[] = new Array(n).fill(false)

// Find a subset of unused invoices summing to target.
// Returns the list of indices, or null if none.
function findSubset(target: number): number[] | null {
  const result: number[] = []

  function dfs(start: number, remaining: number): boolean {
    if (remaining === 0) return true
    for (let i = start; i < n; i++) {
      if (used[i]) continue
      if (invoices[i] > remaining) continue
      used[i] = true
      result.push(i)
      if (dfs(i + 1, remaining - invoices[i])) return true
      result.pop()
      used[i] = false
    }
    return false
  }

  if (dfs(0, target)) return result
  return null
}

const lines: string[] = []
for (let e = 0; e < m; e++) {
  const letter: string = String.fromCharCode(65 + e)
  const subset: number[] | null = findSubset(entries[e])
  const amounts: number[] = subset === null ? [] : subset.map(i => invoices[i])
  lines.push(`${letter} ${entries[e]} - ${amounts.join(" ")}`)
}

console.log(lines.join("\n"))
