import exp from "constants"
import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { swap } from "../../../../../utils/grid.js"

// 🎄 Advent of Code 2024 - Day 24

interface WiringInstruction {
  op: string
  args: [string, string]
}

function parseInput(input: string) {
  const [initialValuesBlock, wiring] = utils.input.blocks(input)
  const initialValues = new Map<string, number>()
  for (const line of utils.input.lines(initialValuesBlock)) {
    const [key, value] = line.split(": ")
    initialValues.set(key, +value)
  }
  const wires = new Map<string, WiringInstruction>()
  for (const line of utils.input.lines(wiring)) {
    const [inputs, output] = line.split(" -> ")
    const args = inputs.split(" ")
    wires.set(output, {
      op: args[1],
      args: [args[0], args[2]].sort() as [string, string],
    })
  }
  return { initialValues, wires }
}

function toInteger(values: Map<string, number>, keyPrefix: string) {
  const zKeys = [...values.keys()].filter(k => k.startsWith(keyPrefix)).sort()
  return zKeys.map((k, i) => values.get(k)! * Math.pow(2, i)).reduce((a, b) => a + b)
}

function execute(wires: Map<string, WiringInstruction>, values: Map<string, number>) {
  const remainingWires = [...wires.keys()]
  while (remainingWires.length > 0) {
    const wireIndex = remainingWires.findIndex(w => {
      const instruction = wires.get(w)!
      const [a, b] = instruction.args
      return values.has(a) && values.has(b)
    })
    if (wireIndex < 0) {
      throw new Error()
    }
    const wire = remainingWires.splice(wireIndex, 1)[0]
    const instruction = wires.get(wire)!
    const [a, b] = instruction.args
    const valueA = values.get(a)!
    const valueB = values.get(b)!
    if (instruction.op === "AND") {
      values.set(wire, valueA & valueB)
    } else if (instruction.op === "OR") {
      values.set(wire, valueA | valueB)
    } else if (instruction.op === "XOR") {
      values.set(wire, valueA ^ valueB)
    }
  }
  return toInteger(values, "z")
}

function getExpression(wire: string, wires: Map<string, WiringInstruction>): string {
  if (!wires.has(wire)) {
    return wire
  }
  const instruction = wires.get(wire)!
  const [a, b] = instruction.args
  if (a.slice(1) === b.slice(1) && a[0] === "x" && b[0] === "y") {
    if (instruction.op === "AND" && a === "x00" && b === "y00") {
      // x00 AND y00 -> CAR00
      return `CAR00`
    }
    if (instruction.op === "XOR") {
      // xn XOR yn -> XORn
      return `XOR${a.slice(1)}`
    }
    if (instruction.op === "AND") {
      // xn AND yn -> ANDn
      return `AND${a.slice(1)}`
    }
  }
  const [exprA, exprB] = [a, b].map(w => getExpression(w, wires)).sort()
  if (instruction.op === "AND" || instruction.op === "XOR") {
    if (exprA.startsWith("CAR") && exprB.startsWith("XOR")) {
      const digitA = +exprA.slice(3)
      const digitB = +exprB.slice(3)
      if (digitA + 1 === digitB) {
        if (instruction.op === "AND") {
          // CARn AND XORn+1 -> PARn
          return `PAR${exprB.slice(3)}`
        }
        // CARn XOR XORn+1 -> DIGn+1
        return `DIG${exprB.slice(3)}`
      }
    }
  }
  // ANDn OR PARn -> CARn
  if (instruction.op === "OR") {
    if (exprA.startsWith("AND") && exprB.startsWith("PAR")) {
      const digitA = +exprA.slice(3, 5)
      const digitB = +exprB.slice(3, 5)
      if (digitA === digitB) {
        return `CAR${exprB.slice(3)}`
      }
    }
  }
  // CARn XOR XORn+1 -> PARn+1
  if (instruction.op === "XOR") {
    if (exprA.startsWith("CAR") && exprB.startsWith("XOR")) {
      const digitA = +exprA.slice(3, 5)
      const digitB = +exprB.slice(3, 5)
      if (digitA + 1 === digitB) {
        return `PAR${exprB.slice(3)}`
      }
    }
  }
  return "???"
}

function part1(inputString: string) {
  const { initialValues, wires } = parseInput(inputString)
  return execute(wires, initialValues)
}

function part2(inputString: string) {
  const { initialValues, wires } = parseInput(inputString)

  const swaps = new Map<string, string>()

  let changed = true
  while (changed) {
    changed = false
    const localWires = new Map(wires)
    for (const [wire1, wire2] of swaps) {
      const tmp = localWires.get(wire1)!
      localWires.set(wire1, localWires.get(wire2)!)
      localWires.set(wire2, tmp)
    }

    const expressionsByWire = new Map<string, string>()
    const wiresByExpression = new Map<string, string>()
    for (const [output, instruction] of wires) {
      const expr = getExpression(output, localWires)
      expressionsByWire.set(output, expr)
      wiresByExpression.set(expr, output)
    }

    if (wiresByExpression.get("XOR00") !== "z00") {
      throw new Error("Unsupported case (DIG00)")
    }
    for (let i = 1; i < initialValues.size / 2; ++i) {
      const prevDigit = (i - 1).toString().padStart(2, "0")
      const digit = i.toString().padStart(2, "0")
      const wireOfDigit = wiresByExpression.get(`DIG${digit}`)
      const zDigitWrong = wireOfDigit !== `z${digit}`
      if (zDigitWrong) {
        if (wireOfDigit) {
          swaps.set(`z${digit}`, wireOfDigit)
          changed = true
        } else {
          const carWire = wiresByExpression.get(`CAR${prevDigit}`)!
          const xorWire = wiresByExpression.get(`XOR${digit}`)!
          const wiringInstruction = localWires.get(`z${digit}`)!
          const carWrong = !wiringInstruction.args.includes(carWire)
          const xorWrong = !wiringInstruction.args.includes(xorWire)
          if (xorWrong && !carWrong) {
            const otherWire = wiringInstruction.args.find(w => w !== carWire)!
            swaps.set(xorWire, otherWire)
            changed = true
          } else {
            throw new Error(
              `Unsupported case on digit ${digit}: CAR${prevDigit} ${carWrong ? "" : `not `}found, XOR${digit} ${xorWrong ? "" : `not `}found`
            )
          }
        }
        break
      }
    }
  }
  return [...swaps.keys(), ...swaps.values()].sort().join(",")
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
x00: 1
x01: 1
x02: 1
y00: 0
y01: 1
y02: 0

x00 AND y00 -> z00
x01 XOR y01 -> z01
x02 OR y02 -> z02`,
        expected: 4,
      },
      {
        input: `
x00: 1
x01: 0
x02: 1
x03: 1
x04: 0
y00: 1
y01: 1
y02: 1
y03: 1
y04: 1

ntg XOR fgs -> mjb
y02 OR x01 -> tnw
kwq OR kpj -> z05
x00 OR x03 -> fst
tgd XOR rvg -> z01
vdt OR tnw -> bfw
bfw AND frj -> z10
ffh OR nrd -> bqk
y00 AND y03 -> djm
y03 OR y00 -> psh
bqk OR frj -> z08
tnw OR fst -> frj
gnj AND tgd -> z11
bfw XOR mjb -> z00
x03 OR x00 -> vdt
gnj AND wpb -> z02
x04 AND y00 -> kjc
djm OR pbm -> qhw
nrd AND vdt -> hwm
kjc AND fst -> rvg
y04 OR y02 -> fgs
y01 AND x02 -> pbm
ntg OR kjc -> kwq
psh XOR fgs -> tgd
qhw XOR tgd -> z09
pbm OR djm -> kpj
x03 XOR y03 -> ffh
x00 XOR y04 -> ntg
bfw OR bqk -> z06
nrd XOR fgs -> wpb
frj XOR qhw -> z04
bqk OR frj -> z07
y03 OR x01 -> nrd
hwm AND bqk -> z03
tgd XOR rvg -> z12
tnw OR pbm -> gnj`,
        expected: 2024,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
