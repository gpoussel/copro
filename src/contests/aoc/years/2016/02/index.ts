import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2016 - Day 2

function parseInput(input: string) {
  return utils.input.lines(input)
}

const KEYPAD_1 = {
  [new Vector2(0, 0).str()]: "1",
  [new Vector2(1, 0).str()]: "2",
  [new Vector2(2, 0).str()]: "3",
  [new Vector2(0, 1).str()]: "4",
  [new Vector2(1, 1).str()]: "5",
  [new Vector2(2, 1).str()]: "6",
  [new Vector2(0, 2).str()]: "7",
  [new Vector2(1, 2).str()]: "8",
  [new Vector2(2, 2).str()]: "9",
}

const KEYPAD_2 = {
  [new Vector2(2, 0).str()]: "1",
  [new Vector2(1, 1).str()]: "2",
  [new Vector2(2, 1).str()]: "3",
  [new Vector2(3, 1).str()]: "4",
  [new Vector2(0, 2).str()]: "5",
  [new Vector2(1, 2).str()]: "6",
  [new Vector2(2, 2).str()]: "7",
  [new Vector2(3, 2).str()]: "8",
  [new Vector2(4, 2).str()]: "9",
  [new Vector2(1, 3).str()]: "A",
  [new Vector2(2, 3).str()]: "B",
  [new Vector2(3, 3).str()]: "C",
  [new Vector2(2, 4).str()]: "D",
}

function solve(input: string, keypad: Record<string, string>) {
  const lines = parseInput(input)
  const code = []
  let position = Vector2.fromKey(Object.entries(keypad).find(([_, value]) => value === "5")![0])
  for (const line of lines) {
    for (const char of line) {
      let newPosition
      if (char === "U") {
        newPosition = position.add(new Vector2(0, -1))
      } else if (char === "D") {
        newPosition = position.add(new Vector2(0, 1))
      } else if (char === "L") {
        newPosition = position.add(new Vector2(-1, 0))
      } else if (char === "R") {
        newPosition = position.add(new Vector2(1, 0))
      } else {
        throw new Error()
      }
      if (keypad[newPosition.str()]) {
        position = newPosition
      }
    }
    code.push(keypad[position.str()])
  }
  return code.join("")
}

function part1(inputString: string) {
  return solve(inputString, KEYPAD_1)
}

function part2(inputString: string) {
  return solve(inputString, KEYPAD_2)
}

const EXAMPLE = `
ULL
RRDDD
LURDL
UUUUD`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: "1985",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: "5DB3",
      },
    ],
  },
} as AdventOfCodeContest
