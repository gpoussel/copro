import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { DIRECTION_CHARS, fromDirectionChar } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2024 - Day 21

function parseInput(input: string) {
  return utils.input.lines(input)
}

const NUMERIC_KEYPAD = {
  0: new Vector2(1, 3),
  1: new Vector2(0, 2),
  2: new Vector2(1, 2),
  3: new Vector2(2, 2),
  4: new Vector2(0, 1),
  5: new Vector2(1, 1),
  6: new Vector2(2, 1),
  7: new Vector2(0, 0),
  8: new Vector2(1, 0),
  9: new Vector2(2, 0),
  A: new Vector2(2, 3),
  _: new Vector2(0, 3),
}
const DIR_KEYPAD = {
  _: new Vector2(0, 0),
  [DIRECTION_CHARS.up]: new Vector2(1, 0),
  [DIRECTION_CHARS.down]: new Vector2(1, 1),
  [DIRECTION_CHARS.left]: new Vector2(0, 1),
  [DIRECTION_CHARS.right]: new Vector2(2, 1),
  A: new Vector2(2, 0),
}

function sequenceBetweenPositions(start: Vector2, end: Vector2, avoid: Vector2) {
  const delta = end.subtract(start)
  const moves = [
    ...Array(Math.abs(delta.x)).fill(delta.x < 0 ? DIRECTION_CHARS.left : DIRECTION_CHARS.right),
    ...Array(Math.abs(delta.y)).fill(delta.y < 0 ? DIRECTION_CHARS.up : DIRECTION_CHARS.down),
  ] as (keyof typeof DIRECTION_CHARS)[]

  return utils.iterate
    .permutations(moves)
    .map(p => {
      const path = p.reduce(
        (path: Vector2[], move: keyof typeof DIRECTION_CHARS) => {
          const nextPos = path[path.length - 1].move(fromDirectionChar(move))
          return [...path, nextPos]
        },
        [start]
      )
      return { permutation: p, path }
    })
    .filter(({ path }) => !path.some(pos => pos.equals(avoid)))
    .map(({ permutation }) => permutation.join("") + "A")
}

function memoMinLength() {
  const memo = new Map<string, number>()
  function minLength(presses: string, limit: number, depth: number): number {
    const memoKey = `${presses}-${depth}-${limit}`
    if (memo.has(memoKey)) {
      return memo.get(memoKey)!
    }

    const numeric = depth === 0

    const avoid = numeric ? NUMERIC_KEYPAD._ : DIR_KEYPAD._
    let current = numeric ? NUMERIC_KEYPAD.A : DIR_KEYPAD.A

    let totalLength = 0
    for (const char of presses) {
      const nextPos = numeric
        ? NUMERIC_KEYPAD[char as keyof typeof NUMERIC_KEYPAD]
        : DIR_KEYPAD[char as keyof typeof DIR_KEYPAD]
      const moveSets = sequenceBetweenPositions(current, nextPos, avoid)

      if (depth === limit) {
        totalLength += utils.iterate.min(moveSets.map(moves => moves.length))
      } else {
        totalLength += utils.iterate.min(moveSets.map(moves => minLength(moves, limit, depth + 1)))
      }

      current = nextPos
    }

    memo.set(memoKey, totalLength)
    return totalLength
  }
  return minLength
}

function findBestScore(minLength: ReturnType<typeof memoMinLength>, code: string, robotsCount: number) {
  const pathLength = minLength(code, robotsCount, 0)
  const numericPartOfCode = parseInt(code.substring(0, code.length - 1), 10)
  return pathLength * numericPartOfCode
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const minLength = memoMinLength()
  return input.map(code => findBestScore(minLength, code, 2)).reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const minLength = memoMinLength()
  return input.map(code => findBestScore(minLength, code, 25)).reduce((a, b) => a + b, 0)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "179A",
        expected: 12172,
      },
      {
        input: "029A",
        expected: 1972,
      },
      {
        input: "980A",
        expected: 58800,
      },
      {
        input: "379A",
        expected: 24256,
      },
      {
        input: "456A",
        expected: 29184,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "179A",
        expected: 14543936021812,
      },
    ],
  },
} as AdventOfCodeContest
