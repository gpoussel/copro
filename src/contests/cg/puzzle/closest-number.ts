// 🎮 CodinGame Puzzle - closest-number
// https://www.codingame.com/training/hard/closest-number

// Work on L-digit strings (L = number of digits of M, leading zeros allowed).
// If N has more digits, every permutation is below N: take the max one.
// Otherwise pad N to L digits. The largest permutation below N keeps the
// longest feasible prefix of N, then puts the largest smaller digit and the
// rest in descending order; symmetrically for the smallest one above N.
// Compare both distances with BigInt (ties go to the lower number).
const [N, M] = readline().trim().split(/\s+/)
const L = M.length
const cnt = new Array<number>(10).fill(0)
for (const ch of M) cnt[+ch]++

const strip = (s: string): string => s.replace(/^0+(?=.)/, "")
const fill = (c: number[], desc: boolean): string => {
  let s = ""
  if (desc) for (let d = 9; d >= 0; d--) s += String(d).repeat(c[d])
  else for (let d = 0; d <= 9; d++) s += String(d).repeat(c[d])
  return s
}

if (N.length > L) {
  console.log(strip(fill(cnt, true)))
} else {
  const T = N.padStart(L, "0")
  // find the deepest prefix positions allowing a smaller / larger digit
  const c = cnt.slice()
  let kBelow = -1
  let kAbove = -1
  let exact = true
  for (let k = 0; k < L; k++) {
    const t = +T[k]
    for (let d = 0; d < t; d++) if (c[d] > 0) kBelow = k
    for (let d = t + 1; d <= 9; d++) if (c[d] > 0) kAbove = k
    if (c[t] === 0) {
      exact = false
      break
    }
    c[t]--
  }
  if (exact) console.log(strip(T))
  else {
    const build = (k: number, below: boolean): string => {
      const cc = cnt.slice()
      for (let i = 0; i < k; i++) cc[+T[i]]--
      const t = +T[k]
      let d = below ? t - 1 : t + 1
      while (cc[d] === 0) d += below ? -1 : 1
      cc[d]--
      return T.slice(0, k) + d + fill(cc, below)
    }
    const n = BigInt(T)
    const cands: bigint[] = []
    if (kBelow >= 0) cands.push(BigInt(build(kBelow, true)))
    if (kAbove >= 0) cands.push(BigInt(build(kAbove, false)))
    const dist = (x: bigint): bigint => (x > n ? x - n : n - x)
    let best = cands[0]
    for (const x of cands) if (dist(x) < dist(best) || (dist(x) === dist(best) && x < best)) best = x
    console.log(best.toString())
  }
}
