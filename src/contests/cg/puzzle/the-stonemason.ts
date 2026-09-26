// 🎮 CodinGame Puzzle - the-stonemason
// https://www.codingame.com/training/medium/the-stonemason

// The units are powers of the golden ratio φ: kL = φ^k, C = 1, kR = φ^-k.
// The answer is the standard base-φ representation of n, found greedily.
// Numbers of Z[φ] are stored exactly as a + b·φ.
type Phi = [number, number]

// Sign of a + b·φ = ((2a + b) + b·√5) / 2
function sign([a, b]: Phi): number {
  const x = 2 * a + b
  if (x >= 0 && b >= 0) return x === 0 && b === 0 ? 0 : 1
  if (x <= 0 && b <= 0) return -1
  const d = x * x - 5 * b * b
  return x > 0 ? Math.sign(d) : -Math.sign(d)
}

const sub = (p: Phi, q: Phi): Phi => [p[0] - q[0], p[1] - q[1]]
const mulPhi = ([a, b]: Phi): Phi => [b, a + b]
const divPhi = ([a, b]: Phi): Phi => [b - a, a]

const n = Number(readline())
let rest: Phi = [n, 0]
// Highest power not greater than n
let k = 0
let power: Phi = [1, 0]
while (sign(sub(rest, mulPhi(power))) >= 0) {
  power = mulPhi(power)
  k++
}

const units: string[] = []
while (sign(rest) > 0) {
  while (sign(sub(rest, power)) < 0) {
    power = divPhi(power)
    k--
  }
  rest = sub(rest, power)
  units.push(k === 0 ? "C" : k > 0 ? `${k}L` : `${-k}R`)
}
console.log(units.join(" "))
