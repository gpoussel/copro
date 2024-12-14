import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2024 - Day 8

const MARKER = "#" as const

function parseInput(input: string) {
  const grid = utils.input.readGrid(input)
  const characters = utils.grid.uniqueElements(grid).filter(char => char !== ".")
  return { grid, characters }
}

function part1(inputString: string) {
  const { grid, characters } = parseInput(inputString)
  const updatedGrid = utils.grid.clone(grid)
  for (const character of characters) {
    const positions = utils.grid.iterate(
      grid,
      (_item, x, y) => new Vector2(x, y),
      item => item === character
    )
    for (let i = 0; i < positions.length; i++) {
      const p1 = positions[i]
      for (let j = i + 1; j < positions.length; j++) {
        const p2 = positions[j]
        const delta = p2.subtract(p1)
        const antinode1 = p1.subtract(delta)
        utils.grid.set(updatedGrid, antinode1, MARKER)
        const antinode2 = p2.add(delta)
        utils.grid.set(updatedGrid, antinode2, MARKER)
      }
    }
  }
  return utils.grid.countBy(updatedGrid, cell => cell === MARKER)
}

function part2(inputString: string) {
  const { grid, characters } = parseInput(inputString)
  const updatedGrid = utils.grid.clone(grid)
  for (const character of characters) {
    const positions = utils.grid.iterate(
      grid,
      (_item, x, y) => new Vector2(x, y),
      item => item === character
    )
    for (let i = 0; i < positions.length; i++) {
      const p1 = positions[i]
      for (let j = i + 1; j < positions.length; j++) {
        const p2 = positions[j]
        const delta = p2.subtract(p1)
        for (let { antinode, sign } of [
          { antinode: p1, sign: -1 },
          { antinode: p2, sign: 1 },
        ]) {
          while (utils.grid.inBounds(updatedGrid, antinode)) {
            utils.grid.set(updatedGrid, antinode, MARKER)
            antinode = antinode[sign > 0 ? "add" : "subtract"](delta)
          }
        }
      }
    }
  }
  return utils.grid.countBy(updatedGrid, cell => cell === MARKER)
}

const EXAMPLE = `
............
........0...
.....0......
.......0....
....0.......
......A.....
............
............
........A...
.........A..
............
............
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 14,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 34,
      },
    ],
  },
} as AdventOfCodeContest
