import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 25

function parseInput(input: string) {
  return utils.input.lines(input).map(Number)
}

function findLoopSize(publicKey: number) {
  let value = 1
  let loopSize = 0
  const subjectNumber = 7
  while (value !== publicKey) {
    value = (value * subjectNumber) % 20201227
    loopSize++
  }
  return loopSize
}

function part1(inputString: string) {
  const [cardPublicKey, doorPublicKey] = parseInput(inputString)
  const doorLoopSize = findLoopSize(doorPublicKey)
  let encryptionKeyFromCard = 1
  for (let i = 0; i < doorLoopSize; i++) {
    encryptionKeyFromCard = (encryptionKeyFromCard * cardPublicKey) % 20201227
  }
  return encryptionKeyFromCard
}

function part2(inputString: string) {
  return "Merry Christmas!"
}

const EXAMPLE = `
5764801
17807724`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 14897079,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
