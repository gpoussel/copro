import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"
import { Computer } from "../09/index.js"

// 🎄 Advent of Code 2019 - Day 13

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function readOutput(outputs: number[], index: number) {
  const x = outputs[index]
  const y = outputs[index + 1]
  const position = new Vector2(x, y)
  const tile = outputs[index + 2]
  return {
    position,
    tile,
  }
}

function readOutputs(outputs: number[]) {
  return Array.from({ length: outputs.length / 3 }, (_, i) => readOutput(outputs, i * 3))
}

function part1(inputString: string) {
  const program = parseInput(inputString)
  const computer = new Computer(program, [])
  while (!computer.halted) {
    computer.run()
  }
  return readOutputs(computer.outputs).filter(({ tile }) => tile === 2).length
}

function part2(inputString: string) {
  const program = parseInput(inputString)
  program[0] = 2
  const computer = new Computer(program, [])
  let ballPosition = undefined
  let paddlePosition = undefined
  let score = undefined
  while (!computer.halted) {
    while (computer.outputs.length < 3 && !computer.halted) {
      computer.run()
    }
    if (computer.halted) {
      continue
    }
    const output = readOutput(computer.outputs, 0)
    computer.outputs.length = 0
    if (output.tile === 4) {
      // Ball moved: we need to move the paddle
      ballPosition = output.position
      if (ballPosition && paddlePosition) {
        computer.inputs.push(Math.sign(ballPosition.x - paddlePosition.x))
      }
    } else if (output.tile === 3) {
      // Paddle moved
      paddlePosition = output.position
    } else if (output.position.x === -1 && output.position.y === 0) {
      score = output.tile
    }
  }
  return score
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
