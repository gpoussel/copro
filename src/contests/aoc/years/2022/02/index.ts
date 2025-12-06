import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2022 - Day 2

type OpponentChoice = "A" | "B" | "C"
type PlayerChoice = "X" | "Y" | "Z"

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [opponent, player] = line.split(" ")
    return { opponent: opponent as OpponentChoice, player: player as PlayerChoice }
  })
}

const CHOICE_SCORE = {
  X: 1,
  Y: 2,
  Z: 3,
}

const RESULT_SCORE: Record<string, number> = {
  "A,Y": 6,
  "B,Z": 6,
  "C,X": 6,
  "A,X": 3,
  "B,Y": 3,
  "C,Z": 3,
}

const PART2_CHOICE: Record<string, PlayerChoice> = {
  "A,X": "Z",
  "A,Y": "X",
  "A,Z": "Y",
  "B,X": "X",
  "B,Y": "Y",
  "B,Z": "Z",
  "C,X": "Y",
  "C,Y": "Z",
  "C,Z": "X",
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input
    .map(({ opponent, player }) => {
      const choiceScore = CHOICE_SCORE[player]
      const resultScore = RESULT_SCORE[`${opponent},${player}`] ?? 0
      return choiceScore + resultScore
    })
    .reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input
    .map(({ opponent, player }) => {
      const playerChoice = PART2_CHOICE[`${opponent},${player}`]
      const choiceScore = CHOICE_SCORE[playerChoice]
      const resultScore = RESULT_SCORE[`${opponent},${playerChoice}`] ?? 0
      return choiceScore + resultScore
    })
    .reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
A Y
B X
C Z`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 15,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 12,
      },
    ],
  },
} as AdventOfCodeContest
