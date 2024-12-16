import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2024 - Quest 10

const EMPTY_CELL = "."
const UNKNOWN_CELL = "?"

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function solve(grid: string[][], start: Vector2) {
  const rowStart = start.y
  const columnStart = start.x

  const block = new VectorSet<Vector2>()
  for (const row of utils.iterate.range(2, 6)) {
    for (const col of utils.iterate.range(2, 6)) {
      block.add(new Vector2(col + columnStart, row + rowStart))
    }
  }

  for (const position of block.vectors) {
    if (![EMPTY_CELL, UNKNOWN_CELL].includes(utils.grid.at(grid, position))) {
      continue
    }
    const row = [0, 1, 6, 7].map(offset => utils.grid.at(grid, new Vector2(columnStart + offset, position.y)))
    const column = [0, 1, 6, 7].map(offset => utils.grid.at(grid, new Vector2(position.x, rowStart + offset)))
    const both = utils.iterate.intersectionBy(row, column, letter => letter)
    if (both.length === 1) {
      utils.grid.set(grid, position, both[0])
    } else if (both.length > 1) {
      return {
        solvable: false,
        word: undefined,
        power: 0,
      }
    }
  }

  for (const position of block.vectors) {
    if (![EMPTY_CELL, UNKNOWN_CELL].includes(utils.grid.at(grid, position))) {
      continue
    }
    const counter = new Map<string, number>()
    let missing = undefined
    for (let i = 0; i < 8; ++i) {
      const v = utils.grid.at(grid, new Vector2(position.x, rowStart + i))
      if (v === UNKNOWN_CELL) {
        missing = new Vector2(position.x, rowStart + i)
      } else {
        counter.set(v, (counter.get(v) || 0) + 1)
      }
    }
    for (let i = 0; i < 8; ++i) {
      const v = utils.grid.at(grid, new Vector2(columnStart + i, position.y))
      if (v === UNKNOWN_CELL) {
        missing = new Vector2(columnStart + i, position.y)
      } else {
        counter.set(v, (counter.get(v) || 0) + 1)
      }
    }
    const singles = []
    for (const [letter, count] of counter) {
      if (count === 1) {
        singles.push(letter)
      }
    }
    if (singles.length === 1) {
      if (missing) {
        utils.grid.set(grid, missing, singles[0])
      }
      utils.grid.set(grid, position, singles[0])
    }
  }

  const letters = []
  let power = 0

  for (const position of block.vectors) {
    const rune = utils.grid.at(grid, position)
    if ([EMPTY_CELL, UNKNOWN_CELL].includes(rune)) {
      return {
        solvable: false,
        word: undefined,
        power: 0,
      }
    }
    letters.push(rune)
    power += (rune.charCodeAt(0) - "A".charCodeAt(0) + 1) * letters.length
  }
  return {
    solvable: true,
    word: letters.join(""),
    power,
  }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return solve(input, new Vector2(0, 0)).word
}

function part2(inputString: string) {
  const grids = utils.input.readGridOfGrid(inputString)
  return grids.map(grid => solve(grid, new Vector2(0, 0)).power).reduce((acc, value) => acc + value, 0)
}

function part3(inputString: string) {
  const input = parseInput(inputString)
  const starts = new VectorSet<Vector2>()
  for (const row of utils.iterate.range(0, input.length - 2, 6)) {
    for (const col of utils.iterate.range(0, input[0].length - 2, 6)) {
      starts.add(new Vector2(col, row))
    }
  }
  let score = Infinity
  let changed = true
  while (changed) {
    changed = false
    let nextScore = 0
    for (const start of starts.vectors) {
      const { solvable, word, power } = solve(input, start)
      if (!solvable) {
        continue
      }
      nextScore += power
    }
    if (nextScore !== score) {
      changed = true
    }
    score = nextScore
  }
  return score
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
**PCBS**
**RLNW**
BV....PT
CR....HZ
FL....JW
SG....MN
**FTZV**
**GMJH**`,
        expected: "PTBVRCZHFLJWGMNS",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
**PCBS** **PCBS**
**RLNW** **RLNW**
BV....PT BV....PT
CR....HZ CR....HZ
FL....JW FL....JW
SG....MN SG....MN
**FTZV** **FTZV**
**GMJH** **GMJH**

**PCBS** **PCBS**
**RLNW** **RLNW**
BV....PT BV....PT
CR....HZ CR....HZ
FL....JW FL....JW
SG....MN SG....MN
**FTZV** **FTZV**
**GMJH** **GMJH**`,
        expected: 7404,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
**XFZB**DCST**
**LWQK**GQJH**
?G....WL....DQ
BS....H?....CN
P?....KJ....TV
NM....Z?....SG
**NSHM**VKWZ**
**PJGV**XFNL**
WQ....?L....YS
FX....DJ....HV
?Y....WM....?J
TJ....YK....LP
**XRTK**BMSP**
**DWZN**GCJV**`,
        expected: 3889,
      },
    ],
  },
} as EverybodyCodesContest
