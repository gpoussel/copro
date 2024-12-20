import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 9

function parseInput(input: string) {
  const edges = utils.input.lines(input).map(line => {
    const [from, _to, to, _eq, distance] = line.split(" ")
    return {
      from,
      to,
      distance: parseInt(distance),
    }
  })
  const cities = new Set<string>()
  for (const edge of edges) {
    cities.add(edge.from)
    cities.add(edge.to)
  }
  return { edges, cities: [...cities] }
}

function travel(input: ReturnType<typeof parseInput>) {
  const distances = utils.iterate
    .permutations(input.cities.sort(), (a, b) => a.localeCompare(b))
    .map(
      permutation =>
        permutation.slice(1).reduce(
          (acc, city) => {
            return {
              lastCity: city,
              distance:
                acc.distance +
                input.edges.find(
                  edge =>
                    (edge.from === acc.lastCity && edge.to === city) || (edge.to === acc.lastCity && edge.from === city)
                )!.distance,
            }
          },
          {
            lastCity: permutation[0],
            distance: 0,
          }
        ).distance
    )
  return {
    minDistance: Math.min(...distances),
    maxDistance: Math.max(...distances),
  }
}

function part1(inputString: string) {
  const { minDistance } = travel(parseInput(inputString))
  return minDistance
}

function part2(inputString: string) {
  const { maxDistance } = travel(parseInput(inputString))
  return maxDistance
}

const EXAMPLE = `
London to Dublin = 464
London to Belfast = 518
Dublin to Belfast = 141`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 605,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 982,
      },
    ],
  },
} as AdventOfCodeContest
