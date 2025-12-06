import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 3

function parseInput(input: string) {
  return utils.input.lines(input)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const symbols = new Set(inputString.replace(/[0-9\.\s]/g, "").split(""))
  let sum = 0
  for (let i = 0; i < input.length; ++i) {
    for (let j = 0; j < input[i].length; ++j) {
      if (input[i].charAt(j).match(/[0-9]/)) {
        // Number starts here
        let size = 1
        while (input[i].charAt(j + size).match(/[0-9]/)) {
          size++
        }
        // Check for the presence of any symbol adjacent to the number
        let hasSymbol = false
        for (let y = i - 1; y <= i + 1; ++y) {
          for (let x = j - 1; x < j + size + 1; ++x) {
            if (y >= 0 && y < input.length && x >= 0 && x < input[y].length) {
              if (symbols.has(input[y].charAt(x))) {
                hasSymbol = true
                break
              }
            }
          }
          if (hasSymbol) {
            break
          }
        }
        if (hasSymbol) {
          sum += +input[i].substring(j, j + size)
        }
        j += size - 1 // Move index to the end of the number
      }
    }
  }
  return sum
}

function part2(inputString: string) {
  const input = parseInput(inputString)

  // First, find all numbers with their positions
  const numbers: { value: number; row: number; startCol: number; endCol: number }[] = []
  for (let i = 0; i < input.length; ++i) {
    for (let j = 0; j < input[i].length; ++j) {
      if (input[i].charAt(j).match(/[0-9]/)) {
        let size = 1
        while (input[i].charAt(j + size).match(/[0-9]/)) {
          size++
        }
        numbers.push({
          value: +input[i].substring(j, j + size),
          row: i,
          startCol: j,
          endCol: j + size - 1,
        })
        j += size - 1
      }
    }
  }

  // Find all * symbols and check for adjacent numbers
  let sum = 0
  for (let i = 0; i < input.length; ++i) {
    for (let j = 0; j < input[i].length; ++j) {
      if (input[i].charAt(j) === "*") {
        // Find all numbers adjacent to this gear
        const adjacentNumbers = numbers.filter(num => {
          // Check if the number is adjacent (including diagonals)
          const rowDist = Math.abs(num.row - i)
          if (rowDist > 1) return false
          // Check if any part of the number is within 1 column of the gear
          return j >= num.startCol - 1 && j <= num.endCol + 1
        })

        if (adjacentNumbers.length === 2) {
          sum += adjacentNumbers[0].value * adjacentNumbers[1].value
        }
      }
    }
  }
  return sum
}

const EXAMPLE = `
467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 4361,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 467835,
      },
    ],
  },
} as AdventOfCodeContest
