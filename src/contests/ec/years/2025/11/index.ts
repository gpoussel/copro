import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2025 - Quest 11

function parseInput(input: string) {
  return utils.input.lines(input).map(Number)
}

function getFlockChecksum(numbers: number[]) {
  return numbers.map((n, index) => n * (index + 1)).reduce((a, b) => a + b, 0)
}

function part1(inputString: string) {
  const numbers = parseInput(inputString)
  let changed = true
  let roundCount = 0
  while (changed && roundCount < 10) {
    changed = runFirstPart(numbers)
    if (changed) {
      ++roundCount
    }
  }
  changed = true
  while (changed && roundCount < 10) {
    changed = runSecondPart(numbers)
    if (changed) {
      ++roundCount
    }
  }
  return getFlockChecksum(numbers)
}

function runSecondPart(numbers: number[]) {
  let changed = false
  for (let i = 0; i < numbers.length - 1; ++i) {
    if (numbers[i] < numbers[i + 1]) {
      numbers[i + 1]--
      numbers[i]++
      changed = true
    }
  }
  return changed
}

function runFirstPart(numbers: number[]) {
  let changed = false
  for (let i = 0; i < numbers.length - 1; ++i) {
    if (numbers[i] > numbers[i + 1]) {
      numbers[i + 1]++
      numbers[i]--
      changed = true
    }
  }
  return changed
}

function part2(inputString: string) {
  const numbers = parseInput(inputString)
  return calculateRounds(numbers)
}

function part3(inputString: string) {
  return part2(inputString)
}

function calculateRounds(numbers: number[]) {
  const n = numbers.length
  const total = numbers.reduce((a, b) => a + b, 0)
  const target = total / n

  // Compute the stable state after firstPart using Pool Adjacent Violators Algorithm (PAVA)
  const stable = pavaInteger(numbers)

  // First phase passes = max prefix sum of (original - stable)
  let prefixSum = 0
  let firstPhasePasses = 0
  for (let i = 0; i < n; i++) {
    prefixSum += numbers[i] - stable[i]
    firstPhasePasses = Math.max(firstPhasePasses, prefixSum)
  }

  // Second phase passes = max suffix sum of (stable - target)
  let suffixSum = 0
  let secondPhasePasses = 0
  for (let i = n - 1; i >= 0; i--) {
    suffixSum += stable[i] - target
    secondPhasePasses = Math.max(secondPhasePasses, suffixSum)
  }

  return firstPhasePasses + secondPhasePasses
}

// Pool Adjacent Violators Algorithm with integer output
function pavaInteger(arr: number[]): number[] {
  const n = arr.length
  // blocks[i] = { sum, count }
  let blocks: { sum: number; count: number }[] = arr.map(v => ({ sum: v, count: 1 }))

  // Merge until no violations
  let changed = true
  while (changed) {
    changed = false
    const newBlocks: { sum: number; count: number }[] = []
    for (let i = 0; i < blocks.length; i++) {
      if (newBlocks.length > 0) {
        const prev = newBlocks[newBlocks.length - 1]
        const prevAvg = prev.sum / prev.count
        const curAvg = blocks[i].sum / blocks[i].count
        if (prevAvg > curAvg) {
          // Merge
          prev.sum += blocks[i].sum
          prev.count += blocks[i].count
          changed = true
          continue
        }
      }
      newBlocks.push({ ...blocks[i] })
    }
    blocks = newBlocks
  }

  // Expand blocks with integer values
  const result: number[] = []
  for (const block of blocks) {
    const baseVal = Math.floor(block.sum / block.count)
    const remainder = block.sum - baseVal * block.count
    // First (count - remainder) get baseVal, last remainder get baseVal+1
    for (let i = 0; i < block.count - remainder; i++) {
      result.push(baseVal)
    }
    for (let i = 0; i < remainder; i++) {
      result.push(baseVal + 1)
    }
  }
  return result
}
export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
9
1
1
4
9
6`,
        expected: 109,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
9
1
1
4
9
6`,
        expected: 11,
      },
      {
        input: `
805
706
179
48
158
150
232
885
598
524
423`,
        expected: 1579,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [],
  },
} as EverybodyCodesContest
