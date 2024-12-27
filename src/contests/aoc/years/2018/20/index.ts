import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { fromCompassChar } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2018 - Day 20

function parseInput(input: string) {
  const fullString = utils.input.firstLine(input)
  return fullString.slice(1, fullString.length - 1)
}

function getDistances(input: string) {
  const distances = new Map<string, number>()
  interface Node {
    position: Vector2
    distance: number
  }
  let currentNode: Node = {
    position: new Vector2(0, 0),
    distance: 0,
  }
  distances.set(currentNode.position.str(), 0)
  const stack = [currentNode]
  for (let i = 0; i < input.length; ++i) {
    const char = input[i]
    if (char === "(") {
      stack.push(currentNode)
    } else if (char === "|") {
      currentNode = stack[stack.length - 1]
    } else if (char === ")") {
      currentNode = stack.pop()!
    } else {
      const nextPosition = currentNode.position.move(fromCompassChar(char as "N" | "E" | "S" | "W"))
      const shortestDistanceToNextPosition = Math.min(
        distances.get(nextPosition.str()) || Infinity,
        currentNode.distance + 1
      )
      distances.set(nextPosition.str(), shortestDistanceToNextPosition)
      currentNode = {
        position: nextPosition,
        distance: shortestDistanceToNextPosition,
      }
    }
  }
  return distances
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const distances = getDistances(input)
  return utils.iterate.max([...distances.values()])
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const distances = getDistances(input)
  return [...distances.values()].filter(distance => distance >= 1000).length
}

const EXAMPLES = [
  "^WNE$",
  "^ENWWW(NEEE|SSE(EE|N))$",
  "^ENNWSWW(NEWS|)SSSEEN(WNSE|)EE(SWEN|)NNN$",
  "^ESSWWN(E|NNENN(EESS(WNSE|)SSS|WWWSSSSE(SW|NNNE)))$",
  "^WSSEESWWWNW(S|NENNEEEENN(ESSSSW(NWSW|SSEN)|WSWWN(E|WWS(E|SS))))$",
]

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLES[0],
        expected: 3,
      },
      {
        input: EXAMPLES[1],
        expected: 10,
      },
      {
        input: EXAMPLES[2],
        expected: 18,
      },
      {
        input: EXAMPLES[3],
        expected: 23,
      },
      {
        input: EXAMPLES[4],
        expected: 31,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
