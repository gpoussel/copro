import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes Story 1 - Quest 3

function parseInput(input: string) {
  return utils.input
    .lines(input)
    .map(line => {
      if (line.trim() === "") return null
      const match = line.match(/x=(\d+) y=(\d+)/)
      if (!match) return null
      return new Vector2(+match[1], +match[2])
    })
    .filter((v): v is Vector2 => v !== null)
}

function getSnailPositionAfterDays(snail: Vector2, days: number): Vector2 {
  const { x: x0, y: y0 } = snail
  const distance = x0 + y0 - 1
  const xFinal = ((x0 - 1 + days) % distance) + 1
  const yFinal = distance - xFinal + 1
  return new Vector2(xFinal, yFinal)
}

function part1(inputString: string) {
  const snails = parseInput(inputString)
  return snails
    .map(snail => {
      const finalPosition = getSnailPositionAfterDays(snail, 100)
      return finalPosition.x + 100 * finalPosition.y
    })
    .reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const snails = parseInput(inputString)
  if (snails.length === 0) {
    return 0
  }

  const congruences = snails.map(snail => {
    const d = BigInt(snail.x + snail.y - 1)
    const a = d - BigInt(snail.x)
    return { modulus: d, remainder: a }
  })

  let N = congruences[0].remainder
  let S = congruences[0].modulus

  for (let i = 1; i < congruences.length; i++) {
    const { modulus: di, remainder: ai } = congruences[i]
    while (N % di !== ai) {
      N += S
    }
    S = (S * di) / utils.math.eGcd(S, di).g
  }

  if (N === 0n) {
    return Number(S)
  }

  return Number(N)
}

function part3(inputString: string) {
  return part2(inputString)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
x=1 y=2
x=2 y=3
x=3 y=4
x=4 y=4`,
        expected: 1310,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
x=12 y=2
x=8 y=4
x=7 y=1
x=1 y=5
x=1 y=3`,
        expected: 14,
      },
      {
        input: `
x=3 y=1
x=3 y=9
x=1 y=5
x=4 y=10
x=5 y=3`,
        expected: 13659,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [],
  },
} as EverybodyCodesContest
