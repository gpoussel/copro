import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes Story 1 - Quest 1

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const assignments = line
      .split(" ")
      .map(part => part.split("="))
      .map(([key, value]) => [key, Number(value)]) as [string, number][]
    return Object.fromEntries(assignments)
  })
}

function eni(n: number, exp: number, mod: number, lastRemainders: number | undefined = undefined) {
  if (exp === 0) {
    return 0
  }

  const lr = lastRemainders === undefined ? exp : lastRemainders

  const remainders: number[] = []
  const seenRemainders = new Map<number, number>()
  let result = 1

  for (let i = 0; i < exp; i++) {
    result = (result * n) % mod
    if (seenRemainders.has(result)) {
      const cycleStartIndex = seenRemainders.get(result)!
      const prefix = remainders.slice(0, cycleStartIndex)
      const cycle = remainders.slice(cycleStartIndex)

      const finalRemainders: number[] = []
      const numFinalRemainders = Math.min(exp, lr)

      for (let j = 0; j < numFinalRemainders; j++) {
        const virtualIndex = exp - numFinalRemainders + j
        if (virtualIndex < prefix.length) {
          finalRemainders.push(prefix[virtualIndex])
        } else {
          const indexInCycle = (virtualIndex - prefix.length) % cycle.length
          finalRemainders.push(cycle[indexInCycle])
        }
      }
      return +finalRemainders.reverse().join("")
    }
    seenRemainders.set(result, i)
    remainders.push(result)
  }

  const consideredRemainders = lr ? remainders.slice(-lr) : remainders
  const response = +consideredRemainders.reverse().join("")
  return response
}

function part1(inputString: string) {
  const cases = parseInput(inputString)
  return Math.max(...cases.map(({ A, B, C, X, Y, Z, M }) => eni(A, X, M) + eni(B, Y, M) + eni(C, Z, M)))
}

function part2(inputString: string) {
  const cases = parseInput(inputString)
  return Math.max(...cases.map(({ A, B, C, X, Y, Z, M }) => eni(A, X, M, 5) + eni(B, Y, M, 5) + eni(C, Z, M, 5)))
}

function eniSumOfRemainders(n: number, exp: number, mod: number) {
  if (exp === 0) {
    return 0n
  }

  const remainders: number[] = []
  const seenRemainders = new Map<number, number>()
  let result = 1

  for (let i = 0; i < exp; i++) {
    result = (result * n) % mod
    if (seenRemainders.has(result)) {
      const cycleStartIndex = seenRemainders.get(result)!
      const prefix = remainders.slice(0, cycleStartIndex)
      const cycle = remainders.slice(cycleStartIndex)

      const prefixSum = prefix.reduce((a, b) => a + b, 0)
      const cycleSum = cycle.reduce((a, b) => a + b, 0)

      const remainingExp = exp - prefix.length
      const numCycles = Math.floor(remainingExp / cycle.length)
      const remainingInCycle = remainingExp % cycle.length
      const partialCycleSum = cycle.slice(0, remainingInCycle).reduce((a, b) => a + b, 0)

      return BigInt(prefixSum) + BigInt(cycleSum) * BigInt(numCycles) + BigInt(partialCycleSum)
    }
    seenRemainders.set(result, i)
    remainders.push(result)
  }

  return BigInt(remainders.reduce((a, b) => a + b, 0))
}

function part3(inputString: string) {
  const cases = parseInput(inputString)
  return Math.max(
    ...cases.map(
      ({ A, B, C, X, Y, Z, M }) =>
        Number(eniSumOfRemainders(A, X, M)) +
        Number(eniSumOfRemainders(B, Y, M)) +
        Number(eniSumOfRemainders(C, Z, M))
    )
  )
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
A=4 B=4 C=6 X=3 Y=4 Z=5 M=11
A=8 B=4 C=7 X=8 Y=4 Z=6 M=12
A=2 B=8 C=6 X=2 Y=4 Z=5 M=13
A=5 B=9 C=6 X=8 Y=6 Z=8 M=14
A=5 B=9 C=7 X=6 Y=6 Z=8 M=15
A=8 B=8 C=8 X=6 Y=9 Z=6 M=16`,
        expected: 11611972920,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
A=4 B=4 C=6 X=3 Y=14 Z=15 M=11
A=8 B=4 C=7 X=8 Y=14 Z=16 M=12
A=2 B=8 C=6 X=2 Y=14 Z=15 M=13
A=5 B=9 C=6 X=8 Y=16 Z=18 M=14
A=5 B=9 C=7 X=6 Y=16 Z=18 M=15
A=8 B=8 C=8 X=6 Y=19 Z=16 M=16`,
        expected: 11051340,
      },
      {
        input: `
A=3657 B=3583 C=9716 X=903056852 Y=9283895500 Z=85920867478 M=188
A=6061 B=4425 C=5082 X=731145782 Y=1550090416 Z=87586428967 M=107
A=7818 B=5395 C=9975 X=122388873 Y=4093041057 Z=58606045432 M=102
A=7681 B=9603 C=5681 X=716116871 Y=6421884967 Z=66298999264 M=196
A=7334 B=9016 C=8524 X=297284338 Y=1565962337 Z=86750102612 M=145`,
        expected: 1507702060886,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
A=4 B=4 C=6 X=3000 Y=14000 Z=15000 M=110
A=8 B=4 C=7 X=8000 Y=14000 Z=16000 M=120
A=2 B=8 C=6 X=2000 Y=14000 Z=15000 M=130
A=5 B=9 C=6 X=8000 Y=16000 Z=18000 M=140
A=5 B=9 C=7 X=6000 Y=16000 Z=18000 M=150
A=8 B=8 C=8 X=6000 Y=19000 Z=16000 M=160`,
        expected: 3279640,
      },
      {
        input: `
A=3657 B=3583 C=9716 X=903056852 Y=9283895500 Z=85920867478 M=188
A=6061 B=4425 C=5082 X=731145782 Y=1550090416 Z=87586428967 M=107
A=7818 B=5395 C=9975 X=122388873 Y=4093041057 Z=58606045432 M=102
A=7681 B=9603 C=5681 X=716116871 Y=6421884967 Z=66298999264 M=196
A=7334 B=9016 C=8524 X=297284338 Y=1565962337 Z=86750102612 M=145`,
        expected: 7276515438396,
      },
    ],
  },
} as EverybodyCodesContest
