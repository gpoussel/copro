// 🎮 CodinGame Puzzle - regular-polygons
// https://www.codingame.com/training/medium/regular-polygons

const [low, high] = readline().split(" ").map(Number)
const fermatPrimes = [3, 5, 17, 257, 65537]

// Constructible n-gons: 2^k times a product of distinct Fermat primes
let constructible = 0
for (let mask = 0; mask < 1 << fermatPrimes.length; mask++) {
  let n = 1
  fermatPrimes.forEach((p, i) => {
    if (mask & (1 << i)) n *= p
  })
  for (; n <= high; n *= 2) if (n >= low) constructible++
}
console.log(constructible)
