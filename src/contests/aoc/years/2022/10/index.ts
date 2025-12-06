import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2022 - Day 10

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [instr, arg] = line.split(" ")
    return { instr, arg: arg ? +arg : undefined }
  })
}

function part1(inputString: string) {
  const instructions = parseInput(inputString)
  let cycle = 0
  let x = 1
  let signalStrengthSum = 0
  function advanceCycle() {
    cycle++
    if (cycle === 20 || (cycle - 20) % 40 === 0) {
      signalStrengthSum += cycle * x
    }
  }
  for (const instruction of instructions) {
    if (instruction.instr === "noop") {
      advanceCycle()
    } else if (instruction.instr === "addx") {
      advanceCycle()
      advanceCycle()
      x += instruction.arg!
    }
    if (cycle >= 220) {
      break
    }
  }
  return signalStrengthSum
}

function part2(inputString: string) {
  const instructions = parseInput(inputString)
  let cycle = 0
  let x = 1
  const display = utils.grid.create<string>(40, 6, ".")
  function drawPixel() {
    const drawPosition = new Vector2(cycle % 40, Math.floor(cycle / 40))
    if (Math.abs(drawPosition.x - x) <= 1) {
      utils.grid.set(display, drawPosition, "#")
    }
  }
  for (const instruction of instructions) {
    if (instruction.instr === "noop") {
      drawPixel()
      cycle++
    } else if (instruction.instr === "addx") {
      drawPixel()
      cycle++
      drawPixel()
      cycle++
      x += instruction.arg!
    }
  }
  const letters = Array.from({ length: display[0].length / 5 }, (_, letterIndex) =>
    Array.from({ length: 6 }, (_, row) => display[row].slice(letterIndex * 5, (letterIndex + 1) * 5).join(""))
  )
  return utils.ocr.recognizeWord(letters)
}

const EXAMPLE = `
addx 15
addx -11
addx 6
addx -3
addx 5
addx -1
addx -8
addx 13
addx 4
noop
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx -35
addx 1
addx 24
addx -19
addx 1
addx 16
addx -11
noop
noop
addx 21
addx -15
noop
noop
addx -3
addx 9
addx 1
addx -3
addx 8
addx 1
addx 5
noop
noop
noop
noop
noop
addx -36
noop
addx 1
addx 7
noop
noop
noop
addx 2
addx 6
noop
noop
noop
noop
noop
addx 1
noop
noop
addx 7
addx 1
noop
addx -13
addx 13
addx 7
noop
addx 1
addx -33
noop
noop
noop
addx 2
noop
noop
noop
addx 8
noop
addx -1
addx 2
addx 1
noop
addx 17
addx -9
addx 1
addx 1
addx -3
addx 11
noop
noop
addx 1
noop
addx 1
noop
noop
addx -13
addx -19
addx 1
addx 3
addx 26
addx -30
addx 12
addx -1
addx 3
addx 1
noop
noop
noop
addx -9
addx 18
addx 1
addx 2
noop
noop
addx 9
noop
noop
noop
addx -1
addx 2
addx -37
addx 1
addx 3
noop
addx 15
addx -21
addx 22
addx -6
addx 1
noop
addx 2
addx 1
noop
addx -10
noop
noop
addx 20
addx 1
addx 2
addx 2
addx -6
addx -11
noop
noop
noop`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 13140,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
