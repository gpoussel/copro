// 🎮 CodinGame Puzzle - calculator
// https://www.codingame.com/training/easy/calculator

const round3 = (x: number): number => Math.round(x * 1000) / 1000

const format = (x: number): string => String(round3(x))

const apply = (a: number, op: string, b: number): number => {
  let res: number
  if (op === "+") res = a + b
  else if (op === "-") res = a - b
  else if (op === "x") res = a * b
  else res = a / b
  return round3(res)
}

const n = parseInt(readline(), 10)

let acc = 0 // accumulated result on the left
let current = 0 // currently typed number on screen
let pendingOp = "" // operator waiting to be applied
let typing = false // are we currently entering a new number
let started = false // has acc been initialized

let lastOp = "" // for repeated "="
let lastOperand = 0
let hasLast = false
let justEvaluated = false // last key was "="

const out: string[] = []

for (let i = 0; i < n; i++) {
  const key = readline()

  if (key === "AC") {
    acc = 0
    current = 0
    pendingOp = ""
    typing = false
    started = false
    justEvaluated = false
    lastOp = ""
    lastOperand = 0
    hasLast = false
    out.push("0")
    continue
  }

  if (key >= "0" && key <= "9") {
    const d = parseInt(key, 10)
    if (justEvaluated) {
      // a fresh number after "=" starts a brand new calculation
      acc = 0
      started = false
      pendingOp = ""
      typing = false
      justEvaluated = false
    }
    if (typing) {
      current = current * 10 + d
    } else {
      current = d
      typing = true
    }
    out.push(format(current))
    continue
  }

  if (key === "+" || key === "-" || key === "x" || key === "/") {
    if (justEvaluated) {
      // continue from the evaluated result as the new accumulator
      started = true
      justEvaluated = false
    }
    if (typing) {
      // commit current number into accumulator
      if (!started) {
        acc = current
        started = true
      } else if (pendingOp !== "") {
        acc = apply(acc, pendingOp, current)
      }
      pendingOp = key
      typing = false
    } else {
      // no fresh number typed: just change pending operator (use second)
      if (!started) {
        acc = current
        started = true
      }
      pendingOp = key
    }
    out.push(format(acc))
    continue
  }

  // key === "="
  if (typing) {
    if (pendingOp !== "") {
      lastOp = pendingOp
      lastOperand = current
      hasLast = true
      acc = apply(acc, pendingOp, current)
      pendingOp = ""
    } else {
      acc = current
      started = true
    }
    typing = false
  } else {
    // repeated "=" : reuse last operation
    if (hasLast) {
      acc = apply(acc, lastOp, lastOperand)
    }
  }
  justEvaluated = true
  out.push(format(acc))
}

console.log(out.join("\n"))
