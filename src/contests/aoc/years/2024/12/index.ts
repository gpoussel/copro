import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { Direction } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VECTOR2_COMPARATOR_XY, VECTOR2_COMPARATOR_YX, Vector2Set } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2024 - Day 12

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function visit(input: string[][], x: number, y: number) {
  const queue = new Vector2Set([new Vector2(x, y)])
  const visited = new Vector2Set()
  const element = input[y][x]
  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.contains(current)) {
      continue
    }
    visited.add(current)
    for (const neighbor of current.plusShapeNeighbors()) {
      if (utils.grid.at(input, neighbor) === element) {
        queue.add(neighbor)
      }
    }
    input[current.y][current.x] = utils.grid.VISITED
  }
  return { visited }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return utils.grid
    .iterate(
      input,
      (_element, x, y) => {
        const { visited } = visit(input, x, y)
        const area = visited.length
        const perimeter = visited.reduce((acc, current) => {
          return acc + current.plusShapeNeighbors().filter(d => visited.doesNotContain(d)).length
        }, 0)
        return area * perimeter
      },
      element => element !== utils.grid.VISITED
    )
    .reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return utils.grid
    .iterate(
      input,
      (_element, x, y) => {
        const { visited } = visit(input, x, y)
        const area = visited.length
        const horizontalEdges = (["up", "down"] as Direction[]).flatMap(dir =>
          visited
            .map(cell => cell.move(dir))
            .filter(d => visited.doesNotContain(d))
            .sort(VECTOR2_COMPARATOR_YX)
            .reduce((acc: Vector2[], current: Vector2) => {
              if (acc.length === 0) {
                return [current]
              }
              const last = acc[acc.length - 1]
              if (last.y === current.y && last.x + 1 === current.x) {
                return [...acc.slice(0, -1), current]
              }
              return [...acc, current]
            }, [])
        )
        const verticalEdges = (["left", "right"] as Direction[]).flatMap(dir =>
          visited
            .map(cell => cell.move(dir))
            .filter(d => visited.doesNotContain(d))
            .sort(VECTOR2_COMPARATOR_XY)
            .reduce((acc: Vector2[], current: Vector2) => {
              if (acc.length === 0) {
                return [current]
              }
              const last = acc[acc.length - 1]
              if (last.x === current.x && last.y + 1 === current.y) {
                return [...acc.slice(0, -1), current]
              }
              return [...acc, current]
            }, [])
        )
        return area * (horizontalEdges.length + verticalEdges.length)
      },
      element => element !== utils.grid.VISITED
    )
    .reduce((a, b) => a + b, 0)
}

const EXAMPLE1 = `
AAAA
BBCD
BBCC
EEEC
`
const EXAMPLE2 = `
OOOOO
OXOXO
OOOOO
OXOXO
OOOOO
`
const EXAMPLE3 = `
RRRRIICCFF
RRRRIICCCF
VVRRRCCFFF
VVRCCCJFFF
VVVVCJJCFE
VVIVCCJJEE
VVIIICJJEE
MIIIIIJJEE
MIIISIJEEE
MMMISSJEEE
`

const EXAMPLE4 = `
EEEEE
EXXXX
EEEEE
EXXXX
EEEEE
`

const EXAMPLE5 = `
AAAAAA
AAABBA
AAABBA
ABBAAA
ABBAAA
AAAAAA
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 140,
      },
      {
        input: EXAMPLE2,
        expected: 772,
      },
      {
        input: EXAMPLE3,
        expected: 1930,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE1,
        expected: 80,
      },
      {
        input: EXAMPLE2,
        expected: 436,
      },
      {
        input: EXAMPLE4,
        expected: 236,
      },
      {
        input: EXAMPLE5,
        expected: 368,
      },
      {
        input: EXAMPLE3,
        expected: 1206,
      },
    ],
  },
} as AdventOfCodeContest
