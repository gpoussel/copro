import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2023 - Day 10

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

// Define connections for each pipe type
const PIPE_CONNECTIONS: Record<string, Vector2[]> = {
  "|": [new Vector2(0, -1), new Vector2(0, 1)], // north, south
  "-": [new Vector2(-1, 0), new Vector2(1, 0)], // west, east
  L: [new Vector2(0, -1), new Vector2(1, 0)], // north, east
  J: [new Vector2(0, -1), new Vector2(-1, 0)], // north, west
  "7": [new Vector2(0, 1), new Vector2(-1, 0)], // south, west
  F: [new Vector2(0, 1), new Vector2(1, 0)], // south, east
  ".": [],
  S: [], // Will be determined dynamically
}

function findStart(grid: string[][]): Vector2 {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "S") {
        return new Vector2(x, y)
      }
    }
  }
  throw new Error("No start found")
}

function getConnections(grid: string[][], pos: Vector2): Vector2[] {
  const char = grid[pos.y]?.[pos.x]
  if (!char) return []
  return PIPE_CONNECTIONS[char] || []
}

function connects(grid: string[][], from: Vector2, to: Vector2): boolean {
  const char = grid[to.y]?.[to.x]
  if (!char) return false
  const connections = PIPE_CONNECTIONS[char] || []
  // Check if 'to' connects back to 'from'
  return connections.some(c => to.add(c).equals(from))
}

function findLoop(grid: string[][]): Vector2[] {
  const start = findStart(grid)

  // Find which directions connect to S
  const directions = [
    new Vector2(0, -1), // north
    new Vector2(0, 1), // south
    new Vector2(-1, 0), // west
    new Vector2(1, 0), // east
  ]

  // Find the two pipes that connect to S
  const connectingDirs = directions.filter(dir => {
    const neighbor = start.add(dir)
    return connects(grid, start, neighbor)
  })

  if (connectingDirs.length !== 2) {
    throw new Error("S should connect to exactly 2 pipes")
  }

  // Walk the loop
  const loop: Vector2[] = [start]
  let current = start.add(connectingDirs[0])
  let prev = start

  while (!current.equals(start)) {
    loop.push(current)
    const char = grid[current.y][current.x]
    const connections = PIPE_CONNECTIONS[char]
    const next = connections.map(c => current.add(c)).find(n => !n.equals(prev))!
    prev = current
    current = next
  }

  return loop
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  const loop = findLoop(grid)
  return Math.floor(loop.length / 2)
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  const loop = findLoop(grid)
  const loopSet = new Set(loop.map(p => p.str()))

  // Determine what S actually is
  const start = findStart(grid)
  const directions = [
    { dir: new Vector2(0, -1), name: "N" },
    { dir: new Vector2(0, 1), name: "S" },
    { dir: new Vector2(-1, 0), name: "W" },
    { dir: new Vector2(1, 0), name: "E" },
  ]
  const connectingDirs = directions
    .filter(({ dir }) => connects(grid, start, start.add(dir)))
    .map(({ name }) => name)
    .sort()
    .join("")

  const sReplacement: Record<string, string> = {
    NS: "|",
    EW: "-",
    NE: "L",
    NW: "J",
    SW: "7",
    ES: "F",
  }
  grid[start.y][start.x] = sReplacement[connectingDirs]

  // Use ray casting to count enclosed tiles
  // For each tile, count how many times we cross the loop going left
  // If odd, we're inside
  let count = 0
  for (let y = 0; y < grid.length; y++) {
    let inside = false
    let lastCorner = ""
    for (let x = 0; x < grid[y].length; x++) {
      const pos = new Vector2(x, y)
      const char = grid[y][x]

      if (loopSet.has(pos.str())) {
        // On the loop - check if we're crossing it
        if (char === "|") {
          inside = !inside
        } else if (char === "L" || char === "F") {
          lastCorner = char
        } else if (char === "J") {
          if (lastCorner === "F") inside = !inside
          lastCorner = ""
        } else if (char === "7") {
          if (lastCorner === "L") inside = !inside
          lastCorner = ""
        }
      } else {
        if (inside) count++
      }
    }
  }

  return count
}

const EXAMPLE1 = `
.....
.S-7.
.|.|.
.L-J.
.....`

const EXAMPLE2 = `
..F7.
.FJ|.
SJ.L7
|F--J
LJ...`

const EXAMPLE3 = `
...........
.S-------7.
.|F-----7|.
.||.....||.
.||.....||.
.|L-7.F-J|.
.|..|.|..|.
.L--J.L--J.
...........`

const EXAMPLE4 = `
.F----7F7F7F7F-7....
.|F--7||||||||FJ....
.||.FJ||||||||L7....
FJL7L7LJLJ||LJ.L-7..
L--J.L7...LJS7F-7L7.
....F-J..F7FJ|L7L7L7
....L7.F7||L7|.L7L7|
.....|FJLJ|FJ|F7|.LJ
....FJL-7.||.||||...
....L---J.LJ.LJLJ...`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 4,
      },
      {
        input: EXAMPLE2,
        expected: 8,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE3,
        expected: 4,
      },
      {
        input: EXAMPLE4,
        expected: 8,
      },
    ],
  },
} as AdventOfCodeContest
