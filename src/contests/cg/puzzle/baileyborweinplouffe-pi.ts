// 🎮 CodinGame Puzzle - baileyborweinplouffe-pi
// https://www.codingame.com/training/hard/baileyborweinplouffe-pi

// Classic BBP digit extraction: frac(16^d * pi) for d = N - 1, computed with
// modular exponentiation for the head of each series and a few float terms
// for the tail. Moduli stay below 1e6 so products fit in a double exactly.
const n = Number(readline())
const d = n - 1

const powMod = (base: number, exp: number, mod: number) => {
  let result = 1 % mod
  let b = base % mod
  while (exp > 0) {
    if (exp & 1) result = (result * b) % mod
    b = (b * b) % mod
    exp = Math.floor(exp / 2)
  }
  return result
}

// frac(sum_k 16^(d-k) / (8k + j))
const series = (j: number) => {
  let s = 0
  for (let k = 0; k <= d; k++) {
    const m = 8 * k + j
    s = (s + powMod(16, d - k, m) / m) % 1
  }
  for (let k = d + 1; k <= d + 20; k++) s += Math.pow(16, d - k) / (8 * k + j)
  return s % 1
}

let x = 4 * series(1) - 2 * series(4) - series(5) - series(6)
x = ((x % 1) + 1) % 1
console.log(Math.floor(x * 16))
