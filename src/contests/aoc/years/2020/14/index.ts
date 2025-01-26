import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 14

function parseInput(input: string) {
  const lines = utils.input.lines(input)
  return lines.map(line => {
    if (line.startsWith("mask =")) {
      return {
        type: "mask",
        mask: line.split(" = ")[1],
      }
    }
    return {
      type: "mem",
      address: Number(line.match(/\d+/)![0]),
      value: Number(line.split(" = ")[1]),
    }
  })
}

function applyMask(mask: string, binaryValue: string) {
  let result = ""
  for (let i = 0; i < mask.length; i++) {
    const maskBit = mask[i]
    const valueBit = binaryValue[i]
    if (maskBit === "X") {
      result += valueBit
    } else {
      result += maskBit
    }
  }
  return result
}

function applyMakToAddress(mask: string, address: number) {
  const binaryAddress = address.toString(2).padStart(36, "0")
  let result = [""]
  for (let i = 0; i < mask.length; i++) {
    const maskBit = mask[i]
    const addressBit = binaryAddress[i]
    if (maskBit === "0") {
      result = result.map(r => r + addressBit)
    } else if (maskBit === "1") {
      result = result.map(r => r + "1")
    } else {
      result = result.flatMap(r => [r + "0", r + "1"])
    }
  }
  return result.map(r => parseInt(r, 2))
}

function part1(inputString: string) {
  const instructions = parseInput(inputString)
  let mask: string = ""
  const memory = new Map<number, number>()
  for (const instruction of instructions) {
    if (instruction.type === "mask") {
      mask = instruction.mask!
      continue
    }
    const binaryValue = instruction.value!.toString(2).padStart(36, "0")
    const maskedValue = applyMask(mask!, binaryValue)
    memory.set(instruction.address!, parseInt(maskedValue, 2))
  }
  return [...memory.values()].reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const instructions = parseInput(inputString)
  let mask: string = ""
  const memory = new Map<number, number>()
  for (const instruction of instructions) {
    if (instruction.type === "mask") {
      mask = instruction.mask!
      continue
    }
    const binaryValue = instruction.value!.toString(2).padStart(36, "0")
    for (const address of applyMakToAddress(mask, instruction.address!)) {
      memory.set(address!, instruction.value!)
    }
  }
  return [...memory.values()].reduce((a, b) => a + b, 0)
}

const EXAMPLE1 = `
mask = XXXXXXXXXXXXXXXXXXXXXXXXXXXXX1XXXX0X
mem[8] = 11
mem[7] = 101
mem[8] = 0`

const EXAMPLE2 = `
mask = 000000000000000000000000000000X1001X
mem[42] = 100
mask = 00000000000000000000000000000000X0XX
mem[26] = 1`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 165,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE2,
        expected: 208,
      },
    ],
  },
} as AdventOfCodeContest
