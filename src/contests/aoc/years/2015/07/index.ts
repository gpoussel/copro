import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 7

function parseInput(input: string) {
  return utils.input.lines(input)
}

const MASK = 0xffff

function evaluate(wiringLines: string[], expression: string) {
  const wires = new Map<string, string>()

  for (const line of wiringLines) {
    const [expression, wire] = line.split(" -> ")
    wires.set(wire, expression)
  }

  const evaluationCache = new Map<string, number>()

  function evaluateExpression(input: string) {
    if (input.match(/^\d+$/)) {
      return +input
    }
    if (evaluationCache.has(input)) {
      return evaluationCache.get(input)!
    }
    const result = evaluateVariable(input)
    evaluationCache.set(input, result)
    return result
  }

  function evaluateVariable(name: string): number {
    const wire = wires.get(name)
    if (!wire) {
      throw new Error(`Unknown wire: ${name}`)
    }
    const parts = wire.split(" ")
    if (parts.length === 1) {
      return evaluateExpression(parts[0])
    }
    if (parts.length === 2 && parts[0] === "NOT") {
      const n = evaluateExpression(parts[1])
      return ~n & MASK
    }
    if (parts.length === 3 && parts[1] === "OR") {
      const n1 = evaluateExpression(parts[0])
      const n2 = evaluateExpression(parts[2])
      return n1 | n2
    }
    if (parts.length === 3 && parts[1] === "AND") {
      const n1 = evaluateExpression(parts[0])
      const n2 = evaluateExpression(parts[2])
      return n1 & n2
    }
    if (parts.length === 3 && parts[1] === "LSHIFT") {
      const n = evaluateExpression(parts[0])
      const shift = +parts[2]
      return (n << shift) & MASK
    }
    if (parts.length === 3 && parts[1] === "RSHIFT") {
      const n = evaluateExpression(parts[0])
      const shift = +parts[2]
      return (n >> shift) & MASK
    }
    throw new Error(`Unknown expression: ${wire}`)
  }
  return evaluateVariable(expression)
}

function part1(inputString: string) {
  const wiringLines = parseInput(inputString)
  return evaluate(wiringLines, "a")
}

function part2(inputString: string) {
  const wiringLines = parseInput(inputString)
  const a = evaluate(wiringLines, "a")
  const wiringLinesUpdated = [...wiringLines.filter(line => !line.endsWith(" -> b")), `${a} -> b`]
  return evaluate(wiringLinesUpdated, "a")
}

const EXAMPLE = `
123 -> x
456 -> y
x AND y -> d
x OR y -> e
x LSHIFT 2 -> f
y RSHIFT 2 -> g
NOT x -> h
NOT y -> a`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 65079,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 65079,
      },
    ],
  },
} as AdventOfCodeContest
