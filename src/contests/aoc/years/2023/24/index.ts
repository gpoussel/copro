import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 24

interface Hailstone {
  px: number
  py: number
  pz: number
  vx: number
  vy: number
  vz: number
}

function parseInput(input: string): Hailstone[] {
  return utils.input.lines(input).map(line => {
    const [pos, vel] = line.split(" @ ")
    const [px, py, pz] = pos.split(", ").map(Number)
    const [vx, vy, vz] = vel.split(", ").map(Number)
    return { px, py, pz, vx, vy, vz }
  })
}

function intersect2D(a: Hailstone, b: Hailstone): [number, number] | null {
  // Line a: p + t*v, Line b: q + s*w
  // Solve: px + t*vx = qx + s*wx, py + t*vy = qy + s*wy
  const det = a.vx * b.vy - a.vy * b.vx
  if (det === 0) return null // Parallel

  const t = ((b.px - a.px) * b.vy - (b.py - a.py) * b.vx) / det
  const s = ((b.px - a.px) * a.vy - (b.py - a.py) * a.vx) / det

  if (t < 0 || s < 0) return null // In the past

  return [a.px + t * a.vx, a.py + t * a.vy]
}

function part1(inputString: string) {
  const hailstones = parseInput(inputString)
  const isExample = hailstones.length < 10
  const minCoord = isExample ? 7 : 200000000000000
  const maxCoord = isExample ? 27 : 400000000000000
  let count = 0

  for (let i = 0; i < hailstones.length; i++) {
    for (let j = i + 1; j < hailstones.length; j++) {
      const intersection = intersect2D(hailstones[i], hailstones[j])
      if (intersection) {
        const [x, y] = intersection
        if (x >= minCoord && x <= maxCoord && y >= minCoord && y <= maxCoord) {
          count++
        }
      }
    }
  }

  return count
}

function part2(inputString: string) {
  const h = parseInput(inputString)

  // For rock with position (rx, ry, rz) and velocity (rvx, rvy, rvz)
  // At time ti, rock hits hailstone i: rx + ti*rvx = h[i].px + ti*h[i].vx
  // Rearranging: (rx - h[i].px) = ti * (h[i].vx - rvx)
  // ti = (rx - h[i].px) / (h[i].vx - rvx)
  // Same ti for y and z

  // Cross product trick: (p - pi) × (v - vi) = 0 for each hailstone
  // This gives us: p × v - p × vi - pi × v + pi × vi = 0
  // For two hailstones i and j: pi × vi - pj × vj = p × vi - p × vj + pi × v - pj × v
  // This is linear in the unknowns!

  // Using first 3 hailstones to set up equations
  // For x,y plane: (h[i].py - h[j].py)*rx + (h[j].px - h[i].px)*ry +
  //                (h[j].vy - h[i].vy)*rvx + (h[i].vx - h[j].vx)*rvy =
  //                h[j].px*h[j].vy - h[j].py*h[j].vx - h[i].px*h[i].vy + h[i].py*h[i].vx

  function cross2D(a: Hailstone, b: Hailstone): [number[], number] {
    // Coefficients for rx, ry, rvx, rvy
    const coeffs = [
      b.vy - a.vy, // rx
      a.vx - b.vx, // ry
      a.py - b.py, // rvx
      b.px - a.px, // rvy
    ]
    const rhs = a.py * a.vx - a.px * a.vy + b.px * b.vy - b.py * b.vx
    return [coeffs, rhs]
  }

  function cross2DXZ(a: Hailstone, b: Hailstone): [number[], number] {
    // Coefficients for rx, rz, rvx, rvz
    const coeffs = [
      b.vz - a.vz, // rx
      a.vx - b.vx, // rz
      a.pz - b.pz, // rvx
      b.px - a.px, // rvz
    ]
    const rhs = a.pz * a.vx - a.px * a.vz + b.px * b.vz - b.pz * b.vx
    return [coeffs, rhs]
  }

  // Gaussian elimination
  function solve(matrix: number[][], rhs: number[]): number[] {
    const n = matrix.length
    const aug = matrix.map((row, i) => [...row, rhs[i]])

    for (let col = 0; col < n; col++) {
      // Find pivot
      let maxRow = col
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) {
          maxRow = row
        }
      }
      ;[aug[col], aug[maxRow]] = [aug[maxRow], aug[col]]

      // Eliminate
      for (let row = col + 1; row < n; row++) {
        const factor = aug[row][col] / aug[col][col]
        for (let j = col; j <= n; j++) {
          aug[row][j] -= factor * aug[col][j]
        }
      }
    }

    // Back substitution
    const solution = new Array(n).fill(0)
    for (let i = n - 1; i >= 0; i--) {
      solution[i] = aug[i][n]
      for (let j = i + 1; j < n; j++) {
        solution[i] -= aug[i][j] * solution[j]
      }
      solution[i] /= aug[i][i]
    }

    return solution
  }

  // Build system for x,y (using pairs 0-1, 0-2, 0-3, 0-4)
  const xyMatrix: number[][] = []
  const xyRhs: number[] = []
  for (const [i, j] of [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
  ]) {
    const [coeffs, rhs] = cross2D(h[i], h[j])
    xyMatrix.push(coeffs)
    xyRhs.push(rhs)
  }

  const [rx, ry, rvx, rvy] = solve(xyMatrix, xyRhs)

  // Build system for x,z
  const xzMatrix: number[][] = []
  const xzRhs: number[] = []
  for (const [i, j] of [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
  ]) {
    const [coeffs, rhs] = cross2DXZ(h[i], h[j])
    xzMatrix.push(coeffs)
    xzRhs.push(rhs)
  }

  const [rx2, rz, rvx2, rvz] = solve(xzMatrix, xzRhs)

  return Math.round(rx) + Math.round(ry) + Math.round(rz)
}

const EXAMPLE = `
19, 13, 30 @ -2,  1, -2
18, 19, 22 @ -1, -1, -2
20, 25, 34 @ -2, -2, -4
12, 31, 28 @ -1, -2, -1
20, 19, 15 @  1, -5, -3`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 2,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 47,
      },
    ],
  },
} as AdventOfCodeContest
