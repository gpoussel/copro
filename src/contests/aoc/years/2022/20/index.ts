import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2022 - Day 20

function parseInput(input: string) {
  return utils.input.lines(input).map(line => +line)
}

interface Node {
  value: number
  prev: Node | null
  next: Node | null
}

function buildLinkedList(values: number[]): Node[] {
  const nodes: Node[] = values.map(value => ({ value, prev: null, next: null }))
  const n = nodes.length
  for (let i = 0; i < n; i++) {
    nodes[i].next = nodes[(i + 1) % n]
    nodes[i].prev = nodes[(i - 1 + n) % n]
  }
  return nodes
}

function mix(linkedList: Node[]): void {
  const n = linkedList.length

  for (const node of linkedList) {
    if (node.value === 0) {
      continue
    }

    // Remove node from its current position
    const oldPrev = node.prev!
    const oldNext = node.next!
    oldPrev.next = oldNext
    oldNext.prev = oldPrev

    // Find new position - after removal, list has n-1 elements
    let steps = ((node.value % (n - 1)) + (n - 1)) % (n - 1)
    let target = oldPrev
    for (let i = 0; i < steps; i++) {
      target = target.next!
    }

    // Insert after target
    node.next = target.next
    node.prev = target
    target.next!.prev = node
    target.next = node
  }
}

function getGroveCoordinates(linkedList: Node[]): number {
  let current = linkedList.find(n => n.value === 0)!
  const resultValues: number[] = []
  for (let i = 0; i < 3000; i++) {
    current = current.next!
    if ((i + 1) % 1000 === 0) {
      resultValues.push(current.value)
    }
  }
  return resultValues.reduce((a, b) => a + b, 0)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const linkedList = buildLinkedList(input)
  mix(linkedList)
  return getGroveCoordinates(linkedList)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const decryptionKey = 811589153
  const linkedList = buildLinkedList(input.map(v => v * decryptionKey))
  for (let i = 0; i < 10; i++) {
    mix(linkedList)
  }
  return getGroveCoordinates(linkedList)
}

const EXAMPLE = `
1
2
-3
3
-2
0
4`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 3,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 1623178306,
      },
    ],
  },
} as AdventOfCodeContest
