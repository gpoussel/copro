import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 15

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",")
}

function hash(str: string): number {
  let value = 0
  for (const char of str) {
    value += char.charCodeAt(0)
    value *= 17
    value %= 256
  }
  return value
}

function part1(inputString: string) {
  const steps = parseInput(inputString)
  return steps.map(hash).reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const steps = parseInput(inputString)
  const boxes: { label: string; focal: number }[][] = Array.from({ length: 256 }, () => [])

  for (const step of steps) {
    if (step.includes("=")) {
      const [label, focalStr] = step.split("=")
      const focal = +focalStr
      const boxIdx = hash(label)
      const existing = boxes[boxIdx].findIndex(lens => lens.label === label)
      if (existing >= 0) {
        boxes[boxIdx][existing].focal = focal
      } else {
        boxes[boxIdx].push({ label, focal })
      }
    } else {
      const label = step.slice(0, -1)
      const boxIdx = hash(label)
      boxes[boxIdx] = boxes[boxIdx].filter(lens => lens.label !== label)
    }
  }

  let power = 0
  for (let boxIdx = 0; boxIdx < 256; boxIdx++) {
    for (let slotIdx = 0; slotIdx < boxes[boxIdx].length; slotIdx++) {
      power += (boxIdx + 1) * (slotIdx + 1) * boxes[boxIdx][slotIdx].focal
    }
  }
  return power
}

const EXAMPLE = `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 1320,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 145,
      },
    ],
  },
} as AdventOfCodeContest
