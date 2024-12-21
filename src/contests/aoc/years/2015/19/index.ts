import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 19

function parseInput(input: string) {
  const [replacements, molecule] = utils.input.blocks(input)
  const replacementsMap = new Map<string, string[]>()
  for (const replacement of utils.input.lines(replacements)) {
    const [from, to] = replacement.split(" => ")
    if (!replacementsMap.has(from)) {
      replacementsMap.set(from, [])
    }
    replacementsMap.get(from)!.push(to)
  }
  return {
    replacements: replacementsMap,
    molecule,
  }
}

function part1(inputString: string) {
  const { replacements, molecule } = parseInput(inputString)

  const createdMolecules = new Set<string>()
  for (const [from, tos] of replacements) {
    for (const to of tos) {
      for (const { index } of molecule.matchAll(new RegExp(from, "g"))) {
        const prefix = molecule.slice(0, index)
        const suffix = molecule.slice(index! + from.length)
        createdMolecules.add(`${prefix}${to}${suffix}`)
      }
    }
  }
  return createdMolecules.size
}

function part2(inputString: string) {
  const { replacements, molecule } = parseInput(inputString)

  // Implementation of CYK algorithm

  const symbolsMap = new Map<string, number>()
  function toTerminalNumber(str: string) {
    if (symbolsMap.has(str)) {
      return symbolsMap.get(str)!
    }
    const symbolNumber = symbolsMap.size
    symbolsMap.set(str, symbolNumber)
    return symbolNumber
  }

  function toTerminalList(str: string) {
    const result: number[] = []
    let termname = ""
    const appendTerm = () => {
      if (termname.length > 0) {
        result.push(toTerminalNumber(termname))
        termname = ""
      }
    }
    for (const c of str) {
      if (c >= "A" && c <= "Z") {
        appendTerm()
      }
      termname += c
    }
    appendTerm()
    return result
  }

  const moleculeTerminals = toTerminalList(molecule)

  const grammarRules: {
    cost: number
    leftSide: number
    rightSideFirst: number
    rightSideSecond: number
  }[] = []
  for (const [leftSide, rightSides] of replacements.entries()) {
    for (const rightSide of rightSides) {
      const rightTerminals = toTerminalList(rightSide)
      let ruleItem: Partial<(typeof grammarRules)[0]> = {
        cost: 1,
        leftSide: toTerminalList(leftSide)[0],
        rightSideFirst: undefined,
        rightSideSecond: undefined,
      }
      const tempRuleName = leftSide + rightSide
      let tempRuleCounter = 1
      for (let i = 0; i < rightTerminals.length - 2; i++) {
        const ruleId = toTerminalNumber(tempRuleName + tempRuleCounter)
        tempRuleCounter++
        ruleItem.rightSideFirst = rightTerminals[i]
        ruleItem.rightSideSecond = ruleId
        grammarRules.push(ruleItem as (typeof grammarRules)[0])
        ruleItem = {
          cost: 0,
          leftSide: ruleId,
          rightSideFirst: undefined,
          rightSideSecond: undefined,
        }
      }
      ruleItem.rightSideFirst = rightTerminals[rightTerminals.length - 2]
      ruleItem.rightSideSecond = rightTerminals[rightTerminals.length - 1]
      grammarRules.push(ruleItem as (typeof grammarRules)[0])
    }
  }

  const n = moleculeTerminals.length
  const P = Array.from(
    {
      length: n + 1,
    },
    _ =>
      Array.from(
        {
          length: n,
        },
        _ =>
          Array.from(
            {
              length: symbolsMap.size,
            },
            _ => -1
          )
      )
  )
  for (let i = 0; i < n; i++) {
    P[1][i][moleculeTerminals[i]] = 0
  }
  for (let i = 2; i <= n; i++) {
    for (let j = 0; j <= n - i; ++j) {
      for (let k = 1; k <= i - 1; ++k) {
        for (let ruleIndex = 0; ruleIndex < grammarRules.length; ++ruleIndex) {
          const rule = grammarRules[ruleIndex]
          const oldValue = P[k][j][rule.rightSideFirst]
          const newValue = P[i - k][j + k][rule.rightSideSecond]
          if (oldValue > -1 && newValue > -1) {
            let oldDistance = P[i][j][rule.leftSide]
            if (oldDistance === -1) {
              oldDistance = Infinity
            }
            const newDistance = Math.min(oldDistance, oldValue + newValue + rule.cost)
            P[i][j][rule.leftSide] = newDistance
          }
        }
      }
    }
  }
  return P[n][0][symbolsMap.get("e")!]
}

const EXAMPLE = `
H => HO
H => OH
O => HH

HOH`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 4,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
