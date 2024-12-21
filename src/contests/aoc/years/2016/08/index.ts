import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 8

function parseInput(
  input: string
): (
  | { type: "rect"; width: number; height: number }
  | { type: "rotate"; axis: "x" | "y"; index: number; amount: number }
)[] {
  return utils.input.lines(input).map(line => {
    if (line.startsWith("rect")) {
      const [width, height] = line.match(/\d+/g)!.map(Number)
      return { type: "rect", width, height }
    }
    const [, axis, index, amount] = line.match(/(x|y)=(\d+) by (\d+)/)!
    return { type: "rotate", axis: axis as "x" | "y", index: +index, amount: +amount }
  })
}

function getScreenContent(inputString: string) {
  const input = parseInput(inputString)
  const grid: boolean[][] = Array.from({ length: 6 }, () => Array(50).fill(false))
  for (const instruction of input) {
    if (instruction.type === "rect") {
      for (let y = 0; y < instruction.height; y++) {
        for (let x = 0; x < instruction.width; x++) {
          grid[y][x] = true
        }
      }
    } else if (instruction.type === "rotate" && instruction.axis === "x") {
      const row = grid.map(row => row[instruction.index])
      for (let i = 0; i < row.length; i++) {
        grid[(i + instruction.amount) % row.length][instruction.index] = row[i]
      }
    } else if (instruction.type === "rotate" && instruction.axis === "y") {
      const column = [...grid[instruction.index]]
      for (let i = 0; i < column.length; i++) {
        grid[instruction.index][(i + instruction.amount) % column.length] = column[i]
      }
    }
  }
  return grid
}

const LETTERS: Record<string, string> = {
  ".##..#..#.#..#.####.#..#.#..#.": "A",
  "###..#..#.###..#..#.#..#.###..": "B",
  ".##..#..#.#....#....#..#..##..": "C",
  "####.#....###..#....#....####.": "E",
  "####.#....###..#....#....#....": "F",
  ".##..#..#.#....#.##.#..#..###.": "G",
  "#..#.#..#.####.#..#.#..#.#..#.": "H",
  "..##....#....#....#.#..#..##..": "J",
  "#....#....#....#....#....####.": "L",
  ".##..#..#.#..#.#..#.#..#..##..": "O",
  "###..#..#.#..#.###..#....#....": "P",
  ".###.#....#.....##.....#.###..": "S",
  "#..#.#..#.#..#.#..#.#..#..##..": "U",
  "#...##...#.#.#...#....#....#..": "Y",
  "####....#...#...#...#....####.": "Z",
}

function part1(inputString: string) {
  return utils.grid.countBy(getScreenContent(inputString), c => c)
}

function part2(inputString: string) {
  const screenContent = utils.grid.map(getScreenContent(inputString), c => (c ? "#" : "."))
  const letters = Array.from({ length: 10 }, (_, i) => screenContent.map(row => row.slice(i * 5, i * 5 + 5).join("")))
  return letters.map(letter => LETTERS[letter.join("")]).join("")
}

export default {
  part1: {
    run: part1,
    tests: [],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
