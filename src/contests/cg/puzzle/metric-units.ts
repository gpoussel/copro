// 🎮 CodinGame Puzzle - metric-units
// https://www.codingame.com/training/metric-units

const line = readline().trim()
const [left, right] = line.split(" + ")

const factors: { [k: string]: number } = {
  um: 1,
  mm: 1000,
  cm: 10000,
  dm: 100000,
  m: 1000000,
  km: 1000000000,
}

const parse = (s: string): { value: number; unit: string } => {
  const m = s.match(/^([0-9.]+)([a-z]+)$/)!
  return { value: parseFloat(m[1]), unit: m[2] }
}

const a = parse(left)
const b = parse(right)

const fa = factors[a.unit]
const fb = factors[b.unit]
const smaller = Math.min(fa, fb)
const smallerUnit = fa <= fb ? a.unit : b.unit

const sumUm = a.value * fa + b.value * fb
let result = sumUm / smaller

result = Math.round(result * 1e5) / 1e5

console.log(`${result}${smallerUnit}`)
