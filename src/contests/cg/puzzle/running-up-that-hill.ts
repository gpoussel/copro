// 🎮 CodinGame Puzzle - running-up-that-hill
// https://www.codingame.com/training/expert/running-up-that-hill

// Known-plaintext attack on the Hill cipher mod 45 = 5 * 9. Each row a of
// the key matrix satisfies a . p_j = c_j for every clear/cipher block pair j,
// so rows are found independently by brute force modulo 5 and modulo 9
// (at most 9^6 candidates) and recombined with the CRT. The smallest block
// size that divides every length and admits an invertible key is used; the
// inverse is computed by Gauss-Jordan modulo 5 and 9 separately.

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"
const cipherText = readline()
const clearText = readline()
const toDecipher = readline()
const toCipher = readline()
const encode = (s: string): number[] => [...s].map(ch => ALPHABET.indexOf(ch))
const decode = (v: number[]): string => v.map(x => ALPHABET[x]).join("")

const cipherVals = encode(cipherText)
const clearVals = encode(clearText)

const mod = (x: number, m: number): number => ((x % m) + m) % m

// All rows (length n, entries mod m) mapping every clear block onto the given cipher component
const rowSolutions = (n: number, m: number, row: number): number[][] => {
  const blocks = clearVals.length / n
  const res: number[][] = []
  const a: number[] = new Array(n).fill(0)
  let total = 1
  for (let i = 0; i < n; i++) total *= m
  for (let code = 0; code < total; code++) {
    let x = code
    for (let i = 0; i < n; i++) {
      a[i] = x % m
      x = Math.floor(x / m)
    }
    let ok = true
    for (let j = 0; j < blocks && ok; j++) {
      let s = 0
      for (let i = 0; i < n; i++) s += a[i] * clearVals[j * n + i]
      if ((s - cipherVals[j * n + row]) % m !== 0) ok = false
    }
    if (ok) res.push(a.slice())
    if (res.length > 50) break
  }
  return res
}

// Inverse of a matrix modulo a prime power p^k, or null when singular
const inverseMod = (mat: number[][], m: number, p: number): number[][] | null => {
  const n = mat.length
  const aug = mat.map((r, i) => [...r.map(x => mod(x, m)), ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))])
  const invUnit = (x: number): number => {
    for (let y = 1; y < m; y++) if ((x * y) % m === 1) return y
    return -1
  }
  for (let col = 0; col < n; col++) {
    let piv = -1
    for (let r = col; r < n; r++) if (aug[r][col] % p !== 0) piv = r
    if (piv < 0) return null
    ;[aug[col], aug[piv]] = [aug[piv], aug[col]]
    const inv = invUnit(aug[col][col])
    for (let c = 0; c < 2 * n; c++) aug[col][c] = (aug[col][c] * inv) % m
    for (let r = 0; r < n; r++) {
      if (r === col || aug[r][col] === 0) continue
      const f = aug[r][col]
      for (let c = 0; c < 2 * n; c++) aug[r][c] = mod(aug[r][c] - f * aug[col][c], m)
    }
  }
  return aug.map(r => r.slice(n))
}

// Pick one combination of row solutions that is invertible modulo m
const pickInvertible = (rows: number[][][], m: number, p: number): [number[][], number[][]] | null => {
  const n = rows.length
  const choice: number[][] = []
  const rec = (i: number): [number[][], number[][]] | null => {
    if (i === n) {
      const inv = inverseMod(choice, m, p)
      return inv ? [choice.map(r => r.slice()), inv] : null
    }
    for (const r of rows[i]) {
      choice.push(r)
      const res = rec(i + 1)
      choice.pop()
      if (res) return res
    }
    return null
  }
  return rec(0)
}

const crt = (a5: number, a9: number): number => (a5 * 36 + a9 * 10) % 45

const lengths = [cipherText.length, clearText.length, toDecipher.length, toCipher.length]
let key: number[][] = []
let keyInv: number[][] = []
for (let n = 2; n <= 50; n++) {
  if (lengths.some(l => l % n !== 0)) continue
  const rows5: number[][][] = []
  const rows9: number[][][] = []
  let possible = true
  for (let r = 0; r < n && possible; r++) {
    rows5.push(rowSolutions(n, 5, r))
    rows9.push(rowSolutions(n, 9, r))
    if (rows5[r].length === 0 || rows9[r].length === 0) possible = false
  }
  if (!possible) continue
  const k5 = pickInvertible(rows5, 5, 5)
  const k9 = pickInvertible(rows9, 9, 3)
  if (!k5 || !k9) continue
  key = k5[0].map((r, i) => r.map((x, j) => crt(x, k9[0][i][j])))
  keyInv = k5[1].map((r, i) => r.map((x, j) => crt(x, k9[1][i][j])))
  break
}

const apply = (mat: number[][], vals: number[]): number[] => {
  const n = mat.length
  const out: number[] = []
  for (let b = 0; b < vals.length; b += n) {
    for (let i = 0; i < n; i++) {
      let s = 0
      for (let j = 0; j < n; j++) s += mat[i][j] * vals[b + j]
      out.push(s % 45)
    }
  }
  return out
}

console.log(decode(apply(keyInv, encode(toDecipher))))
console.log(decode(apply(key, encode(toCipher))))
