import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 15

function parseInput(input: string) {
  return utils.input
    .regexLines(input, /(\w+): capacity (-?\d+), durability (-?\d+), flavor (-?\d+), texture (-?\d+), calories (-?\d+)/)
    .map(match => ({
      name: match[1],
      capacity: +match[2],
      durability: +match[3],
      flavor: +match[4],
      texture: +match[5],
      calories: +match[6],
    }))
}

function computeScore(input: ReturnType<typeof parseInput>, combination: number[]) {
  const capacity = combination.reduce((acc, value, index) => acc + value * input[index].capacity, 0)
  const durability = combination.reduce((acc, value, index) => acc + value * input[index].durability, 0)
  const flavor = combination.reduce((acc, value, index) => acc + value * input[index].flavor, 0)
  const texture = combination.reduce((acc, value, index) => acc + value * input[index].texture, 0)

  if (capacity < 0 || durability < 0 || flavor < 0 || texture < 0) {
    return 0
  }

  return capacity * durability * flavor * texture
}

function part1(inputString: string) {
  const input = parseInput(inputString)

  const combinations = utils.iterate.combinations(input.length, 100)
  const scores = combinations.map(combination => computeScore(input, combination))
  return utils.iterate.max(scores)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const combinations = utils.iterate.combinations(input.length, 100)
  const scores = combinations
    .filter(combination => {
      const calories = combination.reduce((acc, value, index) => acc + value * input[index].calories, 0)
      return calories === 500
    })
    .map(combination => computeScore(input, combination))
  return utils.iterate.max(scores)
}

const EXAMPLE = `
Butterscotch: capacity -1, durability -2, flavor 6, texture 3, calories 8
Cinnamon: capacity 2, durability 3, flavor -2, texture -1, calories 3`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 62842880,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 57600000,
      },
    ],
  },
} as AdventOfCodeContest
