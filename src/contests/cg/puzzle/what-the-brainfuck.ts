// 🎮 CodinGame Puzzle - what-the-brainfuck
// https://www.codingame.com/training/medium/what-the-brainfuck

const first = readline().split(" ")
const L = parseInt(first[0], 10)
const S = parseInt(first[1], 10)
const N = parseInt(first[2], 10)

let program = ""
for (let i = 0; i < L; i++) program += readline()

const inputs: number[] = []
for (let i = 0; i < N; i++) inputs.push(parseInt(readline(), 10))

// Keep only active instructions (comments/whitespace are ignored).
const instr = "><+-.,[]"
const code: string[] = []
for (const ch of program) if (instr.includes(ch)) code.push(ch)

// Match brackets up front; mismatch => SYNTAX ERROR (raised before execution).
const match: Record<number, number> = {}
const stack: number[] = []
let syntaxError = false
for (let i = 0; i < code.length; i++) {
  if (code[i] === "[") stack.push(i)
  else if (code[i] === "]") {
    if (stack.length === 0) {
      syntaxError = true
      break
    }
    const open = stack.pop() as number
    match[open] = i
    match[i] = open
  }
}
if (stack.length > 0) syntaxError = true

const out: string[] = []

function run(): string | null {
  const tape = new Array<number>(S).fill(0)
  let ptr = 0
  let pc = 0
  let inIdx = 0
  while (pc < code.length) {
    const c = code[pc]
    switch (c) {
      case ">":
        ptr++
        if (ptr > S - 1) return "POINTER OUT OF BOUNDS"
        break
      case "<":
        ptr--
        if (ptr < 0) return "POINTER OUT OF BOUNDS"
        break
      case "+":
        tape[ptr]++
        if (tape[ptr] > 255) return "INCORRECT VALUE"
        break
      case "-":
        tape[ptr]--
        if (tape[ptr] < 0) return "INCORRECT VALUE"
        break
      case ".":
        out.push(String.fromCharCode(tape[ptr]))
        break
      case ",":
        tape[ptr] = inputs[inIdx++]
        break
      case "[":
        if (tape[ptr] === 0) pc = match[pc]
        break
      case "]":
        if (tape[ptr] !== 0) pc = match[pc]
        break
    }
    pc++
  }
  return null
}

if (syntaxError) {
  console.log("SYNTAX ERROR")
} else {
  const err = run()
  // On a runtime error, print only the error (discard partial output).
  if (err) console.log(err)
  else console.log(out.join(""))
}
