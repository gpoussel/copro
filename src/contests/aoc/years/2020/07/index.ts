import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 7

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [color, rest] = line.split(" bags contain ")
    if (rest.startsWith("no other bags")) {
      return { color, content: [] }
    }
    const content = [...rest.matchAll(/(\d+) ([a-z ]+) bags?/g)].map(match => {
      const [_, count, color] = match
      return { color, count: Number(count) }
    })
    return { color, content }
  })
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const containers = new Map<string, string[]>()
  for (const { color, content } of input) {
    for (const { color: contentColor } of content) {
      const container = containers.get(contentColor) || []
      container.push(color)
      containers.set(contentColor, container)
    }
  }
  const colors = new Set<string>()
  const stack = ["shiny gold"]
  while (stack.length > 0) {
    const color = stack.pop()!
    if (colors.has(color)) {
      continue
    }
    colors.add(color)
    stack.push(...(containers.get(color) || []))
  }
  return colors.size - 1
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const contents = new Map<string, { color: string; count: number }[]>()
  for (const { color, content } of input) {
    contents.set(color, content)
  }
  const stack = [{ color: "shiny gold", count: 1 }]
  let total = 0
  while (stack.length > 0) {
    const { color, count } = stack.pop()!
    const content = contents.get(color) || []
    for (const { color: contentColor, count: contentCount } of content) {
      total += count * contentCount
      stack.push({ color: contentColor, count: count * contentCount })
    }
  }
  return total
}

const EXAMPLE1 = `
light red bags contain 1 bright white bag, 2 muted yellow bags.
dark orange bags contain 3 bright white bags, 4 muted yellow bags.
bright white bags contain 1 shiny gold bag.
muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.
shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.
dark olive bags contain 3 faded blue bags, 4 dotted black bags.
vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.
faded blue bags contain no other bags.
dotted black bags contain no other bags.`

const EXAMPLE2 = `
shiny gold bags contain 2 dark red bags.
dark red bags contain 2 dark orange bags.
dark orange bags contain 2 dark yellow bags.
dark yellow bags contain 2 dark green bags.
dark green bags contain 2 dark blue bags.
dark blue bags contain 2 dark violet bags.
dark violet bags contain no other bags.`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 4,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE1,
        expected: 32,
      },
      {
        input: EXAMPLE2,
        expected: 126,
      },
    ],
  },
} as AdventOfCodeContest
