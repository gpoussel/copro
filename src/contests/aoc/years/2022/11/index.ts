import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2022 - Day 11

interface Monkey {
  id: number
  startingItems: number[]
  operation: (old: number) => number
  testDivisibleBy: number
  ifTrueThrowTo: number
  ifFalseThrowTo: number
}

function parseInput(input: string): Monkey[] {
  const blocks = utils.input.blocks(input)
  return blocks.map(block => {
    const lines = utils.input.lines(block)
    const id = +lines[0].match(/Monkey (\d+):/)![1]
    const startingItems = lines[1]
      .match(/Starting items: (.+)/)![1]
      .split(",")
      .map(s => +s.trim())
    const operationMatch = lines[2].match(/Operation: new = old (.+) (.+)/)!
    const operation = (old: number) => {
      const rightOperand = operationMatch[2] === "old" ? old : +operationMatch[2]
      switch (operationMatch[1]) {
        case "+":
          return old + rightOperand
        case "*":
          return old * rightOperand
        default:
          throw new Error(`Unknown operation: ${operationMatch[1]}`)
      }
    }
    const testDivisibleBy = +lines[3].match(/Test: divisible by (.+)/)![1]
    const ifTrueThrowTo = +lines[4].match(/If true: throw to monkey (.+)/)![1]
    const ifFalseThrowTo = +lines[5].match(/If false: throw to monkey (.+)/)![1]

    return {
      id,
      startingItems,
      operation,
      testDivisibleBy,
      ifTrueThrowTo,
      ifFalseThrowTo,
    }
  })
}

function getMonkeyBusinessLevel(inspectionsCount: Map<number, number>) {
  return Array.from(inspectionsCount.values())
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((acc, count) => acc * count, 1)
}

function runInspectionRound(monkeys: Monkey[], count: number, divideWorryLevelBy: number | null) {
  const inspectionsCount = new Map<number, number>()
  monkeys.forEach(monkey => inspectionsCount.set(monkey.id, 0))

  // For part 2, we need to keep numbers manageable using modular arithmetic
  // The product of all divisors preserves all divisibility tests
  const modulo = monkeys.reduce((acc, m) => acc * m.testDivisibleBy, 1)

  for (let round = 0; round < count; round++) {
    for (const monkey of monkeys) {
      while (monkey.startingItems.length > 0) {
        inspectionsCount.set(monkey.id, inspectionsCount.get(monkey.id)! + 1)
        const item = monkey.startingItems.shift()!
        let worryLevel = item
        worryLevel = monkey.operation(worryLevel)
        if (divideWorryLevelBy) {
          worryLevel = Math.floor(worryLevel / divideWorryLevelBy)
        } else {
          worryLevel = worryLevel % modulo
        }
        if (worryLevel % monkey.testDivisibleBy === 0) {
          const targetMonkey = monkeys.find(m => m.id === monkey.ifTrueThrowTo)!
          targetMonkey.startingItems.push(worryLevel)
        } else {
          const targetMonkey = monkeys.find(m => m.id === monkey.ifFalseThrowTo)!
          targetMonkey.startingItems.push(worryLevel)
        }
      }
    }
  }
  return inspectionsCount
}

function part1(inputString: string) {
  const monkeys = parseInput(inputString)
  return getMonkeyBusinessLevel(runInspectionRound(monkeys, 20, 3))
}

function part2(inputString: string) {
  const monkeys = parseInput(inputString)
  return getMonkeyBusinessLevel(runInspectionRound(monkeys, 10000, null))
}

const EXAMPLE = `
Monkey 0:
  Starting items: 79, 98
  Operation: new = old * 19
  Test: divisible by 23
    If true: throw to monkey 2
    If false: throw to monkey 3

Monkey 1:
  Starting items: 54, 65, 75, 74
  Operation: new = old + 6
  Test: divisible by 19
    If true: throw to monkey 2
    If false: throw to monkey 0

Monkey 2:
  Starting items: 79, 60, 97
  Operation: new = old * old
  Test: divisible by 13
    If true: throw to monkey 1
    If false: throw to monkey 3

Monkey 3:
  Starting items: 74
  Operation: new = old + 3
  Test: divisible by 17
    If true: throw to monkey 0
    If false: throw to monkey 1`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 10605,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 2713310158,
      },
    ],
  },
} as AdventOfCodeContest
