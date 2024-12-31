import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2019 - Day 22

type Instruction =
  | { type: "deal-into-new-stack" }
  | { type: "deal-with-increment"; increment: number }
  | { type: "cut"; count: number }

function parseInput(input: string): Instruction[] {
  return utils.input.lines(input).map(line => {
    if (line === "deal into new stack") {
      return { type: "deal-into-new-stack" }
    }
    if (line.startsWith("deal with increment ")) {
      return { type: "deal-with-increment", increment: Number(line.slice("deal with increment ".length)) }
    }
    if (line.startsWith("cut ")) {
      return { type: "cut", count: Number(line.slice("cut ".length)) }
    }
    throw new Error(`Invalid instruction: ${line}`)
  })
}

function part1(inputString: string) {
  const instructions = parseInput(inputString)
  let deck = Array.from({ length: 10007 }, (_, i) => i)
  for (const instruction of instructions) {
    if (instruction.type === "deal-into-new-stack") {
      deck.reverse()
    } else if (instruction.type === "deal-with-increment") {
      const newDeck = Array(deck.length)
      let i = 0
      for (const card of deck) {
        newDeck[i] = card
        i = (i + instruction.increment) % deck.length
      }
      deck = newDeck
    } else if (instruction.type === "cut") {
      deck = [...deck.slice(instruction.count), ...deck.slice(0, instruction.count)]
    }
  }
  return deck.indexOf(2019)
}

function part2(inputString: string) {
  const instructions = parseInput(inputString)
  const times = 101_741_582_076_661n
  const deckSize = 119_315_717_514_047n

  let incMultiplier = 1n
  let offsetDiff = 0n

  for (const instruction of instructions) {
    if (instruction.type === "deal-into-new-stack") {
      incMultiplier = -incMultiplier % deckSize
      offsetDiff = (offsetDiff + incMultiplier) % deckSize
    } else if (instruction.type === "deal-with-increment") {
      incMultiplier = (incMultiplier * utils.math.modInv(instruction.increment, deckSize)) % deckSize
    } else if (instruction.type === "cut") {
      offsetDiff = (offsetDiff + BigInt(instruction.count) * incMultiplier) % deckSize
    }
  }

  const inc: bigint = utils.math.modPow(incMultiplier, times, deckSize)
  let offset = (offsetDiff * (1n - inc) * utils.math.modInv((1n - incMultiplier) % deckSize, deckSize)) % deckSize
  return Number((offset + inc * 2020n) % deckSize)
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
