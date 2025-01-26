import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 15

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function getNthNumber(input: number[], n: number) {
  const spokenTurns = new Map<number, number[]>()
  function speak(turn: number, number: number) {
    let turns = spokenTurns.get(number)
    if (!turns) {
      turns = []
      spokenTurns.set(number, turns)
    }
    turns.push(turn)
  }
  let turn = 1
  let lastSpoken = 0
  for (; turn <= input.length; turn++) {
    lastSpoken = input[turn - 1]
    speak(turn, lastSpoken)
  }
  while (turn <= n) {
    const turns = spokenTurns.get(lastSpoken)!
    let nextSpoken = 0
    if (turns.length > 1) {
      nextSpoken = turns[turns.length - 1] - turns[turns.length - 2]
    }
    lastSpoken = nextSpoken
    speak(turn, lastSpoken)
    ++turn
  }
  return lastSpoken
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return getNthNumber(input, 2020)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return getNthNumber(input, 30_000_000)
}

export default {
  part1: {
    run: part1,
    tests: [
      { input: "0,3,6", expected: 436 },
      { input: "1,3,2", expected: 1 },
      { input: "2,1,3", expected: 10 },
      { input: "1,2,3", expected: 27 },
      { input: "2,3,1", expected: 78 },
      { input: "3,2,1", expected: 438 },
      { input: "3,1,2", expected: 1836 },
    ],
  },
  part2: {
    run: part2,
    tests: [
      { input: "0,3,6", expected: 175594 },
      { input: "1,3,2", expected: 2578 },
      { input: "2,1,3", expected: 3544142 },
      { input: "1,2,3", expected: 261214 },
      { input: "2,3,1", expected: 6895259 },
      { input: "3,2,1", expected: 18 },
      { input: "3,1,2", expected: 362 },
    ],
  },
} as AdventOfCodeContest
