import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2019 - Day 9

const ADD = "01" // Add
const MUL = "02" // Multiply
const INP = "03" // Input
const OUT = "04" // Output
const JIT = "05" // Jump-if-true
const JIF = "06" // Jump-if-false
const LTH = "07" // Less Than
const EQU = "08" // Equals
const ARB = "09" // Adjust Relative Base
const STP = "99" // Stop

const POSITION_MODE = "0"
const RELATIVE_MODE = "2"

export class Computer {
  tape: number[]
  pointer: number = 0
  relativeBase: number = 0
  inputs: number[]
  outputs: number[]
  OPS: Record<string, any>
  halted: boolean = false

  constructor(tape: number[], inputs: number | number[]) {
    this.tape = tape.slice(0)
    this.inputs = Array.isArray(inputs) ? inputs.slice(0) : [inputs]
    this.outputs = []

    this.OPS = {
      [ADD]: {
        name: ADD,
        params: 3,
        fn: (a: number, b: number, c: number) => (this.tape[c] = a + b),
        write: true,
      },

      [MUL]: {
        name: MUL,
        params: 3,
        fn: (a: number, b: number, c: number) => (this.tape[c] = a * b),
        write: true,
      },

      [INP]: {
        name: INP,
        params: 1,
        fn: (a: number) => (this.tape[a] = this.inputs.shift()!),
        write: true,
      },

      [OUT]: {
        name: OUT,
        params: 1,
        fn: (a: number) => this.output(a),
      },

      [STP]: {
        name: STP,
        params: 0,
        fn: () => (this.halted = true),
      },

      [JIT]: {
        name: JIT,
        params: 2,
        fn: (a: number, b: number) => {
          if (a) {
            this.pointer = b
            return true
          }
          return false
        },
        jumps: true,
      },

      [JIF]: {
        name: JIF,
        params: 2,
        fn: (a: number, b: number) => {
          if (!a) {
            this.pointer = b
            return true
          }
          return false
        },
        jumps: true,
      },

      [LTH]: {
        name: LTH,
        params: 3,
        fn: (a: number, b: number, c: number) => (this.tape[c] = a < b ? 1 : 0),
        write: true,
      },

      [EQU]: {
        name: EQU,
        params: 3,
        fn: (a: number, b: number, c: number) => (this.tape[c] = a === b ? 1 : 0),
        write: true,
      },

      [ARB]: {
        name: ARB,
        params: 1,
        fn: (a: number) => (this.relativeBase += a),
      },
    }

    this.halted = false
  }

  run() {
    let op = this.parseOp()
    while (!this.halted) {
      this.runOp(op)
      if (op.name === OUT || this.halted) {
        break
      }
      op = this.parseOp()
    }
    return this.outputs
  }

  runUntilInputEmpty() {
    let op = this.parseOp()
    while (!this.halted) {
      if (op.name === INP && this.inputs.length === 0) {
        break
      }
      this.runOp(op)
      if (this.halted) {
        break
      }
      op = this.parseOp()
    }
    return this.outputs
  }

  runUntilHalt() {
    while (!this.halted) {
      this.run()
    }
  }

  parseOp() {
    const tempOp = String(this.getTapeValue(this.pointer)).padStart(2, "0")
    const op = this.OPS[tempOp.slice(-2)]
    const fullOperationCode = tempOp.padStart(op.params + 2, "0")

    const modes = []

    for (let i = op.params - 1; i >= 0; i--) {
      modes.push(fullOperationCode[i])
    }

    return {
      ...op,
      modes,
    }
  }

  getTapeValue(idx: number) {
    if (idx < 0) {
      throw new Error("Invalid tape index")
    }
    return this.tape[idx] ?? 0
  }

  runOp({ modes, fn, jumps, write }: { modes: string[]; fn: Function; jumps: boolean; write: boolean }) {
    this.pointer++
    let values = []
    for (let i = 0; i < modes.length; i++) {
      let mode = modes[i]
      let value = this.getTapeValue(this.pointer + i)

      const canSwitchToPosition = !write || i < modes.length - 1
      if (canSwitchToPosition) {
        if (mode === POSITION_MODE) {
          value = this.getTapeValue(value)
        } else if (mode === RELATIVE_MODE) {
          value = this.getTapeValue(value + this.relativeBase)
        }
      } else {
        if (mode === RELATIVE_MODE) {
          value += this.relativeBase
        }
      }
      values.push(value)
    }

    let result = fn(...values)

    if (!jumps || (jumps && !result)) {
      this.pointer += modes.length
    }
  }

  output(v: number) {
    this.outputs.push(v)
  }

  clone(): Computer {
    const clone = new Computer(this.tape.slice(), this.inputs.slice())
    clone.pointer = this.pointer
    clone.relativeBase = this.relativeBase
    clone.outputs = this.outputs.slice(0)
    return clone
  }
}

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function part1(inputString: string) {
  const program = parseInput(inputString)
  const computer = new Computer(program, 1)
  while (!computer.halted) {
    computer.run()
  }
  return computer.outputs.join(",")
}

function part2(inputString: string) {
  const program = parseInput(inputString)
  const computer = new Computer(program, 2)
  while (!computer.halted) {
    computer.run()
  }
  return computer.outputs.join(",")
}

const QUINE = "109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99"

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: QUINE,
        expected: QUINE,
      },
      {
        input: "104,1125899906842624,99",
        expected: "1125899906842624",
      },
      {
        input: "1102,34915192,34915192,7,4,7,99,0",
        expected: "1219070632396864",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
