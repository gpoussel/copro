import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 25

function parseInput(input: string) {
  const blocks = utils.input.blocks(input)
  const firstBlockLines = utils.input.lines(blocks[0])
  const initialState = firstBlockLines[0].match(/Begin in state (\w)\./)![1]
  const steps = Number(firstBlockLines[1].match(/Perform a diagnostic checksum after (\d+) steps\./)![1])
  const states = blocks.slice(1).map(block => {
    const lines = utils.input.lines(block)
    const state = lines[0].match(/In state (\w):/)![1]

    const steps = Array.from({ length: 2 }, (_, i) => {
      const writeLine = lines[2 + i * 4]
      const writeValue = Number(writeLine.match(/Write the value (\d)\./)![1])
      const moveLine = lines[3 + i * 4]
      const moveDirection = moveLine.match(/Move one slot to the (left|right)\./)![1]
      const nextStateLine = lines[4 + i * 4]
      const nextState = nextStateLine.match(/Continue with state (\w)\./)![1]
      return {
        writeValue,
        moveDirection,
        nextState,
      }
    })
    return {
      state,
      steps,
    }
  })
  return {
    initialState,
    steps,
    states,
  }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  let state = input.initialState
  let cursor = 0
  const tape = new Map<number, number>()
  for (let i = 0; i < input.steps; i++) {
    const value = tape.get(cursor) || 0
    const step = input.states.find(s => s.state === state)!.steps[value]
    tape.set(cursor, step.writeValue)
    cursor += step.moveDirection === "left" ? -1 : 1
    state = step.nextState
  }
  return Array.from(tape.values()).filter(v => v === 1).length
}

function part2() {
  return "Merry Christmas!"
}

const EXAMPLE = `
Begin in state A.
Perform a diagnostic checksum after 6 steps.

In state A:
  If the current value is 0:
    - Write the value 1.
    - Move one slot to the right.
    - Continue with state B.
  If the current value is 1:
    - Write the value 0.
    - Move one slot to the left.
    - Continue with state B.

In state B:
  If the current value is 0:
    - Write the value 1.
    - Move one slot to the left.
    - Continue with state A.
  If the current value is 1:
    - Write the value 1.
    - Move one slot to the right.
    - Continue with state A.`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 3,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
