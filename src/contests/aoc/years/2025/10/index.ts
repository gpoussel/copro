import { solve, equalTo } from "yalps"
import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2025 - Day 10

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const parts = line.split(" ")
    const target = parts[0].slice(1, -1)
    const joltage = parts[parts.length - 1].slice(1, -1).split(",").map(Number)
    const switches = parts.slice(1, parts.length - 1).map(part => part.slice(1, -1).split(",").map(Number))
    return { target, switches, joltage }
  })
}

function swap(car: string) {
  return car === "#" ? "." : "#"
}

function getMinMovesForSwitches(target: string, switches: number[][]): number {
  let rounds = 0
  const memory: Map<string, number> = new Map()
  const statesByRound = new Map<number, Set<string>>()
  statesByRound.set(
    0,
    new Set([
      target
        .split("")
        .map(c => ".")
        .join(""),
    ])
  )

  while (!memory.has(target)) {
    const previousStates = statesByRound.get(rounds)!
    const newStates: Set<string> = new Set()
    for (const state of previousStates) {
      for (const switchOptions of switches) {
        let newState = state.split("")
        for (const switchIndex of switchOptions) {
          newState[switchIndex] = swap(newState[switchIndex])
        }
        const newStateStr = newState.join("")
        if (!memory.has(newStateStr)) {
          memory.set(newStateStr, rounds + 1)
          newStates.add(newStateStr)
        }
      }
    }
    rounds++
    statesByRound.set(rounds, newStates)
  }
  return rounds
}

function part1(inputString: string) {
  const machines = parseInput(inputString)
  return machines.map(machine => getMinMovesForSwitches(machine.target, machine.switches)).reduce((a, b) => a + b, 0)
}

function getMinMovesForJoltage(target: number[], switches: number[][]): number {
  // Objective: minimize sum of x_i

  // Build constraints: for each position i, sum_j switches[j][i] * x_j == target[i]
  const constraints: Record<string, any> = {}
  for (let i = 0; i < target.length; i++) {
    constraints[`r${i}`] = equalTo(target[i])
  }

  // Build variables: one variable per switch (move). Each variable lists coefficients
  // for every constraint and a 'count' coefficient used as the objective (minimize total count).
  const variables: Record<string, any> = {}
  for (let j = 0; j < switches.length; j++) {
    const coeffs: Record<string, number> = {}
    for (let i = 0; i < target.length; i++) {
      coeffs[`r${i}`] = 0
    }
    for (const pos of switches[j]) {
      coeffs[`r${pos}`] = 1
    }
    coeffs.count = 1
    variables[`x${j}`] = coeffs
  }
  // Debug: print model (after constraints and variables are built)
  const model = {
    direction: "minimize" as const,
    objective: "count",
    constraints,
    variables,
    integers: true,
  }

  const sol = solve(model)
  if (!sol || sol.status !== "optimal") {
    throw new Error("ILP infeasible or did not reach optimal solution")
  }
  return sol.variables.reduce((s, [, v]) => s + v, 0)
}

function part2(inputString: string) {
  const machines = parseInput(inputString)
  return machines.map(machine => getMinMovesForJoltage(machine.joltage, machine.switches)).reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 7,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 33,
      },
    ],
  },
} as AdventOfCodeContest
