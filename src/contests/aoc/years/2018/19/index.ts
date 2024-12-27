import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { sumOfDivisors } from "../../../../../utils/math.js"
import { OPERATIONS, OperationName } from "../16/index.js"

// 🎄 Advent of Code 2018 - Day 19

interface Instruction {
  op: OperationName
  a: number
  b: number
  c: number
}

function parseInput(input: string) {
  const lines = utils.input.lines(input)
  const ip = +lines.shift()!.split(" ")[1]
  const instructions = lines.map(line => {
    const [op, a, b, c] = line.split(" ")
    return { op: op as OperationName, a: +a, b: +b, c: +c }
  })
  return { ip, instructions }
}

function execute(_ip: number, _instructions: Instruction[], firstRegisterInitialValue: number) {
  const number = 998 + firstRegisterInitialValue * 10550400
  return sumOfDivisors(number)
}

function reverseEngineer(ip: number, instructions: Instruction[]) {
  const registers = [1, 0, 0, 0, 0, 0]
  function r(n: number) {
    if (n === ip) {
      return "ip"
    }
    return `R${n}`
  }
  for (let i = 0; i < instructions.length; i++) {
    const { op, a, b, c } = instructions[i]
    const lineNumber = `[${i.toString().padStart(2, "0")}]`
    if (op === "addr") {
      if (a === c) {
        console.log(`${lineNumber} ${r(c)} += ${r(b)}`)
      } else if (b === c) {
        console.log(`${lineNumber} ${r(c)} += ${r(a)}`)
      } else {
        console.log(`${lineNumber} ${r(c)} = ${r(a)} + ${r(b)}`)
      }
    }
    if (op === "addi") {
      if (a === c) {
        console.log(`${lineNumber} ${r(c)} += ${b}`)
      } else {
        console.log(`${lineNumber} ${r(c)} = ${r(a)} + ${b}`)
      }
    }
    if (op === "mulr") {
      if (a === c) {
        console.log(`${lineNumber} ${r(c)} *= ${r(b)}`)
      } else if (b === c) {
        console.log(`${lineNumber} ${r(c)} *= ${r(a)}`)
      } else {
        console.log(`${lineNumber} ${r(c)} = ${r(a)} * ${r(b)}`)
      }
    }
    if (op === "muli") {
      if (a === c) {
        console.log(`${lineNumber} ${r(c)} *= ${b}`)
      } else {
        console.log(`${lineNumber} ${r(c)} = ${r(a)} * ${b}`)
      }
    }
    if (op === "banr") {
      console.log(`${lineNumber} ${r(c)} = ${r(a)} & ${r(b)}`)
    }
    if (op === "bani") {
      console.log(`${lineNumber} ${r(c)} = ${r(a)} & ${b}`)
    }
    if (op === "borr") {
      console.log(`${lineNumber} ${r(c)} = ${r(a)} | ${r(b)}`)
    }
    if (op === "bori") {
      console.log(`${lineNumber} ${r(c)} = ${r(a)} | ${b}`)
    }
    if (op === "setr") {
      console.log(`${lineNumber} ${r(c)} = ${r(a)}`)
    }
    if (op === "seti") {
      console.log(`${lineNumber} ${r(c)} = ${a}`)
    }
    if (op === "gtir") {
      console.log(`${lineNumber} ${r(c)} = ${a} > ${r(b)} ? 1 : 0`)
    }
    if (op === "gtri") {
      console.log(`${lineNumber} ${r(c)} = ${r(a)} > ${b} ? 1 : 0`)
    }
    if (op === "gtrr") {
      console.log(`${lineNumber} ${r(c)} = ${r(a)} > ${r(b)} ? 1 : 0`)
    }
    if (op === "eqir") {
      console.log(`${lineNumber} ${r(c)} = ${a} === ${r(b)} ? 1 : 0`)
    }
    if (op === "eqri") {
      console.log(`${lineNumber} ${r(c)} = ${r(a)} === ${b} ? 1 : 0`)
    }
    if (op === "eqrr") {
      console.log(`${lineNumber} ${r(c)} = ${r(a)} === ${r(b)} ? 1 : 0`)
    }
    OPERATIONS[op](registers, a, b, c)
  }
}

function part1(inputString: string) {
  const { ip, instructions } = parseInput(inputString)
  return execute(ip, instructions, 0)
}

function part2(inputString: string) {
  const { ip, instructions } = parseInput(inputString)
  reverseEngineer(ip, instructions)
  return execute(ip, instructions, 1)
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
