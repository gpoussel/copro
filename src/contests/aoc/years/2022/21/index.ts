import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2022 - Day 21

interface ValuedMonkey {
  name: string
  value: number
}

interface OperationMonkey {
  name: string
  left: string
  fn: (a: number, b: number) => number
  right: string
}

const OPERATOR_FUNCTIONS: Record<string, (a: number, b: number) => number> = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
}

type Monkey = ValuedMonkey | OperationMonkey

function parseInput(input: string): Monkey[] {
  return utils.input.lines(input).map(line => {
    const [name, expr] = line.split(": ")
    if (/^\d+$/.test(expr)) {
      return { name, value: Number(expr) }
    } else {
      const [left, operator, right] = expr.split(" ")
      return { name, left, fn: OPERATOR_FUNCTIONS[operator], right }
    }
  })
}

function solveAll(
  monkeyValues: Map<string, number>,
  unknownMonkeys: Map<string, OperationMonkey>,
  targetMonkey: string
) {
  while (!monkeyValues.has(targetMonkey)) {
    for (const [name, monkey] of unknownMonkeys) {
      const leftValue = monkeyValues.get(monkey.left)
      const rightValue = monkeyValues.get(monkey.right)
      if (leftValue !== undefined && rightValue !== undefined) {
        const result = monkey.fn(leftValue, rightValue)
        monkeyValues.set(name, result)
        unknownMonkeys.delete(name)
      }
    }
  }
}

function part1(inputString: string) {
  const monkeys = parseInput(inputString)
  const monkeyValues = new Map<string, number>()
  const unknownMonkeys = new Map<string, OperationMonkey>()
  for (const monkey of monkeys) {
    if ("value" in monkey) {
      monkeyValues.set(monkey.name, monkey.value)
    } else {
      unknownMonkeys.set(monkey.name, monkey)
    }
  }
  solveAll(monkeyValues, unknownMonkeys, "root")
  return monkeyValues.get("root")
}

function part2(inputString: string) {
  const monkeys = parseInput(inputString)
  const monkeyMap = new Map<string, Monkey>()
  for (const monkey of monkeys) {
    monkeyMap.set(monkey.name, monkey)
  }

  // Build expression tree, tracking whether it contains humn
  type Expr = { type: "num"; value: bigint } | { type: "humn" } | { type: "op"; op: string; left: Expr; right: Expr }

  function buildExpr(name: string): Expr {
    if (name === "humn") {
      return { type: "humn" }
    }
    const monkey = monkeyMap.get(name)!
    if ("value" in monkey) {
      return { type: "num", value: BigInt(monkey.value) }
    }
    return {
      type: "op",
      op: Object.entries(OPERATOR_FUNCTIONS).find(([_, fn]) => fn === monkey.fn)![0],
      left: buildExpr(monkey.left),
      right: buildExpr(monkey.right),
    }
  }

  function evaluate(expr: Expr): bigint | null {
    if (expr.type === "num") return expr.value
    if (expr.type === "humn") return null
    const left = evaluate(expr.left)
    const right = evaluate(expr.right)
    if (left === null || right === null) return null
    switch (expr.op) {
      case "+":
        return left + right
      case "-":
        return left - right
      case "*":
        return left * right
      case "/":
        return left / right
    }
    return null
  }

  function simplify(expr: Expr): Expr {
    if (expr.type !== "op") return expr
    const left = simplify(expr.left)
    const right = simplify(expr.right)
    const leftVal = evaluate(left)
    const rightVal = evaluate(right)
    if (leftVal !== null && rightVal !== null) {
      switch (expr.op) {
        case "+":
          return { type: "num", value: leftVal + rightVal }
        case "-":
          return { type: "num", value: leftVal - rightVal }
        case "*":
          return { type: "num", value: leftVal * rightVal }
        case "/":
          return { type: "num", value: leftVal / rightVal }
      }
    }
    return { type: "op", op: expr.op, left, right }
  }

  // Solve: find humn such that expr equals target
  function solve(expr: Expr, target: bigint): bigint {
    if (expr.type === "humn") return target
    if (expr.type === "num") throw new Error("Cannot solve for constant")

    const leftVal = evaluate(expr.left)
    const rightVal = evaluate(expr.right)

    if (leftVal !== null) {
      // left is known, solve for right
      switch (expr.op) {
        case "+":
          return solve(expr.right, target - leftVal) // left + right = target => right = target - left
        case "-":
          return solve(expr.right, leftVal - target) // left - right = target => right = left - target
        case "*":
          return solve(expr.right, target / leftVal) // left * right = target => right = target / left
        case "/":
          return solve(expr.right, leftVal / target) // left / right = target => right = left / target
      }
    } else if (rightVal !== null) {
      // right is known, solve for left
      switch (expr.op) {
        case "+":
          return solve(expr.left, target - rightVal) // left + right = target => left = target - right
        case "-":
          return solve(expr.left, target + rightVal) // left - right = target => left = target + right
        case "*":
          return solve(expr.left, target / rightVal) // left * right = target => left = target / right
        case "/":
          return solve(expr.left, target * rightVal) // left / right = target => left = target * right
      }
    }
    throw new Error("Both sides contain humn")
  }

  const root = monkeyMap.get("root") as OperationMonkey
  const leftExpr = simplify(buildExpr(root.left))
  const rightExpr = simplify(buildExpr(root.right))

  const leftVal = evaluate(leftExpr)
  const rightVal = evaluate(rightExpr)

  if (leftVal !== null) {
    return Number(solve(rightExpr, leftVal))
  } else {
    return Number(solve(leftExpr, rightVal!))
  }
}
const EXAMPLE = `
root: pppw + sjmn
dbpl: 5
cczh: sllz + lgvd
zczc: 2
ptdq: humn - dvpt
dvpt: 3
lfqf: 4
humn: 5
ljgn: 2
sjmn: drzm * dbpl
sllz: 4
pppw: cczh / lfqf
lgvd: ljgn * ptdq
drzm: hmdt - zczc
hmdt: 32`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 152,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 301,
      },
    ],
  },
} as AdventOfCodeContest
