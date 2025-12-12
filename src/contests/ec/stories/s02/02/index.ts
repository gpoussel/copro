import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { OrderStatisticTree } from "../../../../../utils/structures/order-statistic-tree.js"

// 🎲 Everybody Codes Story 2 - Quest 2

function parseInput(input: string) {
  return utils.input.firstLine(input).split("")
}

function part1(inputString: string) {
  const balloons = parseInput(inputString)
  if (balloons.length === 0) {
    return 0
  }

  let shots = 0
  const boltColors = ["R", "G", "B"]
  let boltColorIndex = 0

  while (balloons.length > 0) {
    shots++
    const currentBoltColor = boltColors[boltColorIndex]
    boltColorIndex = (boltColorIndex + 1) % 3

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (balloons.length === 0) {
        break
      }
      const currentBalloonColor = balloons[0]
      if (currentBoltColor === currentBalloonColor) {
        balloons.shift()
        // Bolt continues
      } else {
        balloons.shift()
        // Bolt is destroyed
        break
      }
    }
  }

  return shots
}

function runCircularSimulation(reps: number, input: string[]) {
  if (input.length === 0) {
    return 0
  }

  const balloons = new OrderStatisticTree()
  const initialBalloons: string[] = []
  for (let i = 0; i < reps; i++) {
    initialBalloons.push(...input)
  }

  for (let i = 0; i < initialBalloons.length; i++) {
    balloons.insert(i, initialBalloons[i])
  }

  let shots = 0
  const boltColors = ["R", "G", "B"]
  let boltColorIndex = 0

  while (balloons.size() > 0) {
    shots++
    const currentBoltColor = boltColors[boltColorIndex]
    boltColorIndex = (boltColorIndex + 1) % 3

    const initialCount = balloons.size()
    const firstBalloon = balloons.get(0)!

    if (currentBoltColor === firstBalloon) {
      balloons.delete(0) // pop the first balloon
      if (initialCount % 2 === 0 && balloons.size() > 0) {
        const oppositeIndex = initialCount / 2 - 1
        balloons.delete(oppositeIndex) // pop the opposite balloon
      }
    } else {
      balloons.delete(0) // pop the first balloon
    }
  }

  return shots
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return runCircularSimulation(100, input)
}

function part3(inputString: string) {
  const input = parseInput(inputString)
  if (input.length === 0) return 0
  
  // With the O(N log N) simulation, we can run the full simulation.
  return runCircularSimulation(100000, input)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `GRBGGGBBBRRRRRRRR`,
        expected: 7,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `BBRGGRRGBBRGGBRGBBRRBRRRBGGRRRBGBGG`,
        expected: 2955, // This should still be correct
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `BBRGGRRGBBRGGBRGBBRRBRRRBGGRRRBGBGG`,
        expected: 2953681, // This needs to be replaced with the exact value
      },
    ],
  },
} as EverybodyCodesContest
