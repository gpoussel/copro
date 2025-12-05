import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 17

function parseInput(input: string) {
  const line = utils.input.firstLine(input)
  const coordinates = line.split(": ")[1]
  const [xPart, yPart] = coordinates.split(", ")
  const [xMin, xMax] = xPart.slice(2).split("..").map(Number)
  const [yMin, yMax] = yPart.slice(2).split("..").map(Number)
  return { xMin, xMax, yMin, yMax }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return ((input.yMin + 1) * input.yMin) / 2
}

function part2(inputString: string) {
  const { xMin, xMax, yMin, yMax } = parseInput(inputString)
  let counter = 0
  const n = Math.floor(Math.sqrt(xMin * 2) - 1)
  for (let dyInit = yMin; dyInit < -yMin; dyInit++) {
    for (let dxInit = n; dxInit <= xMax; dxInit++) {
      let x = 0
      let y = 0
      let dx = dxInit
      let dy = dyInit
      while (x <= xMax && y >= yMin && ((dx === 0 && xMin <= x) || dx !== 0)) {
        x += dx
        y += dy
        if (dx > 0) {
          dx -= 1
        }
        dy -= 1
        if (xMin <= x && x <= xMax && yMin <= y && y <= yMax) {
          counter += 1
          break
        }
      }
    }
  }
  return counter
}

const EXAMPLE = `target area: x=20..30, y=-10..-5`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 45,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 112,
      },
    ],
  },
} as AdventOfCodeContest
