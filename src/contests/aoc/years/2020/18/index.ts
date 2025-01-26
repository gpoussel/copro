import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 18

function parseInput(input: string) {
  return utils.input.lines(input)
}

function evaluateOperator(operator: string, operand1: number, operand2: number) {
  if (operator === "+") {
    return operand1 + operand2
  }
  if (operator === "*") {
    return operand1 * operand2
  }
  throw new Error(`Invalid operator: ${operator}`)
}

function evaluateOperatorsWithoutPriority(operators: string[], operands: number[]) {
  let result = +operands[0]
  for (let i = 0; i < operators.length; i++) {
    result = evaluateOperator(operators[i], result, +operands[i + 1])
  }
  return result
}

function evaluateOperatorsWithAdditionPriority(operators: string[], operands: number[]) {
  const additionIndexes: number[] = []
  for (let i = 0; i < operators.length; i++) {
    if (operators[i] === "+") {
      additionIndexes.push(i)
    }
  }
  while (additionIndexes.length > 0) {
    const additionIndex = additionIndexes.pop()!
    const operand1 = operands[additionIndex]
    const operand2 = operands[additionIndex + 1]
    const result = evaluateOperator("+", operand1, operand2)
    operands.splice(additionIndex, 2, result)
    operators.splice(additionIndex, 1)
  }
  return evaluateOperatorsWithoutPriority(operators, operands)
}

function evaluateExpression(
  expression: string,
  evaluateOperators: (operators: string[], operands: number[]) => number
) {
  const tokens = expression.replace(/ +/g, "").split("")
  const operatorStack: string[] = []
  const operandStack: number[] = []
  for (const token of tokens) {
    if (token === "+" || token === "*") {
      operatorStack.push(token)
    } else if (token === "(") {
      operatorStack.push(token)
    } else if (token === ")") {
      const subOperators: string[] = []
      const subOperands: number[] = []
      while (operatorStack[operatorStack.length - 1] !== "(") {
        subOperators.push(operatorStack.pop()!)
        subOperands.push(operandStack.pop()!)
      }
      subOperands.push(operandStack.pop()!)
      operandStack.push(evaluateOperators(subOperators.reverse(), subOperands.reverse()))
      operatorStack.pop()
    } else if (token.match(/[0-9]/)) {
      operandStack.push(+token)
    } else {
      throw new Error(`Invalid token: ${token}`)
    }
  }
  return evaluateOperators(operatorStack, operandStack)
}

function part1(inputString: string) {
  const expressions = parseInput(inputString)
  return expressions.map(e => evaluateExpression(e, evaluateOperatorsWithoutPriority)).reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const expressions = parseInput(inputString)
  return expressions.map(e => evaluateExpression(e, evaluateOperatorsWithAdditionPriority)).reduce((a, b) => a + b, 0)
}

export default {
  part1: {
    run: part1,
    tests: [
      { input: "1 + 2 * 3 + 4 * 5 + 6", expected: 71 },
      { input: "1 + (2 * 3) + (4 * (5 + 6))", expected: 51 },
      { input: "2 * 3 + (4 * 5)", expected: 26 },
      { input: "5 + (8 * 3 + 9 + 3 * 4 * 3)", expected: 437 },
      { input: "5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))", expected: 12240 },
      { input: "((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2", expected: 13632 },
    ],
  },
  part2: {
    run: part2,
    tests: [
      { input: "1 + 2 * 3 + 4 * 5 + 6", expected: 231 },
      { input: "1 + (2 * 3) + (4 * (5 + 6))", expected: 51 },
      { input: "2 * 3 + (4 * 5)", expected: 46 },
      { input: "5 + (8 * 3 + 9 + 3 * 4 * 3)", expected: 1445 },
      { input: "5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))", expected: 669060 },
      { input: "((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2", expected: 23340 },
    ],
  },
} as AdventOfCodeContest
