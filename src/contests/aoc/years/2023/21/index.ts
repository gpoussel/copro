import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 21

function parseInput(input: string) {
  const grid = utils.input.readGrid(input)
  let start: [number, number] = [0, 0]
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "S") {
        start = [x, y]
        grid[y][x] = "."
      }
    }
  }
  return { grid, start }
}

function countReachable(grid: string[][], start: [number, number], maxSteps: number): number {
  const height = grid.length
  const width = grid[0].length
  const visited = new Map<string, number>()
  const queue: [number, number, number][] = [[start[0], start[1], 0]]

  while (queue.length) {
    const [x, y, steps] = queue.shift()!
    const key = `${x},${y}`

    if (visited.has(key)) continue
    visited.set(key, steps)

    if (steps >= maxSteps) continue

    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny][nx] === ".") {
        const nkey = `${nx},${ny}`
        if (!visited.has(nkey)) {
          queue.push([nx, ny, steps + 1])
        }
      }
    }
  }

  let count = 0
  for (const steps of visited.values()) {
    if (steps % 2 === maxSteps % 2) count++
  }
  return count
}

function part1(inputString: string) {
  const { grid, start } = parseInput(inputString)
  return countReachable(grid, start, grid.length < 20 ? 6 : 64)
}

function part2(inputString: string) {
  const { grid, start } = parseInput(inputString)
  const size = grid.length // Assume square grid
  const steps = 26501365

  // Steps = 65 + 202300 * 131, where 131 is grid size, 65 is distance to edge
  // Use quadratic interpolation
  const n = Math.floor(steps / size)
  const rem = steps % size

  // Calculate for rem, rem+size, rem+2*size steps in infinite grid
  const values: number[] = []

  for (let i = 0; i < 3; i++) {
    const targetSteps = rem + i * size
    const visited = new Map<string, number>()
    const queue: [number, number, number][] = [[start[0], start[1], 0]]

    while (queue.length) {
      const [x, y, s] = queue.shift()!
      const key = `${x},${y}`

      if (visited.has(key)) continue
      visited.set(key, s)

      if (s >= targetSteps) continue

      for (const [dx, dy] of [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ]) {
        const nx = x + dx
        const ny = y + dy
        // Wrap coordinates for infinite grid
        const gy = ((ny % size) + size) % size
        const gx = ((nx % size) + size) % size
        if (grid[gy][gx] === ".") {
          const nkey = `${nx},${ny}`
          if (!visited.has(nkey)) {
            queue.push([nx, ny, s + 1])
          }
        }
      }
    }

    let count = 0
    for (const s of visited.values()) {
      if (s % 2 === targetSteps % 2) count++
    }
    values.push(count)
  }

  // Quadratic interpolation: f(n) = a*n^2 + b*n + c
  // f(0) = values[0], f(1) = values[1], f(2) = values[2]
  const c = values[0]
  const a = (values[2] - 2 * values[1] + values[0]) / 2
  const b = values[1] - values[0] - a

  return a * n * n + b * n + c
}

const EXAMPLE = `
...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 16,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
