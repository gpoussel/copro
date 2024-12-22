import { Md5 } from "ts-md5"
import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { breadthFirstSearch } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"
import { Direction } from "../../../../../utils/grid.js"

// 🎄 Advent of Code 2016 - Day 17

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

function solve(input: ReturnType<typeof parseInput>) {
  const startPosition = new Vector2(0, 0)
  const endPosition = new Vector2(3, 3)

  interface Node {
    path: string
    position: Vector2
  }

  return breadthFirstSearch<Node>(
    {
      position: startPosition,
      path: "",
    },
    {
      adjacents(node) {
        const { position, path } = node
        const hash = Md5.hashAsciiStr(input + path)
        const doors = hash
          .slice(0, 4)
          .split("")
          .map(c => c.charCodeAt(0) >= 98)
        const nodes = ["up", "down", "left", "right"]
          .filter((_, i) => doors[i])
          .map(direction => {
            const newPosition = position.move(direction as Direction)
            return {
              position: newPosition,
              path: path + direction.charAt(0).toUpperCase(),
            }
          })
          .filter(({ position }) => position.x >= 0 && position.y >= 0 && position.x < 4 && position.y < 4)
        return nodes
      },
      ends(node) {
        return node.position.equals(endPosition)
      },
      key(node) {
        return node.path
      },
      visitEnd(node, path) {
        return false
      },
    }
  )
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const result = solve(input)
  return result.path[result.path.length - 1].path
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const result = solve(input)
  return utils.iterate.max(result.paths.map(p => p.length))
}

const EXAMPLE = ``

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "ihgpwlah",
        expected: "DDRRRD",
      },
      {
        input: "kglvqrro",
        expected: "DDUDRLRRUDRD",
      },
      {
        input: "ulqzkmiv",
        expected: "DRURDRUDDLLDLUURRDULRLDUUDDDRR",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "ihgpwlah",
        expected: 370,
      },
      {
        input: "kglvqrro",
        expected: 492,
      },
      {
        input: "ulqzkmiv",
        expected: 830,
      },
    ],
  },
} as AdventOfCodeContest
