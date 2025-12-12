import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2025 - Quest 20

function parseInput(input: string) {
  const sections = input
    .trim()
    .split(/\n\s*\n/)
    .map(section => section.split("\n").filter(line => line.trim().length > 0))
  return sections.map(section => {
    const maxLen = Math.max(...section.map(l => l.length))
    return section.map(line => line.padEnd(maxLen, "."))
  })
}

function part1(inputString: string) {
  const sections = parseInput(inputString)
  let total = 0
  for (const lines of sections) {
    const grid = lines.map(line => line.split(""))
    const rows = grid.length
    const cols = grid[0].length
    let count = 0
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] === "T") {
          const parity = (i + j) % 2
          let neighbors: Array<[number, number]> = []
          if (parity === 0) {
            neighbors = [
              [i, j - 1],
              [i, j + 1],
              [i - 1, j],
            ]
          } else {
            neighbors = [
              [i, j - 1],
              [i, j + 1],
              [i + 1, j],
            ]
          }
          for (const [ni, nj] of neighbors) {
            if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && grid[ni][nj] === "T") {
              count++
            }
          }
        }
      }
    }
    total += count / 2
  }
  return total
}

function part2(inputString: string) {
  const sections = parseInput(inputString)
  let total = 0
  for (const lines of sections) {
    const triangle = Triangle.fromInput(lines)
    const start = triangle.start
    const target = triangle.end
    if (start.x === -1 || target.x === -1) {
      total += 0
      continue
    }
    const visited = new Set<string>()
    const q: Array<{ cell: Vector2; dist: number }> = []
    q.push({ cell: start, dist: 0 })
    visited.add(Triangle.key(start))
    let found = -1
    while (q.length > 0) {
      const cur = q.shift()!
      const cell = cur.cell
      const neighbors: Vector2[] = [
        new Vector2(cell.x + (Triangle.isDownVector2(cell) ? -1 : 1), cell.y),
        new Vector2(cell.x, cell.y + 1),
        new Vector2(cell.x, cell.y - 1),
      ]
      for (const nb of neighbors) {
        const k = Triangle.key(nb)
        if (triangle.cells.has(k) && !visited.has(k)) {
          if (nb.x === target.x && nb.y === target.y) {
            found = cur.dist + 1
            q.length = 0
            break
          }
          visited.add(k)
          q.push({ cell: nb, dist: cur.dist + 1 })
        }
      }
    }
    total += found >= 0 ? found : 0
  }
  return total
}

class Triangle {
  cells: Set<string>
  start: Vector2
  end: Vector2

  constructor(cells: Set<string>, start: Vector2, end: Vector2) {
    this.cells = cells
    this.start = start
    this.end = end
  }

  static key(cell: Vector2) {
    return cell.str()
  }

  static isDownVector2(cell: Vector2) {
    return cell.x % 2 === cell.y % 2
  }

  static fromInput(lines: string[]): Triangle {
    const tr = new Set<string>()
    let start: Vector2 = new Vector2(-1, -1)
    let end: Vector2 = new Vector2(-1, -1)
    const h = lines.length
    const w = lines[0].length
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        const ch = lines[r][c]
        if (ch === "S") start = new Vector2(r, c)
        if (ch === "E") end = new Vector2(r, c)
        if (ch === "T" || ch === "S" || ch === "E") tr.add(new Vector2(r, c).str())
      }
    }
    return new Triangle(tr, start, end)
  }

  static fromInputRotate120(lines: string[]): Triangle {
    const h = lines.length
    const w = lines[0].length
    const tr = new Set<string>()
    let end: Vector2 = new Vector2(-1, -1)
    let r = h - 1
    let c = Math.floor(w / 2)
    let rrr = 0
    while (r >= 0 && c < w) {
      let rr = r
      let cc = c
      let ccc = rrr
      while (rr >= 0 && cc >= 2 * Math.abs(Math.floor(w / 2) - c)) {
        const ch = lines[rr][cc]
        if (ch === "E") {
          end = new Vector2(rrr, ccc)
          tr.add(end.str())
        } else if (ch === "S" || ch === "T") {
          tr.add(new Vector2(rrr, ccc).str())
        }
        if (Triangle.isDownVector2(new Vector2(rr, cc))) {
          rr -= 1
        } else {
          cc -= 1
        }
        ccc += 1
      }
      rrr += 1
      r -= 1
      c += 1
    }
    return new Triangle(tr, new Vector2(-1, -1), end)
  }

  static fromInputRotate240(lines: string[]): Triangle {
    const h = lines.length
    const w = lines[0].length
    const tr = new Set<string>()
    let end: Vector2 = new Vector2(-1, -1)
    let rrr = 0
    for (let c = w - 1; c >= 0; c -= 2) {
      let rr = 0
      let cc = c
      let ccc = rrr
      while (rr < h && cc >= 0) {
        const ch = lines[rr][cc]
        if (ch === "E") {
          end = new Vector2(rrr, ccc)
          tr.add(end.str())
        } else if (ch === "S" || ch === "T") {
          tr.add(new Vector2(rrr, ccc).str())
        }
        if (Triangle.isDownVector2(new Vector2(rr, cc))) {
          cc -= 1
        } else {
          rr += 1
        }
        ccc += 1
      }
      rrr += 1
    }
    return new Triangle(tr, new Vector2(-1, -1), end)
  }
}

function part3(inputString: string) {
  const sections = parseInput(inputString)
  let total = 0
  for (const lines of sections) {
    const triangle0 = Triangle.fromInput(lines)
    const triangle120 = Triangle.fromInputRotate120(lines)
    const triangle240 = Triangle.fromInputRotate240(lines)
    const triangles = [triangle0, triangle120, triangle240]

    const start = triangle0.start
    if (start.x === -1) {
      total += 0
      continue
    }

    const visited: Array<Set<string>> = [new Set(), new Set(), new Set()]
    const queue: Array<{ cell: Vector2; lyr: number; dist: number }> = []
    queue.push({ cell: start, lyr: 0, dist: 0 })
    visited[0].add(Triangle.key(start))
    let found = -1

    while (queue.length > 0) {
      const cur = queue.shift()!
      const cell = cur.cell
      const lyr = cur.lyr
      const nlyr = (lyr + 1) % triangles.length

      const neighbors: Vector2[] = [
        cell,
        new Vector2(cell.x + (Triangle.isDownVector2(cell) ? -1 : 1), cell.y),
        new Vector2(cell.x, cell.y + 1),
        new Vector2(cell.x, cell.y - 1),
      ]

      for (const nb of neighbors) {
        const k = Triangle.key(nb)
        if (triangles[nlyr].cells.has(k) && !visited[nlyr].has(k)) {
          const target = triangles[nlyr].end
          if (nb.x === target.x && nb.y === target.y) {
            found = cur.dist + 1
            queue.length = 0
            break
          }
          visited[nlyr].add(k)
          queue.push({ cell: nb, lyr: nlyr, dist: cur.dist + 1 })
        }
      }
    }

    total += found >= 0 ? found : 0
  }
  return total
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
T#TTT###T##
.##TT#TT##.
..T###T#T..
...##TT#...
....T##....
.....#.....`,
        expected: 7,
      },
      {
        input: `
T#T#T#T#T#T
.#T#T#T#T#.
..#T###T#..
...##T##...
....#T#....
.....#.....`,
        expected: 0,
      },
      {
        input: `
T#T#T#T#T#T
.T#T#T#T#T.
..T#T#T#T..
...T#T#T...
....T#T....
.....T.....`,
        expected: 0,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
TTTTTTTTTTTTTTTTT
.TTTT#T#T#TTTTTT.
..TT#TTTETT#TTT..
...TT#T#TTT#TT...
....TTT#T#TTT....
.....TTTTTT#.....
......TT#TT......
.......#TT.......
........S........`,
        expected: 32,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
T####T#TTT##T##T#T#
.T#####TTTT##TTT##.
..TTTT#T###TTTT#T..
...T#TTT#ETTTT##...
....#TT##T#T##T....
.....#TT####T#.....
......T#TT#T#......
.......T#TTT.......
........TT#........
.........S.........`,
        expected: 23,
      },
    ],
  },
} as EverybodyCodesContest
