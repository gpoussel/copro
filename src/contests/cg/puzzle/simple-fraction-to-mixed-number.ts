// 🎮 CodinGame Puzzle - simple-fraction-to-mixed-number
// https://www.codingame.com/training/medium/simple-fraction-to-mixed-number

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

const n: number = parseInt(readline())
const out: string[] = []
for (let i = 0; i < n; i++) {
  const parts = readline().split("/")
  const x = parseInt(parts[0])
  const y = parseInt(parts[1])
  if (y === 0) {
    out.push("DIVISION BY ZERO")
    continue
  }
  const neg = x < 0 !== y < 0
  const ax = Math.abs(x)
  const ay = Math.abs(y)
  const intPart = Math.floor(ax / ay)
  const rem = ax % ay
  const sign = neg && (intPart !== 0 || rem !== 0) ? "-" : ""
  if (rem === 0) {
    out.push(sign + intPart.toString())
  } else {
    const g = gcd(rem, ay)
    const b = rem / g
    const c = ay / g
    if (intPart === 0) {
      out.push(sign + b + "/" + c)
    } else {
      out.push(sign + intPart + " " + b + "/" + c)
    }
  }
}
console.log(out.join("\n"))
