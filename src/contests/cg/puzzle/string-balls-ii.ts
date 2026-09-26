// 🎮 CodinGame Puzzle - string-balls-ii
// https://www.codingame.com/training/hard/string-balls-ii

// Each center letter c contributes P_c(x) = Σ_l x^|l-c|, so the answer is the
// sum of the first radius+1 coefficients of F = Π P_c^m_c. With G = Π P_c
// (distinct ones) and H = Σ m_c P_c' G / P_c, F satisfies G·F' = H·F, which
// yields each coefficient of F from the previous ~deg(G) ones. When the
// radius is past half the maximal distance D we count the complement using
// reversed polynomials (distance D - d), keeping the number of terms small.
const MOD = 1_000_000_007
const mul = (a: number, b: number): number => (((a * (b >>> 16)) % MOD) * 65536 + a * (b & 65535)) % MOD

const radius = parseInt(readline())
const center = readline().trim()
const L = center.length

const counts = new Array<number>(26).fill(0)
for (const ch of center) counts[ch.charCodeAt(0) - 97]++
let maxDist = 0
for (let c = 0; c < 26; c++) maxDist += counts[c] * Math.max(c, 25 - c)

let total = 1
for (let i = 0; i < L; i++) total = mul(total, 26)

const polyMul = (a: number[], b: number[]): number[] => {
  const r = new Array<number>(a.length + b.length - 1).fill(0)
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) r[i + j] = (r[i + j] + mul(a[i], b[j])) % MOD
  return r
}

// Sum of the first `terms` coefficients of Π P_c^m_c (optionally reversed)
const prefixSum = (terms: number, reversed: boolean): number => {
  // Distinct polynomials with their total multiplicity
  const polys = new Map<string, { p: number[]; m: number }>()
  for (let c = 0; c < 26; c++) {
    if (!counts[c]) continue
    const deg = Math.max(c, 25 - c)
    const p = new Array<number>(deg + 1).fill(0)
    for (let l = 0; l < 26; l++) {
      const d = Math.abs(l - c)
      p[reversed ? deg - d : d]++
    }
    const key = p.join(",")
    const e = polys.get(key)
    if (e) e.m += counts[c]
    else polys.set(key, { p, m: counts[c] })
  }
  const list = [...polys.values()]
  let G = [1]
  for (const { p } of list) G = polyMul(G, p)
  let H = new Array<number>(Math.max(1, G.length - 1)).fill(0)
  list.forEach(({ p, m }, idx) => {
    const deriv = p.slice(1).map((v, i) => (v * (i + 1) * m) % MOD)
    let rest = [1]
    list.forEach((o, j) => {
      if (j !== idx) rest = polyMul(rest, o.p)
    })
    const t = deriv.length ? polyMul(deriv, rest) : [0]
    for (let i = 0; i < t.length; i++) H[i] = (H[i] + t[i]) % MOD
  })

  const inv = new Array<number>(terms + 1).fill(1)
  for (let i = 2; i <= terms; i++) inv[i] = MOD - mul(Math.floor(MOD / i), inv[MOD % i])

  const F = new Float64Array(terms)
  const A = new Float64Array(terms) // A[k] = k·F[k]
  F[0] = 1
  let sum = 1
  const dG = G.length - 1
  const dH = H.length - 1
  for (let n = 0; n + 1 < terms; n++) {
    let s = 0
    const hm = Math.min(n, dH)
    for (let j = 0; j <= hm; j++) s += mul(H[j], F[n - j])
    const gm = Math.min(n + 1, dG)
    for (let j = 1; j <= gm; j++) s -= mul(G[j], A[n + 1 - j])
    s %= MOD
    if (s < 0) s += MOD
    A[n + 1] = s
    F[n + 1] = mul(s, inv[n + 1])
    sum = (sum + F[n + 1]) % MOD
  }
  return sum
}

let answer: number
if (radius >= maxDist) answer = total
else if (radius <= maxDist - radius - 1) answer = prefixSum(radius + 1, false)
else answer = (total - prefixSum(maxDist - radius, true) + MOD) % MOD
console.log(answer)
