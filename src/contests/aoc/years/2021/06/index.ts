import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 6

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function buildInitialState(fishTimers: number[]) {
  const state: Record<number, number> = {}
  for (let timer = 0; timer <= 8; timer++) {
    state[timer] = 0
  }
  for (const timer of fishTimers) {
    state[timer]++
  }
  return state
}

function simulateDays(state: Record<number, number>, days: number) {
  for (let day = 1; day <= days; day++) {
    const newState: Record<number, number> = {}
    for (let timer = 0; timer <= 8; timer++) {
      newState[timer] = 0
    }
    newState[6] += state[0]
    newState[8] += state[0]
    for (let timer = 1; timer <= 8; timer++) {
      newState[timer - 1] += state[timer]
    }
    state = newState
  }
  return state
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  let state = buildInitialState(input)
  const endState = simulateDays(state, 80)
  return Object.values(endState).reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  let state = buildInitialState(input)
  const endState = simulateDays(state, 256)
  return Object.values(endState).reduce((a, b) => a + b, 0)
}

const EXAMPLE = `3,4,3,1,2`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 5934,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 26984457539,
      },
    ],
  },
} as AdventOfCodeContest
