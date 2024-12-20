import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 13

function parseInput(input: string) {
  return utils.input
    .regexLines(input, /(\w+) would (gain|lose) (\d+) happiness units? by sitting next to (\w+)/)
    .map(([_, a, sign, happiness, b]) => ({
      a,
      happiness: (sign === "gain" ? 1 : -1) * Number(happiness),
      b,
    }))
}

function findBestSeatingOrder(input: ReturnType<typeof parseInput>) {
  const guests = new Set(input.flatMap(({ a, b }) => [a, b]))
  const happinessChanges = utils.iterate.permutations([...guests]).map(permutation => {
    let happiness = 0
    for (let i = 0; i < permutation.length; i++) {
      const a = permutation[i]
      const b = permutation[(i + 1) % permutation.length]
      happiness += input.find(x => x.a === a && x.b === b)?.happiness || 0
      happiness += input.find(x => x.a === b && x.b === a)?.happiness || 0
    }
    return happiness
  })
  return utils.iterate.max(happinessChanges)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return findBestSeatingOrder(input)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const guests = [...new Set(input.flatMap(({ a, b }) => [a, b]))]
  for (const guest of guests) {
    input.push({ a: "Myself", happiness: 0, b: guest })
    input.push({ a: guest, happiness: 0, b: "Myself" })
  }
  return findBestSeatingOrder(input)
}

const EXAMPLE = `
Alice would gain 54 happiness units by sitting next to Bob.
Alice would lose 79 happiness units by sitting next to Carol.
Alice would lose 2 happiness units by sitting next to David.
Bob would gain 83 happiness units by sitting next to Alice.
Bob would lose 7 happiness units by sitting next to Carol.
Bob would lose 63 happiness units by sitting next to David.
Carol would lose 62 happiness units by sitting next to Alice.
Carol would gain 60 happiness units by sitting next to Bob.
Carol would gain 55 happiness units by sitting next to David.
David would gain 46 happiness units by sitting next to Alice.
David would lose 7 happiness units by sitting next to Bob.
David would gain 41 happiness units by sitting next to Carol.`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 330,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
