// 🎮 CodinGame Puzzle - breaking-bifid
// https://www.codingame.com/training/hard/breaking-bifid

// Each letter has two unknowns: its row and its column in the square. The
// known plaintext/ciphertext pair only yields equalities between those
// unknowns (cipher letter i = (s[2i], s[2i+1]) where s = rows ++ cols of the
// plaintext), so we merge them with a union-find. Then we backtrack over the
// classes to assign values 0..4 such that every letter gets a distinct cell
// (and no row/column holds more than 5 letters). Any relabeling of the digits
// yields the same decryption, so the first valid square is enough.
const clean = (s: string): number[] =>
  s
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .replace(/J/g, "I")
    .split("")
    .map(ch => {
      const c = ch.charCodeAt(0) - 65
      return c > 9 ? c - 1 : c // letters indexed 0..24 without J
    })
const letter = (i: number): string => String.fromCharCode(65 + (i >= 9 ? i + 1 : i))

const plain = clean(readline())
const cipher = clean(readline())
const cipher2 = clean(readline())

// variable 2*l = row of letter l, 2*l+1 = column of letter l
const parent = Array.from({ length: 50 }, (_, i) => i)
const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
const union = (a: number, b: number): void => {
  parent[find(a)] = find(b)
}
const s = [...plain.map(l => 2 * l), ...plain.map(l => 2 * l + 1)]
for (let i = 0; i < cipher.length && 2 * i + 1 < s.length; i++) {
  union(2 * cipher[i], s[2 * i])
  union(2 * cipher[i] + 1, s[2 * i + 1])
}

// classes, most constrained (largest) first
const members = new Map<number, number[]>()
for (let v = 0; v < 50; v++) {
  const r = find(v)
  if (!members.has(r)) members.set(r, [])
  ;(members.get(r) as number[]).push(v)
}
const classes = [...members.values()].sort((a, b) => b.length - a.length)
const clsOf = new Array<number>(50).fill(0)
classes.forEach((c, i) => c.forEach(v => (clsOf[v] = i)))

const val = new Array<number>(classes.length).fill(-1)
const cell = new Array<number>(25).fill(0) // number of letters on each cell
const rowCnt = new Array<number>(5).fill(0)
const colCnt = new Array<number>(5).fill(0)
const letterRow = (l: number): number => val[clsOf[2 * l]]
const letterCol = (l: number): number => val[clsOf[2 * l + 1]]

const dfs = (k: number): boolean => {
  if (k === classes.length) return true
  for (let d = 0; d < 5; d++) {
    val[k] = d
    const touched: number[] = []
    let ok = true
    for (const v of classes[k]) {
      const l = v >> 1
      if (v & 1) {
        if (++colCnt[d] > 5) ok = false
      } else if (++rowCnt[d] > 5) ok = false
      const r = letterRow(l)
      const c = letterCol(l)
      if (r >= 0 && c >= 0 && touched.indexOf(l) < 0) {
        touched.push(l)
        if (++cell[r * 5 + c] > 1) ok = false
      }
    }
    if (ok && dfs(k + 1)) return true
    for (const l of touched) cell[letterRow(l) * 5 + letterCol(l)]--
    for (const v of classes[k]) {
      if (v & 1) colCnt[d]--
      else rowCnt[d]--
    }
    val[k] = -1
  }
  return false
}
dfs(0)

const at = new Array<number>(25).fill(0)
for (let l = 0; l < 25; l++) at[letterRow(l) * 5 + letterCol(l)] = l
const M = cipher2.length
const t: number[] = []
for (const l of cipher2) t.push(letterRow(l), letterCol(l))
let out = ""
for (let i = 0; i < M; i++) out += letter(at[t[i] * 5 + t[M + i]])
console.log(out)
