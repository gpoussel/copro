// 🎮 CodinGame Puzzle - hotel
// https://www.codingame.com/training/medium/hotel

const FLOORS = 4
const c = parseInt(readline())
const names: string[] = []
for (let i = 0; i < c; i++) names.push(readline().trim())
const r = parseInt(readline())

type Rule = (floor: number[]) => boolean
const idx = (name: string): number => names.indexOf(name.trim())
const countAt = (floor: number[], y: number): number => floor.filter(f => f === y).length

// Two-customer rules, as "<a><marker><b>"
const pairRules: [string, (a: number, b: number) => boolean][] = [
  [" is just above ", (a, b) => a === b + 1],
  [" is higher than ", (a, b) => a > b],
  [" is NOT at the same floor as ", (a, b) => a !== b],
  [" is at the same floor as ", (a, b) => a === b],
]

const parseRule = (line: string): Rule => {
  let m = line.match(/^There's nobody at floor (\d)$/)
  if (m) {
    const y = Number(m[1])
    return f => countAt(f, y) === 0
  }
  m = line.match(/^There are exactly two customers at floor (\d)$/)
  if (m) {
    const y = Number(m[1])
    return f => countAt(f, y) === 2
  }
  m = line.match(/^(.+) is NOT at floor (\d)$/)
  if (m) {
    const [a, y] = [idx(m[1]), Number(m[2])]
    return f => f[a] !== y
  }
  m = line.match(/^(.+) is at floor (\d)$/)
  if (m) {
    const [a, y] = [idx(m[1]), Number(m[2])]
    return f => f[a] === y
  }
  m = line.match(/^(.+) is alone at his\/her floor$/)
  if (m) {
    const a = idx(m[1])
    return f => countAt(f, f[a]) === 1
  }
  m = line.match(/^(.+) is with two other customers at his\/her floor$/)
  if (m) {
    const a = idx(m[1])
    return f => countAt(f, f[a]) === 3
  }
  for (const [marker, test] of pairRules) {
    const at = line.indexOf(marker)
    if (at < 0) continue
    const a = idx(line.slice(0, at))
    const b = idx(line.slice(at + marker.length))
    return f => test(f[a], f[b])
  }
  throw new Error(`Unknown rule: ${line}`)
}

const rules: Rule[] = []
for (let i = 0; i < r; i++) rules.push(parseRule(readline().trim()))

// Brute force every assignment (at most 4^6)
const floor: number[] = new Array(c).fill(0)
for (let code = 0; code < FLOORS ** c; code++) {
  for (let i = 0, v = code; i < c; i++, v = Math.floor(v / FLOORS)) floor[i] = v % FLOORS
  if (rules.every(rule => rule(floor))) break
}
names.forEach((name, i) => console.log(`${name} ${floor[i]}`))
