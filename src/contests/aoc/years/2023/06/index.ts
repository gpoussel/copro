import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 6

function parseInput(input: string) {
  const [timesLine, distancesLine] = utils.input.lines(input)
  const times = timesLine
    .split(/ +/)
    .slice(1)
    .map(s => +s)
  const distances = distancesLine
    .split(/ +/)
    .slice(1)
    .map(s => +s)
  return times.map((time, index) => {
    return { time, distance: distances[index] }
  })
}

function howManyWaysToCompleteRace(time: number, distance: number): number {
  let countOfWays = 0
  for (let buttonDuration = 1; buttonDuration < time; buttonDuration++) {
    const covered = (time - buttonDuration) * buttonDuration
    if (covered > distance) {
      countOfWays++
    } else if (covered < distance && countOfWays > 0) {
      break
    }
  }
  return countOfWays
}

function part1(inputString: string) {
  const races = parseInput(inputString)
  return races.map(({ time, distance }) => howManyWaysToCompleteRace(time, distance)).reduce((a, b) => a * b, 1)
}

function part2(inputString: string) {
  const races = parseInput(inputString)
  const time = +races.map(r => `${r.time}`).join("")
  const distance = +races.map(r => `${r.distance}`).join("")
  return howManyWaysToCompleteRace(time, distance)
}

const EXAMPLE = `
Time:      7  15   30
Distance:  9  40  200`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 288,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 71503,
      },
    ],
  },
} as AdventOfCodeContest
