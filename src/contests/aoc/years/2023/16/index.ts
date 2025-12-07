import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"
import { Direction } from "../../../../../utils/grid.js"

// 🎄 Advent of Code 2023 - Day 16

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

const DIRS: Record<Direction, Vector2> = {
  up: new Vector2(0, -1),
  down: new Vector2(0, 1),
  left: new Vector2(-1, 0),
  right: new Vector2(1, 0),
}

function simulate(grid: string[][], startPos: Vector2, startDir: Direction): number {
  const energized = new Set<string>()
  const visited = new Set<string>()
  const beams: { pos: Vector2; dir: Direction }[] = [{ pos: startPos, dir: startDir }]

  while (beams.length > 0) {
    const beam = beams.pop()!
    const { pos, dir } = beam

    if (pos.x < 0 || pos.x >= grid[0].length || pos.y < 0 || pos.y >= grid.length) {
      continue
    }

    const key = `${pos.str()},${dir}`
    if (visited.has(key)) continue
    visited.add(key)
    energized.add(pos.str())

    const cell = grid[pos.y][pos.x]
    let nextDirs: Direction[] = []

    if (cell === ".") {
      nextDirs = [dir]
    } else if (cell === "/") {
      const reflect: Record<Direction, Direction> = { up: "right", right: "up", down: "left", left: "down" }
      nextDirs = [reflect[dir]]
    } else if (cell === "\\") {
      const reflect: Record<Direction, Direction> = { up: "left", left: "up", down: "right", right: "down" }
      nextDirs = [reflect[dir]]
    } else if (cell === "|") {
      if (dir === "left" || dir === "right") {
        nextDirs = ["up", "down"]
      } else {
        nextDirs = [dir]
      }
    } else if (cell === "-") {
      if (dir === "up" || dir === "down") {
        nextDirs = ["left", "right"]
      } else {
        nextDirs = [dir]
      }
    }

    for (const nextDir of nextDirs) {
      beams.push({ pos: pos.add(DIRS[nextDir]), dir: nextDir })
    }
  }

  return energized.size
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  return simulate(grid, new Vector2(0, 0), "right")
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  let maxEnergized = 0

  // Top and bottom edges
  for (let x = 0; x < grid[0].length; x++) {
    maxEnergized = Math.max(maxEnergized, simulate(grid, new Vector2(x, 0), "down"))
    maxEnergized = Math.max(maxEnergized, simulate(grid, new Vector2(x, grid.length - 1), "up"))
  }

  // Left and right edges
  for (let y = 0; y < grid.length; y++) {
    maxEnergized = Math.max(maxEnergized, simulate(grid, new Vector2(0, y), "right"))
    maxEnergized = Math.max(maxEnergized, simulate(grid, new Vector2(grid[0].length - 1, y), "left"))
  }

  return maxEnergized
}

const EXAMPLE = `
.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 46,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 51,
      },
    ],
  },
} as AdventOfCodeContest
