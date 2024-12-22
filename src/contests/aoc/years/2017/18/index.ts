import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 18

function parseInput(input: string) {
  return utils.input.lines(input)
}

enum ProgramState {
  Waiting,
  Done,
}

function program(id: number, instructions: string[], sound: boolean) {
  const registers = new Map<string, number>()
  registers.set("p", id)

  let i = 0

  return function (inbound: number[] = [], outbound: number[] = []) {
    while (i < instructions.length) {
      const [instruction, x, y] = instructions[i].split(" ")
      function val(v: string) {
        if (v.charAt(0) >= "a" && v.charAt(0) <= "z") {
          return registers.get(v) ?? 0
        }
        return +v
      }
      switch (instruction) {
        case "snd":
          outbound.push(val(x))
          break
        case "set":
          registers.set(x, val(y))
          break
        case "add":
          registers.set(x, val(x) + val(y))
          break
        case "mul":
          registers.set(x, val(x) * val(y))
          break
        case "mod":
          registers.set(x, val(x) % val(y))
          break
        case "rcv":
          if (sound) {
            if (val(x) !== 0) {
              return ProgramState.Waiting
            }
          } else {
            if (inbound.length === 0) {
              return ProgramState.Waiting
            }
            registers.set(x, inbound.shift()!)
          }
          break
        case "jgz":
          if (val(x) > 0) {
            i += val(y)
            continue
          }
          break
      }
      ++i
    }
    return ProgramState.Done
  }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const prog = program(0, input, true)
  const outbound: number[] = []
  prog([], outbound)
  return outbound[outbound.length - 1]
}

function part2(inputString: string) {
  const input = parseInput(inputString)

  const prog0 = program(0, input, false)
  const prog1 = program(1, input, false)

  const input0: number[] = []
  const input1: number[] = []

  let state0 = undefined
  let state1 = undefined
  let totalSentBy1 = 0
  while (true) {
    if (state0 === ProgramState.Done && (state1 === ProgramState.Done || state1 === ProgramState.Waiting)) {
      break
    }
    if (state1 === ProgramState.Done && (state0 === ProgramState.Done || state0 === ProgramState.Waiting)) {
      break
    }
    state0 = prog0(input0, input1)

    const valuesSentBy1: number[] = []
    state1 = prog1(input1, valuesSentBy1)
    totalSentBy1 += valuesSentBy1.length
    input0.push(...valuesSentBy1)

    if (
      state0 === ProgramState.Waiting &&
      state1 === ProgramState.Waiting &&
      input0.length === 0 &&
      input1.length === 0
    ) {
      break
    }
  }
  return totalSentBy1
}

const EXAMPLE = `
set a 1
add a 2
mul a a
mod a 5
snd a
set a 0
rcv a
jgz a -1
set a 1
jgz a -2`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 4,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
