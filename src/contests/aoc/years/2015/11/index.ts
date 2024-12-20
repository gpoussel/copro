import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 11

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

function increment(letters: string[]) {
  for (let i = letters.length - 1; i >= 0; --i) {
    if (letters[i] === "z") {
      letters[i] = "a"
    } else {
      letters[i] = String.fromCharCode(letters[i].charCodeAt(0) + 1)
      break
    }
  }
}

function isValid(letters: string[]) {
  if (letters.some(letter => letter === "i" || letter === "o" || letter === "l")) {
    return false
  }
  let hasStraight = false
  for (let i = 0; i < letters.length - 2; ++i) {
    if (
      letters[i + 1].charCodeAt(0) - letters[i].charCodeAt(0) === 1 &&
      letters[i + 2].charCodeAt(0) - letters[i + 1].charCodeAt(0) === 1
    ) {
      hasStraight = true
    }
  }
  if (!hasStraight) {
    return false
  }
  let pairs = new Set<string>()
  for (let i = 0; i < letters.length - 1; ++i) {
    if (letters[i] === letters[i + 1]) {
      pairs.add(letters[i])
    }
  }
  return pairs.size >= 2
}

function getNextValidPassword(word: string) {
  const letters = word.split("")
  increment(letters)
  while (!isValid(letters)) {
    increment(letters)
  }
  return letters.join("")
}

function part1(inputString: string) {
  return getNextValidPassword(parseInput(inputString))
}

function part2(inputString: string) {
  return getNextValidPassword(getNextValidPassword(parseInput(inputString)))
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "ghijklmn",
        expected: "ghjaabcc",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
