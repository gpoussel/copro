// 🎮 CodinGame Puzzle - 3d-duck-hunt
// https://www.codingame.com/training/hard/3d-duck-hunt

// Bullet line (P, V) must satisfy (P - Pi) x (V - Vi) = 0 for each duck i.
// The quadratic term P x V cancels when subtracting two such equations:
//   P x (Vi - Vj) + (Pi - Pj) x V = Pi x Vi - Pj x Vj
// Using the three duck pairs gives 9 linear equations in 6 unknowns, solved
// exactly with fraction-free Gaussian elimination on BigInts.

type Vec3 = [bigint, bigint, bigint]

const duckPos: Vec3[] = []
const duckVel: Vec3[] = []
for (let i = 0; i < 3; i++) {
  const [a, b] = readline().split("@")
  duckPos.push(a.trim().split(/\s+/).map(BigInt) as Vec3)
  duckVel.push(b.trim().split(/\s+/).map(BigInt) as Vec3)
}

const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]

// Rows: [P coefs (3), V coefs (3), rhs]
const rows: bigint[][] = []
for (const [i, j] of [
  [0, 1],
  [0, 2],
  [1, 2],
]) {
  const d = sub(duckVel[i], duckVel[j])
  const c = sub(duckPos[i], duckPos[j])
  const r = sub(cross(duckPos[i], duckVel[i]), cross(duckPos[j], duckVel[j]))
  // (P x d)_x = Py dz - Pz dy ; (c x V)_x = cy Vz - cz Vy, and cyclic
  rows.push([0n, d[2], -d[1], 0n, -c[2], c[1], r[0]])
  rows.push([-d[2], 0n, d[0], c[2], 0n, -c[0], r[1]])
  rows.push([d[1], -d[0], 0n, -c[1], c[0], 0n, r[2]])
}

const absB = (x: bigint): bigint => (x < 0n ? -x : x)
const gcdB = (a: bigint, b: bigint): bigint => {
  a = absB(a)
  b = absB(b)
  while (b) [a, b] = [b, a % b]
  return a
}

// Fraction-free elimination to reduced row echelon form
const pivotRow: number[] = []
let rank = 0
for (let col = 0; col < 6; col++) {
  let p = -1
  for (let r = rank; r < rows.length; r++) if (rows[r][col] !== 0n) p = r
  if (p < 0) continue
  ;[rows[rank], rows[p]] = [rows[p], rows[rank]]
  for (let r = 0; r < rows.length; r++) {
    if (r === rank || rows[r][col] === 0n) continue
    const f = rows[r][col]
    const g = rows[rank][col]
    for (let k = 0; k < 7; k++) rows[r][k] = rows[r][k] * g - rows[rank][k] * f
    let h = 0n
    for (const x of rows[r]) h = gcdB(h, x)
    if (h > 1n) for (let k = 0; k < 7; k++) rows[r][k] /= h
  }
  pivotRow[col] = rank++
}

const sol: bigint[] = []
for (let col = 0; col < 6; col++) {
  const r = rows[pivotRow[col]]
  sol.push(r[6] / r[col])
}
console.log(sol.join(" "))
