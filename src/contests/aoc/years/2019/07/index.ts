import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Computer } from "../09/index.js"

// 🎄 Advent of Code 2019 - Day 7

class Circuit {
  tape: number[]
  phaseSettings: number[]
  computers: Computer[]
  computerIndex: number

  constructor(tape: number[], phaseSettings: number[], circuitSize = 5) {
    this.tape = tape
    this.phaseSettings = phaseSettings
    this.computers = Array.from({ length: circuitSize }, (_, i) => {
      const computerPhase = [phaseSettings[i]]
      if (i === 0) {
        computerPhase.push(0)
      }

      return new Computer(tape, computerPhase)
    })

    this.computerIndex = 0
  }

  run() {
    let computer = this.computers[this.computerIndex]
    let output, lastOutput

    while (!computer.halted) {
      const newOutput = computer.run()
      if (computer.halted) {
        break
      }

      output = newOutput

      const nextComputer = this.moveToNextComputer()
      lastOutput = output.shift()!
      nextComputer.inputs.push(lastOutput)

      computer = nextComputer
    }

    return lastOutput
  }

  moveToNextComputer() {
    this.computerIndex++
    this.computerIndex %= this.computers.length

    return this.computers[this.computerIndex]
  }
}

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function findBestPermutations(input: number[], phaseSettings: number[]) {
  let bestOutput: { output: number; permutation: number[] } | undefined = undefined
  for (const permutation of utils.iterate.permutations(phaseSettings)) {
    const circuit = new Circuit(input, permutation)
    const output = circuit.run()!
    if (!bestOutput || output > bestOutput.output) {
      bestOutput = { output, permutation }
    }
  }
  return bestOutput?.output
}

function part1(inputString: string) {
  const program = parseInput(inputString)
  return findBestPermutations(program, [0, 1, 2, 3, 4])
}

function part2(inputString: string) {
  const program = parseInput(inputString)
  return findBestPermutations(program, [5, 6, 7, 8, 9])
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0",
        expected: 43210,
      },
      {
        input: "3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0",
        expected: 54321,
      },
      {
        input: "3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0",
        expected: 65210,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5",
        expected: 139629729,
      },
      {
        input:
          "3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,-5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10",
        expected: 18216,
      },
    ],
  },
} as AdventOfCodeContest
