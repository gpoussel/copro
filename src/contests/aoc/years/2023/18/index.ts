import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 18

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [dir, distStr, color] = line.split(" ")
    return { dir, dist: +distStr, color: color.slice(1, -1) }
  })
}

const DIRS: Record<string, [number, number]> = {
  U: [0, -1],
  D: [0, 1],
  L: [-1, 0],
  R: [1, 0],
}

function calculateArea(instructions: { dir: string; dist: number }[]): number {
  // Shoelace formula + Pick's theorem
  const vertices: [number, number][] = [[0, 0]]
  let perimeter = 0

  for (const { dir, dist } of instructions) {
    const [dx, dy] = DIRS[dir]
    const [lastX, lastY] = vertices[vertices.length - 1]
    vertices.push([lastX + dx * dist, lastY + dy * dist])
    perimeter += dist
  }

  // Shoelace formula for area
  let area = 0
  for (let i = 0; i < vertices.length - 1; i++) {
    area += vertices[i][0] * vertices[i + 1][1]
    area -= vertices[i + 1][0] * vertices[i][1]
  }
  area = Math.abs(area) / 2

  // Pick's theorem: A = i + b/2 - 1, so i = A - b/2 + 1
  // Total = i + b = A + b/2 + 1
  return area + perimeter / 2 + 1
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return calculateArea(input)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const dirMap = ["R", "D", "L", "U"]

  const instructions = input.map(({ color }) => {
    const hex = color.slice(1)
    const dist = parseInt(hex.slice(0, 5), 16)
    const dir = dirMap[+hex[5]]
    return { dir, dist }
  })

  return calculateArea(instructions)
}

const EXAMPLE = `
R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 62,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 952408144115,
      },
    ],
  },
} as AdventOfCodeContest
