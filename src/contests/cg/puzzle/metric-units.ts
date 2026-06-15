// 🎮 CodinGame Puzzle - metric-units
// https://www.codingame.com/training/easy/metric-units

const factors: { [unit: string]: number } = {
  um: 1,
  mm: 1000,
  cm: 10000,
  dm: 100000,
  m: 1000000,
  km: 1000000000,
}

const expression: string = readline()
const [left, right] = expression.split(" + ")

const parse = (token: string): { value: number; unit: string } => {
  const match = token.match(/^([0-9.]+)([a-z]+)$/) as RegExpMatchArray
  return { value: parseFloat(match[1]), unit: match[2] }
}

const a = parse(left)
const b = parse(right)

const smaller: string = factors[a.unit] <= factors[b.unit] ? a.unit : b.unit
const um: number = a.value * factors[a.unit] + b.value * factors[b.unit]
const result: number = um / factors[smaller]

const rounded: number = Math.round(result * 100000) / 100000
const text: string = rounded.toFixed(5).replace(/\.?0+$/, "")

console.log(`${text}${smaller}`)
