import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 14

function parseInput(input: string) {
  return utils.input
    .regexLines(input, /(\w+) can fly (\d+) km\/s for (\d+) seconds, but then must rest for (\d+) seconds./)
    .map(([, name, speed, duration, rest]) => ({ name, speed: +speed, duration: +duration, rest: +rest }))
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const distances = input.map(({ speed, duration, rest }) => {
    const cycle = duration + rest
    const cycles = Math.floor(2503 / cycle)
    const remainder = 2503 % cycle
    return cycles * duration * speed + Math.min(remainder, duration) * speed
  })
  return Math.max(...distances)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const scores = input.map(() => 0)
  for (let time = 1; time <= 2503; time++) {
    const distances = input.map(({ speed, duration, rest }) => {
      const cycle = duration + rest
      const cycles = Math.floor(time / cycle)
      const remainder = time % cycle
      return cycles * duration * speed + Math.min(remainder, duration) * speed
    })
    const maxDistance = Math.max(...distances)
    distances.forEach((distance, i) => {
      if (distance === maxDistance) {
        scores[i]++
      }
    })
  }
  return Math.max(...scores)
}

const EXAMPLE = `
Comet can fly 14 km/s for 10 seconds, but then must rest for 127 seconds.
Dancer can fly 16 km/s for 11 seconds, but then must rest for 162 seconds.`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 2660,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 1564,
      },
    ],
  },
} as AdventOfCodeContest
