import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 2

type MoveDirection = "forward" | "down" | "up"

function parseInput(input: string) {
  return utils.input.lines(input).map(line => ({
    direction: line.split(" ")[0] as MoveDirection,
    value: Number(line.split(" ")[1]),
  }))
}

function part1(inputString: string) {
  const directions = parseInput(inputString)
  let position = 0
  let depth = 0

  for (const move of directions) {
    switch (move.direction) {
      case "forward":
        position += move.value
        break
      case "down":
        depth += move.value
        break
      case "up":
        depth -= move.value
        break
    }
  }

  return position * depth
}

function part2(inputString: string) {
  const directions = parseInput(inputString)
  let position = 0
  let depth = 0
  let aim = 0

  for (const move of directions) {
    switch (move.direction) {
      case "forward":
        position += move.value
        depth += aim * move.value
        break
      case "down":
        aim += move.value
        break
      case "up":
        aim -= move.value
        break
    }
  }

  return position * depth
}

const EXAMPLE = `
forward 5
down 5
forward 8
up 3
down 8
forward 2`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 150,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 900,
      },
    ],
  },
} as AdventOfCodeContest
