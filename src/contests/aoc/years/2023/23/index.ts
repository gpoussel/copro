import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 23

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

const DIRS: Record<string, [number, number][]> = {
  ".": [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ],
  "^": [[0, -1]],
  v: [[0, 1]],
  "<": [[-1, 0]],
  ">": [[1, 0]],
}

function findLongestPath(grid: string[][], ignoreSlopes: boolean): number {
  const height = grid.length
  const width = grid[0].length
  const start: [number, number] = [1, 0]
  const end: [number, number] = [width - 2, height - 1]

  // Build a compressed graph of junction points
  const junctions = new Set<string>()
  junctions.add(`${start[0]},${start[1]}`)
  junctions.add(`${end[0]},${end[1]}`)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === "#") continue
      let neighbors = 0
      for (const [dx, dy] of [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ]) {
        const nx = x + dx,
          ny = y + dy
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny][nx] !== "#") {
          neighbors++
        }
      }
      if (neighbors > 2) junctions.add(`${x},${y}`)
    }
  }

  // Build edges between junctions
  const graph = new Map<string, Map<string, number>>()
  for (const j of junctions) graph.set(j, new Map())

  for (const junc of junctions) {
    const [jx, jy] = junc.split(",").map(Number)
    const queue: [number, number, number][] = [[jx, jy, 0]]
    const visited = new Set<string>([junc])

    while (queue.length) {
      const [x, y, dist] = queue.shift()!

      if (dist > 0 && junctions.has(`${x},${y}`)) {
        graph.get(junc)!.set(`${x},${y}`, dist)
        continue
      }

      const cell = grid[y][x]
      const dirs = ignoreSlopes
        ? [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
          ]
        : DIRS[cell] || []

      for (const [dx, dy] of dirs) {
        const nx = x + dx,
          ny = y + dy
        const key = `${nx},${ny}`
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny][nx] !== "#" && !visited.has(key)) {
          visited.add(key)
          queue.push([nx, ny, dist + 1])
        }
      }
    }
  }

  // DFS to find longest path
  const startKey = `${start[0]},${start[1]}`
  const endKey = `${end[0]},${end[1]}`

  function dfs(node: string, visited: Set<string>): number {
    if (node === endKey) return 0

    let maxDist = -Infinity
    visited.add(node)

    for (const [neighbor, dist] of graph.get(node)!) {
      if (!visited.has(neighbor)) {
        const result = dfs(neighbor, visited)
        if (result !== -Infinity) {
          maxDist = Math.max(maxDist, dist + result)
        }
      }
    }

    visited.delete(node)
    return maxDist
  }

  return dfs(startKey, new Set())
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  return findLongestPath(grid, false)
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  return findLongestPath(grid, true)
}

const EXAMPLE = `
#.#####################
#.......#########...###
#######.#########.#.###
###.....#.>.>.###.#.###
###v#####.#v#.###.#.###
###.>...#.#.#.....#...#
###v###.#.#.#########.#
###...#.#.#.......#...#
#####.#.#.#######.#.###
#.....#.#.#.......#...#
#.#####.#.#.#########v#
#.#...#...#...###...>.#
#.#.#v#######v###.###v#
#...#.>.#...>.>.#.###.#
#####v#.#.###v#.#.###.#
#.....#...#...#.#.#...#
#.#########.###.#.#.###
#...###...#...#...#.###
###.###.#.###v#####v###
#...#...#.#.>.>.#.>.###
#.###.###.#.###.#.#v###
#.....###...###...#...#
#####################.#`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 94,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 154,
      },
    ],
  },
} as AdventOfCodeContest
