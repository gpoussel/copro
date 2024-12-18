import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { positiveModulo } from "../../../../../utils/math.js"

// 🎲 Everybody Codes 2024 - Quest 16

function parseInput(input: string) {
  const [firstLine, symbolsBlock] = utils.input.blocks(input)
  const rotations = firstLine.split(",").map(Number)
  const verticalStrips = rotations.map(_ => new Array<string>())
  for (const line of utils.input.lines(symbolsBlock)) {
    for (let i = 0; i < verticalStrips.length; ++i) {
      const symbol = line.slice(i * 4, i * 4 + 3)
      if (symbol.trim().length === 3) {
        verticalStrips[i].push(symbol)
      }
    }
  }
  return { rotations, verticalStrips }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const counters = input.rotations.map((r, index) => (100 * r) % input.verticalStrips[index].length)
  return input.verticalStrips.map((strip, index) => strip[counters[index]]).join(" ")
}

function getStateAtIndex(input: ReturnType<typeof parseInput>, pulls: number, offset: number) {
  const allUniqueCharacters = [...new Set(input.verticalStrips.flat().join(""))]

  const numbersAtIndex = input.rotations.map((r, index) =>
    positiveModulo(pulls * r + offset, input.verticalStrips[index].length)
  )
  const symbolsAtIndex = input.verticalStrips
    .map((strip, index) => strip[numbersAtIndex[index]])
    .join("")
    .split("")
    .filter((_, i) => i % 3 !== 1)
  const score = allUniqueCharacters
    .map(c => Math.max(utils.iterate.count(symbolsAtIndex, c) - 2, 0))
    .reduce((a, b) => a + b, 0)
  return { score }
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const leastCommonMultiple = utils.math.lcm(...input.verticalStrips.map(vs => vs.length))
  const numberOfLeverUsage = 202420242024
  const numberOfLoops = Math.floor(numberOfLeverUsage / leastCommonMultiple)
  const remaining = numberOfLeverUsage - numberOfLoops * leastCommonMultiple - 1
  const scoreInLoop = new Array<number>()
  let i = 1
  while (i <= leastCommonMultiple) {
    const { score } = getStateAtIndex(input, i, 0)
    scoreInLoop.push((scoreInLoop[scoreInLoop.length - 1] || 0) + score)
    ++i
  }
  const loopLength = i - 1
  return numberOfLoops * scoreInLoop[loopLength - 1] + scoreInLoop[remaining]
}

function part3(inputString: string) {
  const input = parseInput(inputString)
  // Rows = number of right lever pull
  // Columns = number of left lever pull
  const numberOfRightLeverPulls = 256
  const scores = Array.from({ length: numberOfRightLeverPulls + 1 }, _ => {
    const map = new Map<number, { min: number; max: number }>()
    for (let j = -numberOfRightLeverPulls; j <= numberOfRightLeverPulls; ++j) {
      map.set(j, { min: Infinity, max: -Infinity })
    }
    return map
  })
  scores[0].set(0, { min: 0, max: 0 })
  for (let i = 1; i <= numberOfRightLeverPulls; ++i) {
    for (let j = -i; j <= i; ++j) {
      const { score } = getStateAtIndex(input, i, j)
      const previousPossibleStates = [-1, 0, 1].map(k => scores[i - 1].get(j - k)!).filter(v => v !== undefined)
      scores[i].set(j, {
        min: Math.min(...previousPossibleStates.map(v => v.min)) + score,
        max: Math.max(...previousPossibleStates.map(v => v.max)) + score,
      })
    }
  }
  const maxScore = Math.max(...[...scores[numberOfRightLeverPulls].values()].map(s => s.max))
  const minScore = Math.min(...[...scores[numberOfRightLeverPulls].values()].map(s => s.min))
  return `${maxScore} ${minScore}`
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
1,2,3

^_^ -.- ^,-
>.- ^_^ >.<
-_- -.- >.<
    -.^ ^_^
    >.>`,
        expected: ">.- -.- ^,-",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
1,2,3

^_^ -.- ^,-
>.- ^_^ >.<
-_- -.- >.<
    -.^ ^_^
    >.>`,
        expected: 280014668134,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
1,2,3

^_^ -.- ^,-
>.- ^_^ >.<
-_- -.- ^.^
    -.^ >.<
    >.>`,
        expected: "627 128",
      },
    ],
  },
} as EverybodyCodesContest
