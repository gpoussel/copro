// 🎮 CodinGame Puzzle - mathematics-for-big-ears
// https://www.codingame.com/training/expert/mathematics-for-big-ears

// Schreier-Sims. Base points are 0..n-1. Level k keeps a transversal
// reps[k][y] = an element fixing points < k and sending k to y. Adding a new
// element sifts it through the transversals; a non-trivial residue becomes a
// generator of its level, then every orbit that may grow is extended, and each
// Schreier generator found on the way is added (sifted) recursively. The group
// order is the product of the orbit sizes.

type Perm = number[]

const permLines: string[] = []
const permCount = Number(readline())
for (let i = 0; i < permCount; i++) permLines.push(readline())

let degree = 0
const cycleLists: number[][][] = permLines.map(line =>
  [...line.matchAll(/\(([^)]*)\)/g)].map(m => m[1].trim().split(/\s+/).filter(Boolean).map(Number))
)
for (const cycles of cycleLists) for (const c of cycles) for (const x of c) degree = Math.max(degree, x)

const identity: Perm = Array.from({ length: degree }, (_, i) => i)
// "a then b"
const compose = (a: Perm, b: Perm): Perm => a.map(x => b[x])
const inverse = (a: Perm): Perm => {
  const r = new Array<number>(degree)
  a.forEach((x, i) => (r[x] = i))
  return r
}

const reps: (Perm | null)[][] = []
const repInv: (Perm | null)[][] = []
const orbits: number[][] = []
const levelGens: Perm[][] = []
for (let k = 0; k < degree; k++) {
  reps.push(new Array<Perm | null>(degree).fill(null))
  repInv.push(new Array<Perm | null>(degree).fill(null))
  reps[k][k] = identity
  repInv[k][k] = identity
  orbits.push([k])
  levelGens.push([])
}

const extend = (t: Perm, level: number): void => {
  const y = t[level]
  const inv = repInv[level][y]
  if (inv) {
    addElement(compose(t, inv))
    return
  }
  reps[level][y] = t
  repInv[level][y] = inverse(t)
  orbits[level].push(y)
  for (let m = level; m < degree; m++) for (const s of levelGens[m]) extend(compose(t, s), level)
}

function addElement(g: Perm): void {
  let level = 0
  for (; level < degree; level++) {
    const inv = repInv[level][g[level]]
    if (!inv) break
    g = compose(g, inv)
  }
  if (level === degree) return
  levelGens[level].push(g)
  // Own level first: g's orbit point is new there, which guarantees progress
  for (let m = level; m >= 0; m--) {
    for (const y of [...orbits[m]]) extend(compose(reps[m][y] as Perm, g), m)
  }
}

for (const cycles of cycleLists) {
  const p = [...identity]
  for (const c of cycles) c.forEach((x, i) => (p[x - 1] = c[(i + 1) % c.length] - 1))
  addElement(p)
}

console.log(orbits.reduce((acc, o) => acc * o.length, 1))
