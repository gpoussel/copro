import { EverybodyCodesContest } from "../../../../../types/contest.js"
import { DIRECTIONS } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2024 - Quest 2

function parseInput(input: string) {
  const blocks = utils.input.blocks(input)
  const words = blocks[0].split(":")[1].split(",")
  const sentences = utils.input.lines(blocks[1])
  return { words, sentences }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.words
    .map(word =>
      input.sentences
        .map(sentence => utils.string.countSubstring(sentence, word))
        .reduce((acc, count) => acc + count, 0)
    )
    .reduce((acc, count) => acc + count, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input.sentences
    .map(sentence => {
      const usedPositions = new Set<number>()
      for (let i = 0; i < sentence.length; ++i) {
        for (const word of input.words) {
          const reversedWord = word.split("").reverse().join("")
          if (
            sentence.substring(i, i + word.length) === word ||
            sentence.substring(i, i + word.length) === reversedWord
          ) {
            for (let j = 0; j < word.length; ++j) {
              usedPositions.add(i + j)
            }
          }
        }
      }
      return usedPositions.size
    })
    .reduce((acc, count) => acc + count, 0)
}

function part3(inputString: string) {
  const input = parseInput(inputString)
  const grid = utils.input.readGrid(input.sentences.join("\n"))
  const words = input.words
  const usedPositions = new VectorSet<Vector2>()
  utils.grid.iterate(grid, (cell, x, y) => {
    for (const word of words) {
      for (const direction of DIRECTIONS) {
        let foundWord = true
        const visitedPositions = new VectorSet<Vector2>()
        for (let i = 0; i < word.length; ++i) {
          const letterPosInGrid = utils.grid.moduloHorizontal(grid, new Vector2(x, y).move(direction, i))
          visitedPositions.add(new Vector2(letterPosInGrid.x, letterPosInGrid.y))
          if (word[i] !== utils.grid.at(grid, letterPosInGrid)) {
            foundWord = false
            break
          }
        }
        if (foundWord) {
          visitedPositions.forEach(position => usedPositions.add(position))
        }
      }
    }
  })
  return usedPositions.length
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `WORDS:THE,OWE,MES,ROD,HER

AWAKEN THE POWER ADORNED WITH THE FLAMES BRIGHT IRE`,
        expected: 4,
      },
      {
        input: `WORDS:THE,OWE,MES,ROD,HER

THE FLAME SHIELDED THE HEART OF THE KINGS`,
        expected: 3,
      },
      {
        input: `WORDS:THE,OWE,MES,ROD,HER

POWE PO WER P OWE R`,
        expected: 2,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `WORDS:THE,OWE,MES,ROD,HER,QAQ

AWAKEN THE POWE ADORNED WITH THE FLAMES BRIGHT IRE
THE FLAME SHIELDED THE HEART OF THE KINGS
POWE PO WER P OWE R
THERE IS THE END
QAQAQ`,
        expected: 42,
      },
      {
        input: `WORDS:QAQ

QAQAQ`,
        expected: 5,
      },
      {
        input: `WORDS:M,MAM

MAM`,
        expected: 3,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `WORDS:THE,OWE,MES,ROD,RODEO

HELWORLT
ENIGWDXL
TRODEOAL`,
        expected: 10,
      },
    ],
  },
} as EverybodyCodesContest
