import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Computer } from "../09/index.js"

// 🎄 Advent of Code 2019 - Day 23

class Network {
  tape: number[]
  computers: Computer[]
  previousNatPacket: { x: number; y: number } | undefined = undefined
  natPacket: { x: number; y: number } | undefined = undefined

  constructor(tape: number[], size: number) {
    this.tape = tape
    this.computers = Array.from({ length: size }, (_, i) => new Computer(tape, [i]))
  }

  run(nat: boolean) {
    while (true) {
      for (let i = 0; i < this.computers.length; i++) {
        const computer = this.computers[i]
        if (computer.inputs.length === 0) {
          computer.inputs.push(-1)
        }
        computer.runUntilInputEmpty()
      }

      let networkIdle = true
      for (const computer of this.computers) {
        if (computer.outputs.length % 3 !== 0) {
          throw new Error("Uh.. invalid output")
        }
        while (computer.outputs.length > 0) {
          const address = computer.outputs.shift()!
          const x = computer.outputs.shift()!
          const y = computer.outputs.shift()!
          if (address === 255) {
            if (nat) {
              this.natPacket = { x, y }
            } else {
              return y
            }
          } else if (address >= 0 && address < this.computers.length) {
            this.computers[address].inputs.push(x, y)
          } else {
            throw new Error("Invalid address: " + address)
          }
          networkIdle = false
        }
      }

      if (networkIdle && this.natPacket !== undefined) {
        if (this.previousNatPacket !== undefined && this.previousNatPacket.y === this.natPacket.y) {
          return this.natPacket.y
        }
        this.computers[0].inputs.push(this.natPacket.x, this.natPacket.y)
        this.previousNatPacket = this.natPacket
      }
    }
  }
}

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function part1(inputString: string) {
  const program = parseInput(inputString)
  const circuit = new Network(program, 50)
  return circuit.run(false)
}

function part2(inputString: string) {
  const program = parseInput(inputString)
  const circuit = new Network(program, 50)
  return circuit.run(true)
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
