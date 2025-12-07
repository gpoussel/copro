import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2025 - Quest 1

function parseInput(input: string) {
  const [names, moves] = utils.input.blocks(input)
  return {
    names: names.split(","),
    moves: moves.split(",").map(line => {
      const [dir, ...steps] = line.split("")
      return { dir, steps: Number(steps.join("")) }
    }),
  }
}

function part1(inputString: string) {
  const { names, moves } = parseInput(inputString)
  let position = 0
  for (const move of moves) {
    if (move.dir === "R") {
      position = Math.min(names.length - 1, position + move.steps)
    } else if (move.dir === "L") {
      position = Math.max(0, position - move.steps)
    }
  }
  return names[position]
}

function part2(inputString: string) {
  const { names, moves } = parseInput(inputString)
  let position = 0
  for (const move of moves) {
    if (move.dir === "R") {
      position = (position + move.steps) % names.length
    } else if (move.dir === "L") {
      position = (position - move.steps + names.length) % names.length
    }
  }
  return names[position]
}

function part3(inputString: string) {
  const { names, moves } = parseInput(inputString)
  for (const move of moves) {
    const position =
      move.dir === "R" ? move.steps % names.length : (names.length - (move.steps % names.length)) % names.length
    const topNode = names[0]
    const otherNode = names[position]
    names[0] = otherNode
    names[position] = topNode
  }
  return names[0]
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `Vyrdax,Drakzyph,Fyrryn,Elarzris

R3,L2,R3,L1`,
        expected: "Fyrryn",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `Vyrdax,Drakzyph,Fyrryn,Elarzris

R3,L2,R3,L1`,
        expected: "Elarzris",
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `Vyrdax,Drakzyph,Fyrryn,Elarzris

R3,L2,R3,L3`,
        expected: "Drakzyph",
      },
    ],
  },
} as EverybodyCodesContest
