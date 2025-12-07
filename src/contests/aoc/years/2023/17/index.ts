import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { PriorityQueue } from "../../../../../utils/structures/priority-queue.js"

// 🎄 Advent of Code 2023 - Day 17

function parseInput(input: string) {
  return utils.input.readGrid(input).map(row => row.map(Number))
}

type Dir = 0 | 1 | 2 | 3 // up, right, down, left
const DX = [0, 1, 0, -1]
const DY = [-1, 0, 1, 0]
type QueueNode = [number, number, Dir, number, number]

function solve(grid: number[][], minStraight: number, maxStraight: number): number {
  const height = grid.length
  const width = grid[0].length

  // State: [x, y, direction, straightCount]
  const pq = new PriorityQueue<QueueNode>(
    (a: QueueNode) => a[4],
    (a, b) => a - b
  )

  // Start going right or down
  pq.add([0, 0, 1, 0, 0]) // right
  pq.add([0, 0, 2, 0, 0]) // down

  const visited = new Set<string>()

  while (!pq.isEmpty()) {
    const [x, y, dir, straight, cost] = pq.poll()!

    if (x === width - 1 && y === height - 1 && straight >= minStraight) {
      return cost
    }

    const key = `${x},${y},${dir},${straight}`
    if (visited.has(key)) continue
    visited.add(key)

    // Try continuing straight
    if (straight < maxStraight) {
      const nx = x + DX[dir]
      const ny = y + DY[dir]
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        pq.add([nx, ny, dir, straight + 1, cost + grid[ny][nx]])
      }
    }

    // Try turning left or right (only if we've gone minStraight)
    if (straight >= minStraight) {
      for (const turn of [-1, 1]) {
        const newDir = ((dir + turn + 4) % 4) as Dir
        const nx = x + DX[newDir]
        const ny = y + DY[newDir]
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          pq.add([nx, ny, newDir, 1, cost + grid[ny][nx]])
        }
      }
    }
  }

  return -1
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  return solve(grid, 1, 3)
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  return solve(grid, 4, 10)
}

const EXAMPLE = `
2413432311323
3215453535623
3255245654254
3446585845452
4546657867536
1438598798454
4457876987766
3637877979653
4654967986887
4564679986453
1224686865563
2546548887735
4322674655533`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 102,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 94,
      },
    ],
  },
} as AdventOfCodeContest
