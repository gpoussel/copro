// 🎮 CodinGame Puzzle - her-majestys-well-shared-secret
// https://www.codingame.com/training/hard/her-majestys-well-shared-secret

// Shamir's secret sharing over GF(53): Lagrange-interpolate each character's
// polynomial at x = 0 using all the given parts (N >= k points suffice).
const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_"
const MOD = 53
const mod = (v: number) => ((v % MOD) + MOD) % MOD
const inverse = (v: number) => {
  let r = 1
  for (let e = MOD - 2, b = mod(v); e > 0; e >>= 1, b = (b * b) % MOD) if (e & 1) r = (r * b) % MOD
  return r
}

const n = Number(readline())
const parts = Array.from({ length: n }, () => {
  const [code, text] = readline().split(" ")
  return { x: Number(code), values: [...text].map(ch => ALPHABET.indexOf(ch)) }
})

// Lagrange basis weights at 0: prod_{j != i} x_j / (x_j - x_i)
const weights = parts.map((pi, i) => {
  let w = 1
  parts.forEach((pj, j) => {
    if (j !== i) w = (w * mod(pj.x) * inverse(pj.x - pi.x)) % MOD
  })
  return w
})

let secret = ""
for (let c = 0; c < parts[0].values.length; c++) {
  let v = 0
  parts.forEach((p, i) => (v = (v + weights[i] * p.values[c]) % MOD))
  secret += ALPHABET[v]
}
console.log(secret)
