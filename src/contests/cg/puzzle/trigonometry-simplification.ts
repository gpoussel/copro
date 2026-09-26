// 🎮 CodinGame Puzzle - trigonometry-simplification
// https://www.codingame.com/training/medium/trigonometry-simplification

const [S, C, F] = readline().split(" ").map(Number)
const n = S + C

// Coefficients of (z - 1/z)^S (z + 1/z)^C, index k + n holds the z^k coefficient
let poly: number[] = [1]
const multiply = (sign: number) => {
  const next: number[] = new Array(poly.length + 2).fill(0)
  poly.forEach((v, i) => {
    next[i + 2] += v
    next[i] += sign * v
  })
  poly = next
}
for (let i = 0; i < S; i++) multiply(-1)
for (let i = 0; i < C; i++) multiply(1)

// sin^S cos^C = P(e^ix) / (2^n i^S)
const denominator = Math.pow(2, n)
const sign = S % 2 === 0 ? (S / 2) % 2 === 0 ? 1 : -1 : ((S - 1) / 2) % 2 === 0 ? 1 : -1
const fn = S % 2 === 0 ? "cos" : "sin"

const terms: [number, string][] = []
if (S % 2 === 0) terms.push([(sign * F * poly[n]) / denominator, ""])
for (let k = 1; k <= n; k++) {
  terms.push([(sign * 2 * F * poly[n + k]) / denominator, `${fn}(${k === 1 ? "" : k}x)`])
}

let out = ""
for (const [coef, suffix] of terms) {
  if (coef === 0) continue
  const abs = Math.abs(coef)
  const body = suffix === "" ? String(abs) : (abs === 1 ? "" : String(abs)) + suffix
  if (coef < 0) out += "-" + body
  else out += (out === "" ? "" : "+") + body
}
console.log(out === "" ? "0" : out)
