import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 23

function parseInput(input: string) {
  return utils.input.lines(input)[0].split("").map(Number)
}

function buildList(input: number[], maxCup: number): number[] {
  const next = new Array(maxCup + 1)

  for (let i = 0; i < input.length - 1; i++) {
    next[input[i]] = input[i + 1]
  }

  if (input.length < maxCup) {
    next[input[input.length - 1]] = Math.max(...input) + 1
    for (let cup = Math.max(...input) + 1; cup < maxCup; cup++) {
      next[cup] = cup + 1
    }
    next[maxCup] = input[0]
  } else {
    next[input[input.length - 1]] = input[0]
  }

  return next
}

function movesInPlace(next: number[], currentCup: number, moveCount: number, maxCup: number): void {
  for (let moveIndex = 0; moveIndex < moveCount; moveIndex++) {
    const pick1 = next[currentCup]
    const pick2 = next[pick1]
    const pick3 = next[pick2]

    next[currentCup] = next[pick3]

    let destCup = currentCup - 1
    if (destCup < 1) destCup = maxCup
    while (destCup === pick1 || destCup === pick2 || destCup === pick3) {
      destCup--
      if (destCup < 1) destCup = maxCup
    }

    const afterDest = next[destCup]
    next[destCup] = pick1
    next[pick3] = afterDest

    currentCup = next[currentCup]
  }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const maxCup = Math.max(...input)
  const next = buildList(input, maxCup)

  movesInPlace(next, input[0], 100, maxCup)

  const result = []
  let cup = next[1]
  while (cup !== 1) {
    result.push(cup)
    cup = next[cup]
  }
  return +result.join("")
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const maxCup = 1_000_000
  const next = buildList(input, maxCup)

  movesInPlace(next, input[0], 10_000_000, maxCup)

  const cup1 = next[1]
  const cup2 = next[cup1]
  return cup1 * cup2
}

const EXAMPLE = `389125467`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 67384529,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 149245887792,
      },
    ],
  },
} as AdventOfCodeContest
