import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2015 - Day 6

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const turnLightsMatch = line.match(/turn (on|off) (\d+),(\d+) through (\d+),(\d+)/)
    if (turnLightsMatch) {
      const [, action, x1, y1, x2, y2] = turnLightsMatch
      return { action, start: new Vector2(+x1, +y1), end: new Vector2(+x2, +y2) }
    }
    const toggleLightsMatch = line.match(/toggle (\d+),(\d+) through (\d+),(\d+)/)
    if (toggleLightsMatch) {
      const [, x1, y1, x2, y2] = toggleLightsMatch
      return { action: "toggle", start: new Vector2(+x1, +y1), end: new Vector2(+x2, +y2) }
    }
    throw new Error(`Invalid input: ${line}`)
  })
}

function part1(inputString: string) {
  const instructions = parseInput(inputString)
  const grid = Array.from({ length: 1000 }, () => Array.from({ length: 1000 }, () => false))
  for (const instruction of instructions) {
    for (let x = instruction.start.x; x <= instruction.end.x; x++) {
      for (let y = instruction.start.y; y <= instruction.end.y; y++) {
        switch (instruction.action) {
          case "on":
            grid[x][y] = true
            break
          case "off":
            grid[x][y] = false
            break
          case "toggle":
            grid[x][y] = !grid[x][y]
            break
        }
      }
    }
  }
  return grid.flat().filter(Boolean).length
}

function part2(inputString: string) {
  const instructions = parseInput(inputString)
  const brightness = Array.from({ length: 1000 }, () => Array.from({ length: 1000 }, () => 0))
  for (const instruction of instructions) {
    for (let x = instruction.start.x; x <= instruction.end.x; x++) {
      for (let y = instruction.start.y; y <= instruction.end.y; y++) {
        switch (instruction.action) {
          case "on":
            brightness[x][y]++
            break
          case "off":
            brightness[x][y] = Math.max(0, brightness[x][y] - 1)
            break
          case "toggle":
            brightness[x][y] += 2
            break
        }
      }
    }
  }
  return brightness.flat().reduce((a, b) => a + b, 0)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "turn on 0,0 through 999,999",
        expected: 1_000_000,
      },
      {
        input: "toggle 0,0 through 999,0",
        expected: 1_000,
      },
      {
        input: "turn off 499,499 through 500,500",
        expected: 0,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "toggle 0,0 through 999,999",
        expected: 2000000,
      },
    ],
  },
} as AdventOfCodeContest
