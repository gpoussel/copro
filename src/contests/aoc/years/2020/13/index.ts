import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { chineseRemainderTheorem } from "../../../../../utils/math.js"

// 🎄 Advent of Code 2020 - Day 13

function parseInput(input: string) {
  const [earliestTimestampString, busIds] = utils.input.lines(input)
  const earliestTimestamp = Number(earliestTimestampString)
  const buses = busIds
    .split(",")
    .map((id, offset) => {
      if (id === "x") {
        return undefined
      }
      return {
        id: Number(id),
        offset,
      }
    })
    .filter(v => v !== undefined)
  return {
    earliestTimestamp,
    buses,
  }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const { earliestTimestamp, buses } = input
  let minWait = Infinity
  let minWaitId = -1
  for (const bus of buses) {
    const wait = bus.id - (earliestTimestamp % bus.id)
    if (wait < minWait) {
      minWait = wait
      minWaitId = bus.id
    }
  }
  return minWait * minWaitId
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const { buses } = input
  return chineseRemainderTheorem(
    buses.map(bus => BigInt(bus.id - bus.offset)),
    buses.map(bus => BigInt(bus.id))
  ).toString()
}

const EXAMPLE = `
939
7,13,x,x,59,x,31,19`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 295,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: "1068781",
      },
    ],
  },
} as AdventOfCodeContest
