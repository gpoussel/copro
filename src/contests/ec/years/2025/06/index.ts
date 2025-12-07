import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2025 - Quest 6

function parseInput(input: string) {
  return utils.input.firstLine(input).split("")
}

function countPossibilities(letters: string[]): number[] {
  const possibilities: number[][] = [[], [], []]
  const mentors = [0, 0, 0]
  const students = [0, 0, 0]
  for (let i = 0; i < letters.length; ++i) {
    if (letters[i] === "A") {
      mentors[0]++
    } else if (letters[i] === "B") {
      mentors[1]++
    } else if (letters[i] === "C") {
      mentors[2]++
    } else if (letters[i] === "a" || letters[i] === "b" || letters[i] === "c") {
      const idx = (letters[i].charCodeAt(0) - "a".charCodeAt(0)) as 0 | 1 | 2
      students[idx]++
      possibilities[idx].push(mentors[idx])
    }
  }
  return possibilities.map(arr => arr.reduce((acc, val) => acc + val, 0))
}

function part1(inputString: string) {
  const letters = parseInput(inputString)
  const possibilities = countPossibilities(letters)
  return possibilities[0]
}

function part2(inputString: string) {
  const letters = parseInput(inputString)
  const possibilities = countPossibilities(letters)
  return possibilities.reduce((a, b) => a + b, 0)
}

function part3(inputString: string) {
  const letters = parseInput(inputString)
  const repeat = letters.length < 30 ? 1 : 1000
  const distanceLimit = letters.length < 30 ? 10 : 1000
  const n = letters.length
  const fullLength = n * repeat

  const mentorPositions: Map<string, number[]> = new Map()
  for (let i = 0; i < n; i++) {
    const letter = letters[i]
    if (letter >= "A" && letter <= "C") {
      if (!mentorPositions.has(letter)) {
        mentorPositions.set(letter, [])
      }
      mentorPositions.get(letter)!.push(i)
    }
  }

  let totalPairs = 0

  for (let i = 0; i < fullLength; i++) {
    const letter = letters[i % n]
    if (letter >= "a" && letter <= "c") {
      const mentorLetter = letter.toUpperCase()
      const positions = mentorPositions.get(mentorLetter)
      if (!positions || positions.length === 0) {
        continue
      }

      const start = Math.max(0, i - distanceLimit)
      const end = Math.min(fullLength - 1, i + distanceLimit)

      const startPattern = Math.floor(start / n)
      const endPattern = Math.floor(end / n)

      let count = 0

      if (startPattern === endPattern) {
        const localStart = start % n
        const localEnd = end % n
        for (const pos of positions) {
          if (pos >= localStart && pos <= localEnd) {
            count++
          }
        }
      } else {
        const localStart = start % n
        for (const pos of positions) {
          if (pos >= localStart) {
            count++
          }
        }

        const fullPatterns = endPattern - startPattern - 1
        count += fullPatterns * positions.length

        const localEnd = end % n
        for (const pos of positions) {
          if (pos <= localEnd) {
            count++
          }
        }
      }

      totalPairs += count
    }
  }

  return totalPairs
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `ABabACacBCbca`,
        expected: 5,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `ABabACacBCbca`,
        expected: 11,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `AABCBABCABCabcabcABCCBAACBCa`,
        expected: 34,
      },
    ],
  },
} as EverybodyCodesContest
