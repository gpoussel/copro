import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 20

interface Module {
  type: "%" | "&" | "broadcaster"
  name: string
  outputs: string[]
  state?: boolean
  memory?: Map<string, boolean>
}

function parseInput(input: string) {
  const modules = new Map<string, Module>()

  for (const line of utils.input.lines(input)) {
    const [left, right] = line.split(" -> ")
    const outputs = right.split(", ")

    if (left === "broadcaster") {
      modules.set("broadcaster", { type: "broadcaster", name: "broadcaster", outputs })
    } else {
      const type = left[0] as "%" | "&"
      const name = left.slice(1)
      if (type === "%") {
        modules.set(name, { type, name, outputs, state: false })
      } else {
        modules.set(name, { type, name, outputs, memory: new Map() })
      }
    }
  }

  // Initialize conjunction memory
  for (const [name, mod] of modules) {
    for (const out of mod.outputs) {
      const target = modules.get(out)
      if (target?.type === "&") {
        target.memory!.set(name, false)
      }
    }
  }

  return modules
}

function part1(inputString: string) {
  const modules = parseInput(inputString)
  let lowCount = 0
  let highCount = 0

  for (let i = 0; i < 1000; i++) {
    const queue: [string, string, boolean][] = [["button", "broadcaster", false]]

    while (queue.length) {
      const [from, to, pulse] = queue.shift()!
      if (pulse) highCount++
      else lowCount++

      const mod = modules.get(to)
      if (!mod) continue

      if (mod.type === "broadcaster") {
        for (const out of mod.outputs) {
          queue.push([to, out, pulse])
        }
      } else if (mod.type === "%") {
        if (!pulse) {
          mod.state = !mod.state
          for (const out of mod.outputs) {
            queue.push([to, out, mod.state])
          }
        }
      } else if (mod.type === "&") {
        mod.memory!.set(from, pulse)
        const allHigh = [...mod.memory!.values()].every(v => v)
        for (const out of mod.outputs) {
          queue.push([to, out, !allHigh])
        }
      }
    }
  }

  return lowCount * highCount
}

function part2(inputString: string) {
  const modules = parseInput(inputString)

  // Find the module that feeds into rx
  let rxFeeder = ""
  for (const [name, mod] of modules) {
    if (mod.outputs.includes("rx")) {
      rxFeeder = name
      break
    }
  }

  // rx feeder should be a conjunction - find its inputs
  const rxFeederInputs = new Set<string>()
  for (const [name, mod] of modules) {
    if (mod.outputs.includes(rxFeeder)) {
      rxFeederInputs.add(name)
    }
  }

  // Find cycle length for each input to fire high
  const cycleLengths = new Map<string, number>()

  for (let i = 1; cycleLengths.size < rxFeederInputs.size; i++) {
    const queue: [string, string, boolean][] = [["button", "broadcaster", false]]

    while (queue.length) {
      const [from, to, pulse] = queue.shift()!

      if (to === rxFeeder && pulse && rxFeederInputs.has(from) && !cycleLengths.has(from)) {
        cycleLengths.set(from, i)
      }

      const mod = modules.get(to)
      if (!mod) continue

      if (mod.type === "broadcaster") {
        for (const out of mod.outputs) {
          queue.push([to, out, pulse])
        }
      } else if (mod.type === "%") {
        if (!pulse) {
          mod.state = !mod.state
          for (const out of mod.outputs) {
            queue.push([to, out, mod.state])
          }
        }
      } else if (mod.type === "&") {
        mod.memory!.set(from, pulse)
        const allHigh = [...mod.memory!.values()].every(v => v)
        for (const out of mod.outputs) {
          queue.push([to, out, !allHigh])
        }
      }
    }
  }

  return utils.math.lcm(...cycleLengths.values())
}

const EXAMPLE1 = `
broadcaster -> a, b, c
%a -> b
%b -> c
%c -> inv
&inv -> a`

const EXAMPLE2 = `
broadcaster -> a
%a -> inv, con
&inv -> b
%b -> con
&con -> output`

export default {
  part1: {
    run: part1,
    tests: [
      { input: EXAMPLE1, expected: 32000000 },
      { input: EXAMPLE2, expected: 11687500 },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
