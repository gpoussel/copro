import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2024 - Day 17

function parseInput(input: string) {
  const [registers, program] = utils.input.blocks(input)
  const registerValues = utils.input.lines(registers).reduce(
    (acc, line) => {
      const [name, value] = line.split(": ")
      acc[name.split(" ")[1]] = parseInt(value)
      return acc
    },
    {} as Record<string, number>
  )
  const instructions = program.split(" ")[1].split(",").map(Number)
  return { registerValues, instructions }
}

function computeOutput(input: ReturnType<typeof parseInput>) {
  const registers = input.registerValues
  const output = []
  let i = 0
  while (i < input.instructions.length) {
    const opcode = input.instructions[i]
    const result = evaluate(opcode, input.instructions[i + 1], registers)
    if (result?.action === "jump") {
      i = result.value
    } else {
      if (result?.action === "output") {
        output.push(result.value)
      }
      i += 2
    }
  }
  return output.join(",")
}

function getProgramLines(input: ReturnType<typeof parseInput>) {
  function combo(value: number) {
    if (value <= 3) {
      return value
    }
    if (value === 4) {
      return "A"
    }
    if (value === 5) {
      return "B"
    }
    if (value === 6) {
      return "C"
    }
    throw new Error()
  }
  const lines = []
  for (let i = 0; i < input.instructions.length; i += 2) {
    const opcode = input.instructions[i]
    if (opcode === 0) {
      lines.push(`A = A >> ${combo(input.instructions[i + 1])}`)
    } else if (opcode === 1) {
      lines.push(`B = B ^ ${input.instructions[i + 1]}`)
    } else if (opcode === 2) {
      lines.push(`B = ${combo(input.instructions[i + 1])} & 8`)
    } else if (opcode === 3) {
      lines.push(`jnz ${input.instructions[i + 1]}`)
    } else if (opcode === 4) {
      lines.push("B = B ^ C")
    } else if (opcode === 5) {
      lines.push(`out ${combo(input.instructions[i + 1])}`)
    } else if (opcode === 6) {
      lines.push(`B = A >> ${combo(input.instructions[i + 1])}`)
    } else if (opcode === 7) {
      lines.push(`C = A >> ${combo(input.instructions[i + 1])}`)
    }
  }
  return lines
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const output = []
  while (input.registerValues.A > 0) {
    output.push(computeOutput(input))
    input.registerValues.A >>= 3
  }
  return output.join(",")
}

function bigOr(a: number, b: number) {
  return +(BigInt(a) | BigInt(b)).toString()
}

function evaluate(
  opcode: number,
  operand: number,
  registers: Record<string, number>
): undefined | { action: "jump"; value: number } | { action: "output"; value: number } {
  function combo(value: number) {
    if (value <= 3) {
      return value
    }
    if (value === 4) {
      return registers.A
    }
    if (value === 5) {
      return registers.B
    }
    if (value === 6) {
      return registers.C
    }
    throw new Error()
  }
  if (opcode === 0) {
    // The adv instruction (opcode 0) performs division. The numerator is the value in the A register. The denominator
    // is found by raising 2 to the power of the instruction's combo operand. (So, an operand of 2 would divide A by 4
    // (2^2); an operand of 5 would divide A by 2^B.) The result of the division operation is truncated to an integer
    // and then written to the A register.
    const numerator = registers.A
    const denominator = 2 ** combo(operand)
    const result = Math.trunc(numerator / denominator)
    registers.A = result
  } else if (opcode === 1) {
    // The bxl instruction (opcode 1) calculates the bitwise XOR of register B and the instruction's literal operand,
    // then stores the result in register B.
    registers.B = registers.B ^ operand
  } else if (opcode === 2) {
    // The bst instruction (opcode 2) calculates the value of its combo operand modulo 8 (thereby keeping only its
    // lowest 3 bits), then writes that value to the B register.
    registers.B = combo(operand) % 8
  } else if (opcode === 3) {
    // The jnz instruction (opcode 3) does nothing if the A register is 0. However, if the A register is not zero, it
    // jumps by setting the instruction pointer to the value of its literal operand; if this instruction jumps, the
    // instruction pointer is not increased by 2 after this instruction.
    if (registers.A !== 0) {
      return { action: "jump", value: operand }
    }
  } else if (opcode === 4) {
    // The bxc instruction (opcode 4) calculates the bitwise XOR of register B and register C, then stores the result
    // in register B. (For legacy reasons, this instruction reads an operand but ignores it.)
    registers.B = registers.B ^ registers.C
  } else if (opcode === 5) {
    // The out instruction (opcode 5) calculates the value of its combo operand modulo 8, then outputs that value. (If
    // a program outputs multiple values, they are separated by commas.)
    const value = combo(operand) & 7
    return { action: "output", value }
  } else if (opcode === 6) {
    // The bdv instruction (opcode 6) works exactly like the adv instruction except that the result is stored in the B
    // register. (The numerator is still read from the A register.)
    const numerator = registers.A
    const denominator = 2 ** combo(operand)
    const result = Math.trunc(numerator / denominator)
    registers.B = result
  } else if (opcode === 7) {
    // The cdv instruction (opcode 7) works exactly like the adv instruction except that the result is stored in the C
    // register. (The numerator is still read from the A register.)
    const numerator = registers.A
    const denominator = 2 ** combo(operand)
    const result = Math.trunc(numerator / denominator)
    registers.C = result
  }
}

function solve(g: number[], position: number, remainder: number): { solved: boolean; result: number | undefined } {
  if (position < 0) {
    return { solved: true, result: remainder }
  }
  for (let digit = 0; digit < 8; ++digit) {
    const next = bigOr(remainder * 8, digit)
    const registers = {
      A: next,
      B: 0,
      C: 0,
    }
    let i = 0
    let output = undefined
    while (i < g.length) {
      const operation = g[i]
      const operand = g[i + 1]
      const result = evaluate(operation, operand, registers)
      if (result?.action === "jump") {
        i = result.value
      } else {
        if (result?.action === "output") {
          output = result.value
          break
        }
        i += 2
      }
    }
    if (output === g[position]) {
      const subProblem = solve(g, position - 1, next)
      if (subProblem.solved) {
        return subProblem
      }
    }
  }
  return { solved: false, result: undefined }
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  console.log("Program: ")
  console.log(getProgramLines(input).join("\n"))
  console.log()

  const g = input.instructions.map(Number)
  // Working backwards from the last instruction, we can determine the value of the A register that would cause the
  // program to output the desired value.
  const result = solve(g, g.length - 1, 0)
  input.registerValues.A = result.result!

  const output = []
  while (input.registerValues.A > 0) {
    output.push(computeOutput(input))
    input.registerValues.A >>= 3
  }
  return result.result
}

const EXAMPLE = `
Register A: 729
Register B: 0
Register C: 0

Program: 0,1,5,4,3,0
`

const EXAMPLE2 = `
Register A: 2024
Register B: 0
Register C: 0

Program: 0,3,5,4,3,0
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: "4,6,3,5,6,3,5,2,1,0",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE2,
        expected: 117440,
      },
    ],
  },
} as AdventOfCodeContest
