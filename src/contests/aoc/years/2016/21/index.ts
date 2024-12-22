import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 21

interface SwapPositionCommand {
  type: "swap-position"
  a: number
  b: number
}

interface SwapLetterCommand {
  type: "swap-letter"
  a: string
  b: string
}

interface RotateCommand {
  type: "rotate"
  direction: "left" | "right"
  steps: number
}

interface RotatePositionCommand {
  type: "rotate-position"
  letter: string
}

interface ReverseCommand {
  type: "reverse"
  a: number
  b: number
}

interface MoveCommand {
  type: "move"
  a: number
  b: number
}

type Command =
  | SwapPositionCommand
  | SwapLetterCommand
  | RotateCommand
  | RotatePositionCommand
  | ReverseCommand
  | MoveCommand

function parseInput(input: string): Command[] {
  return utils.input.lines(input).map(line => {
    if (line.includes("swap position")) {
      const [, a, b] = line.match(/swap position (\d+) with position (\d+)/)!.map(Number)
      return { type: "swap-position", a, b } as SwapPositionCommand
    }
    if (line.includes("swap letter")) {
      const [, a, b] = line.match(/swap letter (\w) with letter (\w)/)!
      return { type: "swap-letter", a, b } as SwapLetterCommand
    }
    if (line.includes("rotate") && line.includes("step")) {
      const [, direction, steps] = line.match(/rotate (\w+) (\d+) steps?/)!
      return { type: "rotate", direction, steps: Number(steps) } as RotateCommand
    }
    if (line.includes("rotate based")) {
      const [, letter] = line.match(/rotate based on position of letter (\w)/)!
      return { type: "rotate-position", letter } as RotatePositionCommand
    }
    if (line.includes("reverse")) {
      const [, a, b] = line.match(/reverse positions (\d+) through (\d+)/)!.map(Number)
      return { type: "reverse", a, b } as ReverseCommand
    }
    if (line.includes("move")) {
      const [, a, b] = line.match(/move position (\d+) to position (\d+)/)!.map(Number)
      return { type: "move", a, b } as MoveCommand
    }
    throw new Error()
  })
}

function applyCommand(command: Command, password: string): string {
  if (command.type === "swap-position") {
    const chars = password.split("")
    const temp = chars[command.a]
    chars[command.a] = chars[command.b]
    chars[command.b] = temp
    return chars.join("")
  }
  if (command.type === "swap-letter") {
    return password
      .split("")
      .map(char => (char === command.a ? command.b : char === command.b ? command.a : char))
      .join("")
  }
  if (command.type === "rotate") {
    const steps = command.steps % password.length
    if (command.direction === "left") {
      return password.slice(steps) + password.slice(0, steps)
    }
    if (command.direction === "right") {
      return password.slice(-steps) + password.slice(0, -steps)
    }
    throw new Error()
  }
  if (command.type === "rotate-position") {
    const index = password.indexOf(command.letter)
    const steps = (index + (index >= 4 ? 2 : 1)) % password.length
    return password.slice(-steps) + password.slice(0, -steps)
  }
  if (command.type === "reverse") {
    return (
      password.slice(0, command.a) +
      password
        .slice(command.a, command.b + 1)
        .split("")
        .reverse()
        .join("") +
      password.slice(command.b + 1)
    )
  }
  if (command.type === "move") {
    const chars = password.split("")
    const char = chars.splice(command.a, 1)[0]
    chars.splice(command.b, 0, char)
    return chars.join("")
  }
  throw new Error()
}

function applyReverseCommand(command: Command, password: string): string {
  if (command.type === "swap-position" || command.type === "swap-letter") {
    return applyCommand(command, password)
  }
  if (command.type === "rotate") {
    return applyCommand(
      {
        ...command,
        direction: command.direction === "left" ? "right" : "left",
      },
      password
    )
  }
  if (command.type === "rotate-position") {
    for (let i = 0; i < password.length; ++i) {
      const rotated = applyCommand(
        {
          type: "rotate",
          direction: "left",
          steps: i,
        },
        password
      )
      const unrotated = applyCommand(
        {
          type: "rotate-position",
          letter: command.letter,
        },
        rotated
      )
      if (unrotated === password) {
        return rotated
      }
    }
    throw new Error()
  }
  if (command.type === "reverse") {
    return applyCommand(command, password)
  }
  if (command.type === "move") {
    return applyCommand(
      {
        type: "move",
        a: command.b,
        b: command.a,
      },
      password
    )
  }
  throw new Error()
}

function part1(inputString: string) {
  const commands = parseInput(inputString)
  let password = "abcdefgh"
  for (let i = 0; i < commands.length; ++i) {
    password = applyCommand(commands[i], password)
  }
  return password
}

function part2(inputString: string) {
  const commands = parseInput(inputString)
  let hash = "fbgdceah"
  for (let i = commands.length - 1; i >= 0; --i) {
    hash = applyReverseCommand(commands[i], hash)
  }
  return hash
}

const EXAMPLE = `
swap position 4 with position 0
swap letter d with letter b
reverse positions 0 through 4
rotate left 1 step
move position 1 to position 4
move position 3 to position 0
rotate based on position of letter b
rotate based on position of letter d`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: "fbdecgha",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: "efghdabc",
      },
    ],
  },
} as AdventOfCodeContest
