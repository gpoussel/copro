// 🎮 CodinGame Puzzle - discrete-log-problem
// https://www.codingame.com/training/hard/discrete-log-problem

// Baby-step giant-step. Q < 5e10, so products overflow doubles: mulmod works
// on base-4096 digits of the second operand to stay below 2^53.
const [G, H, Q] = readline().split(" ").map(Number)

const mulmod = (a: number, b: number): number => {
  const d2 = Math.floor(b / 16777216)
  const d1 = Math.floor(b / 4096) % 4096
  const d0 = b % 4096
  let r = (a * d2) % Q
  r = (r * 4096 + a * d1) % Q
  r = (r * 4096 + a * d0) % Q
  return r
}

const powmod = (base: number, exp: number): number => {
  let result = 1
  let b = base % Q
  while (exp > 0) {
    if (exp % 2 === 1) result = mulmod(result, b)
    b = mulmod(b, b)
    exp = Math.floor(exp / 2)
  }
  return result
}

const m = Math.ceil(Math.sqrt(Q))
// baby steps: smallest j with G^j = value
const table = new Map<number, number>()
let cur = 1
for (let j = 0; j < m; j++) {
  if (!table.has(cur)) table.set(cur, j)
  cur = mulmod(cur, G)
}

// giant steps: H * G^(-m*i), first hit gives the smallest exponent
const factor = powmod(powmod(G, m), Q - 2)
let gamma = H % Q
for (let i = 0; i <= m; i++) {
  const j = table.get(gamma)
  if (j !== undefined) {
    console.log(i * m + j)
    break
  }
  gamma = mulmod(gamma, factor)
}
