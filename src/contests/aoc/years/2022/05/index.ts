import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2022 - Day 5

function parseInput(input: string) {
  const [stacksBlock, movesBlock] = input.replace(/^\n/, "").split(/\n\n+/)
  const stackLinesReversed = stacksBlock.split(/\n/).slice(0, -1).reverse()
  const numStacks = Math.ceil(stackLinesReversed[0].length / 4)
  const stacks: string[][] = Array.from({ length: numStacks }, () => [])
  for (const line of stackLinesReversed) {
    for (let i = 0; i < numStacks; i++) {
      const crate = line[i * 4 + 1]
      if (crate !== " ") {
        stacks[i].push(crate)
      }
    }
  }
  const moves = utils.input.lines(movesBlock).map(line => {
    const match = line.match(/move (\d+) from (\d+) to (\d+)/)
    if (!match) throw new Error(`Invalid move line: ${line}`)
    return {
      count: +match[1],
      from: +match[2] - 1,
      to: +match[3] - 1,
    }
  })
  return { stacks, moves }
}

function part1(inputString: string) {
  const { stacks, moves } = parseInput(inputString)
  for (const move of moves) {
    for (let i = 0; i < move.count; i++) {
      const crate = stacks[move.from].pop()
      if (!crate) throw new Error(`No crate to move from stack ${move.from + 1}`)
      stacks[move.to].push(crate)
    }
  }
  return stacks.map(stack => stack[stack.length - 1]).join("")
}

function part2(inputString: string) {
  const { stacks, moves } = parseInput(inputString)
  for (const move of moves) {
    const movingCrates: string[] = []
    for (let i = 0; i < move.count; i++) {
      const crate = stacks[move.from].pop()
      if (!crate) throw new Error(`No crate to move from stack ${move.from + 1}`)
      movingCrates.push(crate)
    }
    for (let i = movingCrates.length - 1; i >= 0; i--) {
      stacks[move.to].push(movingCrates[i])
    }
  }
  return stacks.map(stack => stack[stack.length - 1]).join("")
}

const EXAMPLE = `
    [D]    
[N] [C]    
[Z] [M] [P]
 1   2   3 

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: "CMZ",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: "MCD",
      },
    ],
  },
} as AdventOfCodeContest
