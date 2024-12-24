import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2018 - Day 3

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [idStr, positionAndSize] = line.split(" @ ")
    const [positionStr, size] = positionAndSize.split(": ")
    const [x, y] = positionStr.split(",").map(Number)
    const position = new Vector2(x, y)
    const [width, height] = size.split("x").map(Number)
    const id = Number(idStr.slice(1))
    return { id, position, width, height }
  })
}

function solve(claims: ReturnType<typeof parseInput>) {
  const fabricClaims = new Map<string, number>()
  for (const { position, width, height } of claims) {
    for (const point of position.range(width, height)) {
      fabricClaims.set(point.str(), (fabricClaims.get(point.str()) || 0) + 1)
    }
  }
  return fabricClaims
}

function part1(inputString: string) {
  const claims = parseInput(inputString)
  const fabricClaims = solve(claims)
  return Array.from(fabricClaims.values()).filter(count => count > 1).length
}

function part2(inputString: string) {
  const claims = parseInput(inputString)
  const fabricClaims = solve(claims)
  const claimThatDoesNotOverlap = claims.find(claim =>
    claim.position.range(claim.width, claim.height).every(point => fabricClaims.get(point.str()) === 1)
  )
  if (!claimThatDoesNotOverlap) {
    throw new Error("No claim found that does not overlap")
  }
  return claimThatDoesNotOverlap.id
}

const EXAMPLE = `
#1 @ 1,3: 4x4
#2 @ 3,1: 4x4
#3 @ 5,5: 2x2`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 4,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 3,
      },
    ],
  },
} as AdventOfCodeContest
