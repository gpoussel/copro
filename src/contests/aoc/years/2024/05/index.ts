import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2024 - Day 5

function parseInput(input: string) {
  const blocks = utils.input.blocks(input)
  return {
    rules: new VectorSet<Vector2>(
      utils.input.regexLines(blocks[0], /(\d+)\|(\d+)/).map(([, a, b]) => new Vector2(parseInt(a, 10), parseInt(b, 10)))
    ),
    updates: utils.input.lines(blocks[1]).map(line => line.split(",").map(n => parseInt(n, 10))),
  }
}

function sortUpdate(update: number[], rules: VectorSet<Vector2>) {
  return update.slice().sort((a, b) => {
    const vector = new Vector2(a, b)
    return rules.contains(vector) ? -1 : 1
  })
}

function isSorted(update: number[], rules: VectorSet<Vector2>) {
  const sortedPages = sortUpdate(update, rules)
  return utils.iterate.arrayEquals(sortedPages, update)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.updates
    .filter(update => isSorted(update, input.rules))
    .map(update => update[(update.length - 1) / 2])
    .reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input.updates
    .filter(update => !isSorted(update, input.rules))
    .map(update => sortUpdate(update, input.rules))
    .map(update => update[(update.length - 1) / 2])
    .reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
47|53
97|13
97|61
97|47
75|29
61|13
75|53
29|13
97|29
53|29
61|53
97|53
61|29
47|13
75|47
97|75
47|61
75|61
47|29
75|13
53|13

75,47,61,53,29
97,61,53,29,13
75,29,13
75,97,47,61,53
61,13,29
97,13,75,29,47
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 143,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 123,
      },
    ],
  },
} as AdventOfCodeContest
