import { combinations, permutations } from "../../../utils/iterate.js"

// 🧮 Project Euler - Problem 93

const OPERATIONS = ["+", "-", "*", "/"] as const

interface Node {
  op: (typeof OPERATIONS)[number]
  left: Node | Leaf
  right: Node | Leaf
}

interface Leaf {
  number: number
}

function generateTrees(elements: number[]): Node[] {
  if (elements.length < 2) {
    throw new Error("At least two elements are required to generate a tree")
  }
  if (elements.length === 2) {
    return OPERATIONS.map(op => ({
      op,
      left: { number: elements[0] },
      right: { number: elements[1] },
    }))
  }
  if (elements.length === 3) {
    // Either the first two are combined first, or the last two are combined first
    return OPERATIONS.flatMap(op => [
      ...generateTrees([elements[0], elements[1]]).map(subtree => ({
        op,
        left: subtree,
        right: { number: elements[2] },
      })),
      ...generateTrees([elements[1], elements[2]]).map(subtree => ({
        op,
        left: { number: elements[0] },
        right: subtree,
      })),
    ])
  }
  if (elements.length === 4) {
    // 1-234, 12-34, 123-4
    return OPERATIONS.flatMap(op => [
      ...generateTrees([elements[1], elements[2], elements[3]]).map(subtree => ({
        op,
        left: { number: elements[0] },
        right: subtree,
      })),
      ...generateTrees([elements[0], elements[1]]).flatMap(subtree1 =>
        generateTrees([elements[2], elements[3]]).map(subtree2 => ({ op, left: subtree1, right: subtree2 }))
      ),
      ...generateTrees([elements[0], elements[1], elements[2]]).map(subtree => ({
        op,
        left: subtree,
        right: { number: elements[3] },
      })),
    ])
  }
  throw new Error("Not implemented")
}

function evaluateTree(tree: Node | Leaf): number {
  if ("number" in tree) {
    return tree.number
  }
  const left = evaluateTree(tree.left)
  const right = evaluateTree(tree.right)
  switch (tree.op) {
    case "+":
      return left + right
    case "-":
      return left - right
    case "*":
      return left * right
    case "/":
      return left / right
  }
}

export function solve() {
  let bestPermutationNumber = 0
  let bestCombination: number[] = []
  for (const combination of combinations([1, 2, 3, 4, 5, 6, 7, 8, 9], 4)) {
    const values = new Set<number>()
    for (const permutation of permutations(combination)) {
      const trees = generateTrees(permutation)
      trees.map(evaluateTree).forEach(value => values.add(value))
    }
    let numberToFind = 1
    while (values.has(numberToFind)) {
      numberToFind++
    }
    if (numberToFind > bestPermutationNumber) {
      bestPermutationNumber = numberToFind
      bestCombination = combination
    }
  }
  return bestCombination.sort().join("")
}
