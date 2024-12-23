import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2018 - Day 2

function parseInput(input: string) {
  return utils.input.lines(input)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  let twos = 0
  let threes = 0
  for (const word of input) {
    const counters = utils.iterate.countBy(word, c => c)
    const counterValues = [...counters.values()]
    if (counterValues.includes(2)) twos++
    if (counterValues.includes(3)) threes++
  }
  return twos * threes
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  for (let i = 0; i < input.length; ++i) {
    const word1 = input[i]
    for (let j = i + 1; j < input.length; ++j) {
      const word2 = input[j]
      let common = ""
      for (let k = 0; k < word1.length; ++k) {
        if (word1[k] === word2[k]) common += word1[k]
      }
      if (common.length === word1.length - 1) return common
    }
  }
  throw new Error()
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
abcdef
bababc
abbcde
abcccd
aabcdd
abcdee
ababab`,
        expected: 12,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
abcde
fghij
klmno
pqrst
fguij
axcye
wvxyz`,
        expected: "fgij",
      },
    ],
  },
} as AdventOfCodeContest
