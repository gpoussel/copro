import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 4

class BingoBoard {
  grid: number[][]
  marked: boolean[][]

  constructor(grid: number[][]) {
    this.grid = grid
    this.marked = grid.map(row => row.map(() => false))
  }

  markNumber(num: number) {
    utils.grid.iterate(this.grid, (value, r, c) => {
      if (value === num) {
        this.marked[r][c] = true
      }
    })
  }

  hasWon() {
    if (this.marked.some(row => row.every(cell => cell))) {
      return true
    }
    if (utils.grid.columns(this.marked).some(col => col.every(cell => cell))) {
      return true
    }
    return false
  }

  unmarkedSum() {
    let sum = 0
    utils.grid.iterate(this.grid, (value, r, c) => {
      if (!this.marked[r][c]) {
        sum += value
      }
    })
    return sum
  }
}

function parseInput(input: string) {
  const [numbersString, ...grids] = utils.input.blocks(input)
  const numbers = numbersString.split(",").map(Number)
  const boards = grids.map(gridString => {
    const grid = utils.input.lines(gridString).map(line => line.trim().split(/\s+/).map(Number))
    return new BingoBoard(grid)
  })
  return { numbers, boards }
}

function part1(inputString: string) {
  const { numbers, boards } = parseInput(inputString)
  for (const number of numbers) {
    for (const board of boards) {
      board.markNumber(number)
      if (board.hasWon()) {
        return board.unmarkedSum() * number
      }
    }
  }
  throw new Error("No winning board found")
}

function part2(inputString: string) {
  const { numbers, boards } = parseInput(inputString)
  const winningBoards = new Set<BingoBoard>()
  for (const number of numbers) {
    for (const board of boards) {
      if (winningBoards.has(board)) {
        continue
      }
      board.markNumber(number)
      if (board.hasWon()) {
        winningBoards.add(board)
        if (winningBoards.size === boards.length) {
          return board.unmarkedSum() * number
        }
      }
    }
  }
  throw new Error("No last winning board found")
}

const EXAMPLE = `
7,4,9,5,11,17,23,2,0,14,21,24,10,16,13,6,15,25,12,22,18,20,8,19,3,26,1

22 13 17 11  0
 8  2 23  4 24
21  9 14 16  7
 6 10  3 18  5
 1 12 20 15 19

 3 15  0  2 22
 9 18 13 17  5
19  8  7 25 23
20 11 10 24  4
14 21 16 12  6

14 21 17 24  4
10 16 15  9 19
18  8 23 26 20
22 11 13  6  5
 2  0 12  3  7`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 4512,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 1924,
      },
    ],
  },
} as AdventOfCodeContest
