// 🎮 CodinGame Puzzle - particle-detection-with-cloud-chamber
// https://www.codingame.com/training/medium/particle-detection-with-cloud-chamber

const picWidth = +readline()
const picHeight = +readline()
const fieldB = parseFloat(readline())
const speedV = parseFloat(readline())
const pts: [number, number][] = []
for (let y = 0; y < picHeight; y++) {
  const line = readline()
  for (let x = 0; x < picWidth; x++) if (line[x] === " ") pts.push([x + 0.5, y + 0.5])
}

// Solve a 3x3 linear system with Gaussian elimination; null when (nearly) singular
const solve3 = (m: number[][], rhs: number[]): number[] | null => {
  const a = m.map((row, i) => row.concat([rhs[i]]))
  for (let col = 0; col < 3; col++) {
    let pivot = col
    for (let r = col + 1; r < 3; r++) if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r
    if (Math.abs(a[pivot][col]) < 1e-9) return null
    const tmp = a[col]
    a[col] = a[pivot]
    a[pivot] = tmp
    for (let r = 0; r < 3; r++) {
      if (r === col) continue
      const f = a[r][col] / a[col][col]
      for (let k = col; k < 4; k++) a[r][k] -= f * a[col][k]
    }
  }
  return [a[0][3] / a[0][0], a[1][3] / a[1][1], a[2][3] / a[2][2]]
}

// Algebraic circle fit (Kasa) on centred coordinates, refined by Gauss-Newton on geometric distances
const fitRadius = (): number => {
  const n = pts.length
  let mx = 0
  let my = 0
  for (const [x, y] of pts) {
    mx += x / n
    my += y / n
  }
  const p = pts.map(([x, y]) => [x - mx, y - my])
  let suu = 0,
    suv = 0,
    svv = 0,
    su = 0,
    sv = 0,
    szu = 0,
    szv = 0,
    sz = 0
  for (const [u, v] of p) {
    const z = u * u + v * v
    suu += u * u
    suv += u * v
    svv += v * v
    su += u
    sv += v
    szu += z * u
    szv += z * v
    sz += z
  }
  // z + D u + E v + F = 0
  const sol = solve3(
    [
      [suu, suv, su],
      [suv, svv, sv],
      [su, sv, n],
    ],
    [-szu, -szv, -sz]
  )
  if (sol === null) return Infinity
  let cx = -sol[0] / 2
  let cy = -sol[1] / 2
  const r2 = cx * cx + cy * cy - sol[2]
  if (!(r2 > 0)) return Infinity
  let r = Math.sqrt(r2)
  if (r > 1e6) return Infinity
  for (let iter = 0; iter < 50; iter++) {
    const jtj = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    const jtr = [0, 0, 0]
    for (const [u, v] of p) {
      const dx = u - cx
      const dy = v - cy
      const d = Math.sqrt(dx * dx + dy * dy) || 1e-12
      const res = d - r
      const jac = [-dx / d, -dy / d, -1]
      for (let i = 0; i < 3; i++) {
        jtr[i] -= jac[i] * res
        for (let k = 0; k < 3; k++) jtj[i][k] += jac[i] * jac[k]
      }
    }
    const step = solve3(jtj, jtr)
    if (step === null) break
    cx += step[0]
    cy += step[1]
    r += step[2]
    if (Math.abs(step[0]) + Math.abs(step[1]) + Math.abs(step[2]) < 1e-10) break
  }
  return r
}

const PARTICLES: [string, number, number][] = [
  ["e-", 1, 0.511],
  ["p+", 1, 938.0],
  ["alpha", 2, 3727.0],
  ["pi+", 1, 140.0],
]

const radius = fitRadius()
if (!isFinite(radius) || radius > 10 * Math.max(picWidth, picHeight)) {
  console.log("n0 inf")
} else {
  const gamma = 1 / Math.sqrt(1 - speedV * speedV)
  const measured = (1e6 * gamma * speedV) / (fieldB * radius * 299792458)
  let bestSymbol = ""
  let bestError = 0.5
  for (const [symbol, charge, mass] of PARTICLES) {
    const expected = charge / mass
    const error = Math.abs(expected - measured) / expected
    if (error < bestError) {
      bestError = error
      bestSymbol = symbol
    }
  }
  console.log(
    bestSymbol === "" ? "I just won the Nobel prize in physics !" : `${bestSymbol} ${Math.round(radius / 10) * 10}`
  )
}
