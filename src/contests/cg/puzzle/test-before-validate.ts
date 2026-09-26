// 🎮 CodinGame Puzzle - test-before-validate
// https://www.codingame.com/training/hard/test-before-validate!

// Topological sort (Kahn): at each step, among the actions whose predecessors are all
// done, pick the one that appears first in the input list.

const n = parseInt(readline())
const actions: string[] = []
for (let i = 0; i < n; i++) actions.push(readline().trim())
const index = new Map<string, number>(actions.map((a, i) => [a, i]))

const preds: Set<number>[] = actions.map(() => new Set<number>())
const nbOrders = parseInt(readline())
for (let i = 0; i < nbOrders; i++) {
  const line = readline().trim()
  const match = line.match(/^(.*) (before|after) (.*)$/)
  if (match === null) continue
  const a = index.get(match[1].trim())
  const b = index.get(match[3].trim())
  if (a === undefined || b === undefined) continue
  if (match[2] === "before") preds[b].add(a)
  else preds[a].add(b)
}

const done = new Array<boolean>(n).fill(false)
const result: string[] = []
for (let step = 0; step < n; step++) {
  const next = actions.findIndex((_, i) => !done[i] && [...preds[i]].every(p => done[p]))
  if (next < 0) break
  done[next] = true
  result.push(actions[next])
}
console.log(result.join("\n"))
