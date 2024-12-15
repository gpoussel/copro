import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2024 - Quest 5

function parseInput(input: string) {
  const grid = utils.input.lines(input).map(line => line.split(" ").map(Number))
  return utils.grid.columns(grid)
}

function move(columns: number[][], round: number) {
  const clapperValue = columns[round % columns.length].shift()!
  const destinationColumnIndex = (round + 1) % columns.length
  const size = 2 * columns[destinationColumnIndex].length
  const remainderIndex = (clapperValue - 1) % size
  const clapperPosition = Math.min(remainderIndex, size - remainderIndex)
  columns[destinationColumnIndex].splice(clapperPosition, 0, clapperValue)
}

function shout(columns: number[][]) {
  return columns.map(column => column[0].toString()).join("")
}

function part1(inputString: string) {
  const columns = parseInput(inputString)

  for (let round = 0; round < 10; ++round) {
    move(columns, round)
  }

  return shout(columns)
}

function part2(inputString: string) {
  const input = parseInput(inputString)

  const occurrences = new Map<string, number>()
  let found = false
  let round = 0
  while (!found) {
    move(input, round)
    const shoutedString = shout(input)
    if (!occurrences.has(shoutedString)) {
      occurrences.set(shoutedString, 1)
    } else {
      occurrences.set(shoutedString, occurrences.get(shoutedString)! + 1)
      if (occurrences.get(shoutedString) === 2024) {
        return parseInt(shoutedString) * (round + 1)
      }
    }
    utils.log.logEvery(round, 100000)
    round++
  }
}

function part3(inputString: string) {
  const input = parseInput(inputString)

  const shoutedNumbers = new Set<string>()
  const visitedKeys = new Set<string>()
  let round = 0
  while (true) {
    move(input, round)
    const key = input.map(column => column.join(",")).join("\n")
    const shoutedString = shout(input)
    shoutedNumbers.add(shoutedString)

    if (visitedKeys.has(key)) {
      break
    }
    visitedKeys.add(key)

    utils.log.logEvery(round, 10000)
    round++
  }
  return [...shoutedNumbers].reduce((acc, shoutedNumber) =>
    shoutedNumber.localeCompare(acc) > 0 ? shoutedNumber : acc
  )
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
2 3 4 5
3 4 5 2
4 5 2 3
5 2 3 4`,
        expected: "2323",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
2 3 4 5
6 7 8 9`,
        expected: 50877075,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
2 3 4 5
6 7 8 9`,
        expected: "6584",
      },
    ],
  },
} as EverybodyCodesContest
