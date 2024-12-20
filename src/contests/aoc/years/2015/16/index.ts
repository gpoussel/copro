import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 16

function parseInput(input: string) {
  return utils.input.regexLines(input, /Sue (\d+): (\w+): (\d+), (\w+): (\d+), (\w+): (\d+)/).map(match => {
    return {
      number: +match[1],
      characteristics: [
        { name: match[2], value: +match[3] },
        { name: match[4], value: +match[5] },
        { name: match[6], value: +match[7] },
      ],
    }
  })
}

const REQUIREMENTS = {
  children: 3,
  cats: 7,
  samoyeds: 2,
  pomeranians: 3,
  akitas: 0,
  vizslas: 0,
  goldfish: 5,
  trees: 3,
  cars: 2,
  perfumes: 1,
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.find(sue => {
    return sue.characteristics.every(c => {
      return REQUIREMENTS[c.name as keyof typeof REQUIREMENTS] === c.value
    })
  })?.number
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input.find(sue => {
    return sue.characteristics.every(c => {
      const name = c.name as keyof typeof REQUIREMENTS
      if (name === "cats" || name === "trees") {
        return REQUIREMENTS[name] < c.value
      }
      if (name === "pomeranians" || name === "goldfish") {
        return REQUIREMENTS[name] > c.value
      }
      return REQUIREMENTS[name] === c.value
    })
  })?.number
}

export default {
  part1: {
    run: part1,
    tests: [],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
