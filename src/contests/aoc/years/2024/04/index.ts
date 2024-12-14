import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2024 - Day 4

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return utils.grid
    .iterate(
      input,
      (_, x, y) =>
        utils.grid.HEADING_DIRECTIONS.filter(heading => {
          const position = new Vector2(x, y)
          return (
            utils.grid.at(input, position.move(heading, 1)) === "M" &&
            utils.grid.at(input, position.move(heading, 2)) === "A" &&
            utils.grid.at(input, position.move(heading, 3)) === "S"
          )
        }).length,
      cell => cell === "X"
    )
    .reduce((a: number, b: number) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return utils.grid
    .iterate(
      input,
      (_, x, y) => {
        const position = new Vector2(x, y)
        const upLeft = utils.grid.at(input, position.move("up-left"))
        const upRight = utils.grid.at(input, position.move("up-right"))
        const downLeft = utils.grid.at(input, position.move("down-left"))
        const downRight = utils.grid.at(input, position.move("down-right"))
        return ((upLeft === "S" && downRight === "M") || (upLeft === "M" && downRight === "S")) &&
          ((upRight === "S" && downLeft === "M") || (upRight === "M" && downLeft === "S"))
          ? 1
          : 0
      },
      cell => cell === "A"
    )
    .reduce((a: number, b: number) => a + b, 0)
}

const EXAMPLE = `
MMMSXXMASM
MSAMXMSMSA
AMXSXMAAMM
MSAMASMSMX
XMASAMXAMM
XXAMMXXAMA
SMSMSASXSS
SAXAMASAAA
MAMMMXMMMM
MXMXAXMASX
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 18,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: undefined,
      },
    ],
  },
} as AdventOfCodeContest
