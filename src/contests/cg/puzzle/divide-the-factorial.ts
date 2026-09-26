// 🎮 CodinGame Puzzle - divide-the-factorial
// https://www.codingame.com/training/medium/divide-the-factorial

const [baseA, factB] = readline().split(" ").map(Number)

// Legendre's formula: exponent of prime p in B!
const primeExponentInFactorial = (p: number): number => {
  let exponent = 0
  for (let power = p; power <= factB; power *= p) exponent += Math.floor(factB / power)
  return exponent
}

let answer = Infinity
let rest = baseA
for (let p = 2; p * p <= rest || rest > 1; p++) {
  if (p * p > rest) p = rest // remaining factor is prime
  if (rest % p !== 0) continue
  let multiplicity = 0
  while (rest % p === 0) {
    rest /= p
    multiplicity++
  }
  answer = Math.min(answer, Math.floor(primeExponentInFactorial(p) / multiplicity))
}
console.log(answer)
