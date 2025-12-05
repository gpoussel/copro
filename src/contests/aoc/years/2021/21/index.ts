import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 21

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const match = line.match(/Player (\d+) starting position: (\d+)/)
    if (!match) {
      throw new Error(`Invalid line: ${line}`)
    }
    return +match[2]
  })
}

function part1(inputString: string) {
  const [p1, p2] = parseInput(inputString)
  let scores = [0, 0]
  let positions = [p1 - 1, p2 - 1]
  let dieValue = 1
  let rolls = 0
  while (scores[0] < 1000 && scores[1] < 1000) {
    for (let player = 0; player < 2; player++) {
      let move = 0
      for (let i = 0; i < 3; i++) {
        move += dieValue
        dieValue = (dieValue % 100) + 1
        rolls++
      }
      positions[player] = (positions[player] + move) % 10
      scores[player] += positions[player] + 1
      if (scores[player] >= 1000) {
        break
      }
    }
  }
  return Math.min(scores[0], scores[1]) * rolls
}

function part2(inputString: string) {
  const [p1, p2] = parseInput(inputString)

  const rollDistribution = new Map<number, number>()
  for (let d1 = 1; d1 <= 3; d1++) {
    for (let d2 = 1; d2 <= 3; d2++) {
      for (let d3 = 1; d3 <= 3; d3++) {
        const sum = d1 + d2 + d3
        rollDistribution.set(sum, (rollDistribution.get(sum) || 0) + 1)
      }
    }
  }

  const cache = new Map<string, [bigint, bigint]>()

  function countWins(pos1: number, pos2: number, score1: number, score2: number, turn: number): [bigint, bigint] {
    // Check if someone already won
    if (score1 >= 21) {
      return [1n, 0n]
    }
    if (score2 >= 21) {
      return [0n, 1n]
    }

    const key = `${pos1},${pos2},${score1},${score2},${turn}`
    if (cache.has(key)) {
      return cache.get(key)!
    }

    let totalWins1 = 0n
    let totalWins2 = 0n

    for (const [roll, count] of rollDistribution) {
      if (turn === 0) {
        const newPos1 = (pos1 + roll) % 10
        const newScore1 = score1 + newPos1 + 1
        const [wins1, wins2] = countWins(newPos1, pos2, newScore1, score2, 1)
        totalWins1 += wins1 * BigInt(count)
        totalWins2 += wins2 * BigInt(count)
      } else {
        const newPos2 = (pos2 + roll) % 10
        const newScore2 = score2 + newPos2 + 1
        const [wins1, wins2] = countWins(pos1, newPos2, score1, newScore2, 0)
        totalWins1 += wins1 * BigInt(count)
        totalWins2 += wins2 * BigInt(count)
      }
    }

    cache.set(key, [totalWins1, totalWins2])
    return [totalWins1, totalWins2]
  }

  const [wins1, wins2] = countWins(p1 - 1, p2 - 1, 0, 0, 0)
  return (wins1 > wins2 ? wins1 : wins2).toString()
}

const EXAMPLE = `
Player 1 starting position: 4
Player 2 starting position: 8`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 739785,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: "444356092776315",
      },
    ],
  },
} as AdventOfCodeContest
