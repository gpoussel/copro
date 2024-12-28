import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2019 - Day 5

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function runProgram(tape: number[], input: number) {
  let pointer = 0
  const output: number[] = []

  function btoi(b: boolean) {
    return b ? 1 : 0
  }

  function processOpcode() {
    const opcode = tape[pointer]
    const arg1 = tape[pointer + 1]
    const arg2 = tape[pointer + 2]
    const arg3 = tape[pointer + 3]

    switch (opcode) {
      case 1:
        tape[arg3] = tape[arg1] + tape[arg2]
        pointer += 4
        break
      case 101:
        tape[arg3] = arg1 + tape[arg2]
        pointer += 4
        break
      case 1001:
        tape[arg3] = tape[arg1] + arg2
        pointer += 4
        break
      case 1101:
        tape[arg3] = arg1 + arg2
        pointer += 4
        break

      case 2:
        tape[arg3] = tape[arg1] * tape[arg2]
        pointer += 4
        break
      case 102:
        tape[arg3] = arg1 * tape[arg2]
        pointer += 4
        break
      case 1002:
        tape[arg3] = tape[arg1] * arg2
        pointer += 4
        break
      case 1102:
        tape[arg3] = arg1 * arg2
        pointer += 4
        break

      case 3:
        tape[arg1] = input
        pointer += 2
        break

      case 4:
        output.push(tape[arg1])
        pointer += 2
        break
      case 104:
        output.push(arg1)
        pointer += 2
        break

      case 105:
        if (arg1 != 0) {
          pointer = tape[arg2]
          break
        }
        pointer += 3
        break
      case 1005:
        if (tape[arg1] != 0) {
          pointer = arg2
          break
        }
        pointer += 3
        break
      case 1105:
        if (arg1 != 0) {
          pointer = arg2
          break
        }
        pointer += 3
        break

      case 106:
        if (arg1 == 0) {
          pointer = tape[arg2]
          break
        }
        pointer += 3
        break
      case 1006:
        if (tape[arg1] == 0) {
          pointer = arg2
          break
        }
        pointer += 3
        break
      case 1106:
        if (arg1 == 0) {
          pointer = arg2
          break
        }
        pointer += 3
        break

      case 7:
        tape[arg3] = btoi(tape[arg1] < tape[arg2])
        pointer += 4
        break
      case 107:
        tape[arg3] = btoi(arg1 < tape[arg2])
        pointer += 4
        break
      case 1007:
        tape[arg3] = btoi(tape[arg1] < arg2)
        pointer += 4
        break
      case 1107:
        tape[arg3] = btoi(arg1 < arg2)
        pointer += 4
        break

      case 8:
        tape[arg3] = btoi(tape[arg1] == tape[arg2])
        pointer += 4
        break
      case 108:
        tape[arg3] = btoi(arg1 == tape[arg2])
        pointer += 4
        break
      case 1008:
        tape[arg3] = btoi(tape[arg1] == arg2)
        pointer += 4
        break
      case 1108:
        tape[arg3] = btoi(arg1 == arg2)
        pointer += 4
        break

      default:
        throw new Error(`Invalid opcode ${opcode}`)
    }
  }

  while (tape[pointer] != 99) {
    processOpcode()
  }
  return output
}

function part1(inputString: string) {
  const program = parseInput(inputString)
  const output = runProgram(program, 1)
  return output[output.length - 1]
}

function part2(inputString: string) {
  const program = parseInput(inputString)
  const output = runProgram(program, 5)
  return output[output.length - 1]
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
