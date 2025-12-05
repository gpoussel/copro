import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 24

interface Operation {
  type: "inp" | "add" | "mul" | "div" | "mod" | "eql"
  a: string
  b?: string | number
}

function parseInput(input: string): Operation[] {
  return utils.input.lines(input).map(line => {
    const parts = line.split(" ")
    const type = parts[0] as Operation["type"]
    const a = parts[1]
    let b: string | number | undefined = undefined
    if (parts.length === 3) {
      const bPart = parts[2]
      const bNum = Number(bPart)
      b = isNaN(bNum) ? bPart : bNum
    }
    return { type, a, b }
  })
}

function part1(inputString: string) {
  const steps = parseInput(inputString)

  const parameters = []
  for (let index = 0; index < 18 * 14; index += 18) {
    const p1 = Number(steps[index + 4].b)
    const p2 = Number(steps[index + 5].b)
    const p3 = Number(steps[index + 15].b)
    parameters.push([p1, p2, p3])
  }

  const theFunctionThatRepeats = (params: number[], z: number, w: number) => {
    if ((z % 26) + params[1] !== w) return Math.floor(z / params[0]) * 26 + w + params[2]
    return Math.floor(z / params[0])
  }

  let maxForZ = new Map<number, string>()
  maxForZ.set(0, "")

  parameters.forEach((param, idx) => {
    const newMaxForZ = new Map<number, string>()
    for (const [z, model] of maxForZ) {
      for (let inputDigit = 9; inputDigit >= 1; inputDigit--) {
        const newZ = theFunctionThatRepeats(param, z, inputDigit)
        const newModel = model + inputDigit
        // Only keep states where z stays bounded (key insight: z acts like a stack in base 26)
        if (!newMaxForZ.has(newZ) || newMaxForZ.get(newZ)! < newModel) {
          newMaxForZ.set(newZ, newModel)
        }
      }
    }
    maxForZ = newMaxForZ
  })
  return maxForZ.get(0)
}

function part2(inputString: string) {
  const steps = parseInput(inputString)

  const parameters = []
  for (let index = 0; index < 18 * 14; index += 18) {
    const p1 = Number(steps[index + 4].b)
    const p2 = Number(steps[index + 5].b)
    const p3 = Number(steps[index + 15].b)
    parameters.push([p1, p2, p3])
  }

  const theFunctionThatRepeats = (params: number[], z: number, w: number) => {
    if ((z % 26) + params[1] !== w) return Math.floor(z / params[0]) * 26 + w + params[2]
    return Math.floor(z / params[0])
  }

  let minForZ = new Map<number, string>()
  minForZ.set(0, "")

  parameters.forEach((param, idx) => {
    const newMinForZ = new Map<number, string>()
    for (const [z, model] of minForZ) {
      for (let inputDigit = 1; inputDigit <= 9; inputDigit++) {
        const newZ = theFunctionThatRepeats(param, z, inputDigit)
        const newModel = model + inputDigit
        if (!newMinForZ.has(newZ) || newMinForZ.get(newZ)! > newModel) {
          newMinForZ.set(newZ, newModel)
        }
      }
    }
    minForZ = newMinForZ
  })
  return minForZ.get(0)
}

export default {
  part1: {
    run: part1,
    tests: [],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
