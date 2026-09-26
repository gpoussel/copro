// 🎮 CodinGame Puzzle - continued-fractions
// https://www.codingame.com/training/medium/continued-fractions

const fraction = readline().trim()

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

if (fraction[0] === "[") {
  // Evaluate from the innermost term: value = x_i + 1 / value
  const terms = fraction.slice(1, -1).split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0).map(Number)
  let p = terms[terms.length - 1]
  let q = 1
  for (let i = terms.length - 2; i >= 0; i--) {
    const next = terms[i] * p + q
    q = p
    p = next
  }
  if (q < 0) {
    p = -p
    q = -q
  }
  const g = gcd(p, q)
  console.log(`${p / g}/${q / g}`)
} else {
  let [p, q] = fraction.split("/").map(Number)
  if (q < 0) {
    p = -p
    q = -q
  }
  const terms: number[] = []
  while (q !== 0) {
    const x = Math.floor(p / q)
    terms.push(x)
    const r = p - x * q
    p = q
    q = r
  }
  const rest = terms.slice(1)
  console.log(rest.length > 0 ? `[${terms[0]}; ${rest.join(", ")}]` : `[${terms[0]}]`)
}
