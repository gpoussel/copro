import { Md5 } from "ts-md5"
import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 5

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  let index = 0
  let password = ""
  while (password.length < 8) {
    const hash = Md5.hashStr(input + index)
    if (hash.startsWith("00000")) {
      password += hash[5]
    }
    index++
  }
  return password
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  let index = 0
  let password = new Array<string>(8).fill("")
  let lettersFound = 0
  while (lettersFound < 8) {
    const hash = Md5.hashStr(input + index)
    if (hash.startsWith("00000")) {
      const position = parseInt(hash[5], 16)
      if (password[position] === "") {
        password[position] = hash[6]
        lettersFound++
      }
    }
    index++
  }
  return password.join("")
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "abc",
        expected: "18f47a30",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "abc",
        expected: "05ace8e3",
      },
    ],
  },
} as AdventOfCodeContest
