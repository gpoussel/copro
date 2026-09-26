// 🎮 CodinGame Puzzle - mcxxxx-microcontroller-simulation
// https://www.codingame.com/training/medium/mcxxxx-microcontroller-simulation

interface Instruction {
  prefix: string // "", "+", "-" or "@"
  op: string
  args: string[]
}

readline()
const inputData = readline().trim().split(/\s+/).map(Number)
const lineCount = parseInt(readline())
const program: Instruction[] = []
const labels = new Map<string, number>()
for (let i = 0; i < lineCount; i++) {
  let line = readline().trim()
  if (line.charAt(0) === "#") continue
  const labelMatch = /^(\w+):\s*(.*)$/.exec(line)
  if (labelMatch) {
    labels.set(labelMatch[1], program.length)
    line = labelMatch[2].trim()
  }
  if (line === "" || line.charAt(0) === "#") continue
  let prefix = ""
  if ("+-@".indexOf(line.charAt(0)) >= 0) {
    prefix = line.charAt(0)
    line = line.substr(1).trim()
  }
  const [op, ...args] = line.split(/\s+/)
  program.push({ prefix, op, args })
}

const clamp = (v: number): number => Math.max(-999, Math.min(999, v))
const registers: { [name: string]: number } = { acc: 0, dat: 0 }
const output: number[] = []
let inputPos = 0
let halted = false

function read(operand: string): number {
  if (operand === "x0") {
    if (inputPos >= inputData.length) {
      halted = true
      return 0
    }
    return inputData[inputPos++]
  }
  if (operand in registers) return registers[operand]
  return parseInt(operand)
}

function write(target: string, value: number): void {
  if (target === "x1") output.push(value)
  else registers[target] = clamp(value)
}

function digitOf(value: number, position: number): number {
  return Math.floor(Math.abs(value) / Math.pow(10, position)) % 10
}

let plusEnabled = false
let minusEnabled = false
const doneOnce = new Set<number>()
let pc = 0
let steps = 0
while (pc < program.length && !halted && steps++ < 1000000) {
  const { prefix, op, args } = program[pc]
  const current = pc++
  if (prefix === "+" && !plusEnabled) continue
  if (prefix === "-" && !minusEnabled) continue
  if (prefix === "@") {
    if (doneOnce.has(current)) continue
    doneOnce.add(current)
  }
  const acc = registers.acc
  switch (op) {
    case "mov": {
      const value = read(args[0])
      if (!halted) write(args[1], value)
      break
    }
    case "jmp":
      pc = labels.get(args[0])!
      break
    case "add":
      registers.acc = clamp(acc + read(args[0]))
      break
    case "sub":
      registers.acc = clamp(acc - read(args[0]))
      break
    case "mul":
      registers.acc = clamp(acc * read(args[0]))
      break
    case "not":
      registers.acc = acc === 0 ? 100 : 0
      break
    case "dgt":
      registers.acc = (acc < 0 ? -1 : 1) * digitOf(acc, read(args[0]))
      break
    case "dst": {
      const position = read(args[0])
      const digit = read(args[1])
      const magnitude = Math.abs(acc) + (digit - digitOf(acc, position)) * Math.pow(10, position)
      registers.acc = clamp((acc < 0 ? -1 : 1) * magnitude)
      break
    }
    case "teq":
    case "tgt":
    case "tlt":
    case "tcp": {
      const a = read(args[0])
      const b = read(args[1])
      if (op === "tcp") {
        plusEnabled = a > b
        minusEnabled = a < b
      } else {
        const result = op === "teq" ? a === b : op === "tgt" ? a > b : a < b
        plusEnabled = result
        minusEnabled = !result
      }
      break
    }
  }
}
console.log(output.join(" "))
