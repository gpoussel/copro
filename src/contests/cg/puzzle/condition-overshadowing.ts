// 🎮 CodinGame Puzzle - condition-overshadowing
// https://www.codingame.com/training/medium/condition-overshadowing

const LIMIT = 2 ** 30
const n = parseInt(readline())
const conditions: [string, number][] = []
for (let i = 0; i < n; i++) {
  const [, op, c] = readline().trim().split(/\s+/)
  conditions.push([op, Number(c)])
}

const holds = ([op, c]: [string, number], x: number): boolean =>
  op === "==" ? x === c : op === "!=" ? x !== c : op === ">" ? x > c : x < c

// Every region a condition chain can isolate is bounded by some c, c +/- 1 or the domain bounds,
// so testing those candidate values is enough to find a reachable value.
const candidates: number[] = [-LIMIT + 1, LIMIT - 1]
for (const [, c] of conditions) candidates.push(c - 1, c, c + 1)
const domain = candidates.filter(x => x > -LIMIT && x < LIMIT)

const overshadowed: number[] = []
conditions.forEach((cond, i) => {
  const reachable = domain.some(x => holds(cond, x) && !conditions.slice(0, i).some(prev => holds(prev, x)))
  if (!reachable) overshadowed.push(i)
})
console.log(overshadowed.length > 0 ? overshadowed.join(" ") : "ok")
