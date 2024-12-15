import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2024 - Quest 11

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [individual, generations] = line.split(":")
    return {
      individual,
      generations: generations.split(","),
    }
  })
}

function conversion(input: ReturnType<typeof parseInput>) {
  return (foo: string) => input.find(({ individual }) => individual === foo)!.generations
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const conversionFn = conversion(input)
  let population = ["A"]
  for (let i = 0; i < 4; ++i) {
    population = population.flatMap(conversionFn)
  }
  return population.length
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const conversionFn = conversion(input)
  let population = ["Z"]
  for (let i = 0; i < 10; ++i) {
    population = population.flatMap(conversionFn)
  }
  return population.length
}

function part3(inputString: string) {
  const input = parseInput(inputString)
  const conversionFn = conversion(input)

  const dp = new Map<string, Map<number, number>>()
  for (const { individual } of input) {
    dp.set(individual, new Map())
    dp.get(individual)!.set(0, 1)
  }
  for (let i = 1; i <= 20; ++i) {
    for (const { individual } of input) {
      const generations = conversionFn(individual)
      let sum = 0
      for (const foo of generations) {
        sum += dp.get(foo)!.get(i - 1)!
      }
      dp.get(individual)!.set(i, sum)
    }
  }

  const outputLengths = input.map(({ individual: startingPoint }) => dp.get(startingPoint)!.get(20)!)
  const max = Math.max(...outputLengths)
  const min = Math.min(...outputLengths)
  return max - min
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
A:B,C
B:C,A
C:A`,
        expected: 8,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
A:B,C
B:C,A,A
C:A`,
        expected: 268815,
      },
    ],
  },
} as EverybodyCodesContest
