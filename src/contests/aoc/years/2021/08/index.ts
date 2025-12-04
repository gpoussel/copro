import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 8

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [patterns, output] = line.split(" | ").map(part => part.split(" "))
    return { patterns, output }
  })
}

function part1(inputString: string) {
  const combinations = parseInput(inputString)
  return combinations.flatMap(c => c.output).filter(digit => [2, 3, 4, 7].includes(digit.length)).length
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  let total = 0
  for (const { patterns, output } of input) {
    const patternsByLength = utils.iterate.mapBy(patterns, p => p.length)

    const one = patternsByLength.get(2)![0]
    const four = patternsByLength.get(4)![0]
    const seven = patternsByLength.get(3)![0]
    const eight = patternsByLength.get(7)![0]

    const segments = new Map<string, string>()
    // a = 7 - 1
    utils.iterate.differenceBy(seven.split(""), one.split(""), x => x).forEach(s => segments.set("a", s))

    const missingInSix = patternsByLength
      .get(6)!
      .map(p => p.split(""))
      .map(letters => utils.iterate.differenceBy(eight.split(""), letters, x => x)[0])

    // e = any segment missing in 6 - 4
    utils.iterate.differenceBy(missingInSix, four.split(""), x => x).forEach(s => segments.set("e", s))
    // c = common between 1 and missing in 6
    utils.iterate.intersectionBy(one.split(""), missingInSix, x => x).forEach(s => segments.set("c", s))
    // d = any segment missing in 6 - e - c
    utils.iterate.differenceBy(missingInSix, Array.from(segments.values()), x => x).forEach(s => segments.set("d", s))
    // b = 4 - 1 - d
    utils.iterate
      .differenceBy(four.split(""), one.split("").concat(Array.from(segments.values())), x => x)
      .forEach(s => segments.set("b", s))
    // f = common between 1 and 6
    utils.iterate.differenceBy(one.split(""), missingInSix, x => x).forEach(s => segments.set("f", s))
    // g = remaining segment
    utils.iterate
      .differenceBy(eight.split(""), Array.from(segments.values()), x => x)
      .forEach(s => segments.set("g", s))

    const segmentToDigit = new Map<string, number>()
    segmentToDigit.set("abcefg", 0)
    segmentToDigit.set("cf", 1)
    segmentToDigit.set("acdeg", 2)
    segmentToDigit.set("acdfg", 3)
    segmentToDigit.set("bcdf", 4)
    segmentToDigit.set("abdfg", 5)
    segmentToDigit.set("abdefg", 6)
    segmentToDigit.set("acf", 7)
    segmentToDigit.set("abcdefg", 8)
    segmentToDigit.set("abcdfg", 9)

    const outputValue = output
      .map(digitSegments => {
        const mappedSegments = digitSegments
          .split("")
          .map(s => {
            for (const [key, value] of segments.entries()) {
              if (value === s) {
                return key
              }
            }
            throw new Error("Segment not found")
          })
          .sort()
          .join("")
        return segmentToDigit.get(mappedSegments)!
      })
      .join("")
    total += +outputValue
  }
  return total
}

const EXAMPLE1 = `acedgfb cdfbe gcdfa fbcad dab cefabd cdfgeb eafb cagedb ab | cdfeb fcadb cdfeb cdbaf`
const EXAMPLE2 = `
be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe
edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc
fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg
fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb
aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea
fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb
dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe
bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef
egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb
gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 0,
      },
      {
        input: EXAMPLE2,
        expected: 26,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE1,
        expected: 5353,
      },
      {
        input: EXAMPLE2,
        expected: 61229,
      },
    ],
  },
} as AdventOfCodeContest
