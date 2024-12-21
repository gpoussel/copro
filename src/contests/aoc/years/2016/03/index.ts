import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector3 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2016 - Day 3

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [x, y, z] = line.trim().split(/ +/).map(Number)
    return new Vector3(x, y, z)
  })
}

function isTrianglePossible(triangle: Vector3) {
  return (
    triangle.x + triangle.y > triangle.z && triangle.x + triangle.z > triangle.y && triangle.y + triangle.z > triangle.x
  )
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.filter(tuple => isTrianglePossible(tuple)).length
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const triangles = (["x", "y", "z"] as ("x" | "y" | "z")[]).flatMap(axis =>
    Array.from({ length: input.length / 3 }, (_, i) => {
      return new Vector3(input[3 * i][axis], input[3 * i + 1][axis], input[3 * i + 2][axis])
    })
  )
  return triangles.filter(triangle => isTrianglePossible(triangle)).length
}

const EXAMPLE = `5 10 25`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 0,
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
