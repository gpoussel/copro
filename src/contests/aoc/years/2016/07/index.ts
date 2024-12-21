import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 7

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const parts = line.split(/\[|\]/)
    const outside = parts.filter((_, i) => i % 2 === 0)
    const inside = parts.filter((_, i) => i % 2 === 1)
    return {
      inside,
      outside,
    }
  })
}

function hasAbba(str: string) {
  for (let i = 0; i < str.length - 3; i++) {
    if (str[i] === str[i + 3] && str[i + 1] === str[i + 2] && str[i] !== str[i + 1]) {
      return true
    }
  }
  return false
}

function isAba(str: string) {
  return str[0] === str[2] && str[0] !== str[1]
}

function supportsTls(ip: ReturnType<typeof parseInput>[0]) {
  return ip.outside.some(hasAbba) && ip.inside.every(str => !hasAbba(str))
}

function supportsSsl(ip: ReturnType<typeof parseInput>[0]) {
  const allAbasOutside = ip.outside
    .flatMap(str => Array.from({ length: str.length - 2 }, (_, i) => str.slice(i, i + 3)))
    .filter(isAba)
  const allAbasInside = ip.inside
    .flatMap(str => Array.from({ length: str.length - 2 }, (_, i) => str.slice(i, i + 3)))
    .filter(isAba)
  return allAbasOutside.some(aba => allAbasInside.some(bab => aba[0] === bab[1] && aba[1] === bab[0]))
}

function part1(inputString: string) {
  const ips = parseInput(inputString)
  return ips.filter(ip => supportsTls(ip)).length
}

function part2(inputString: string) {
  const ips = parseInput(inputString)
  return ips.filter(ip => supportsSsl(ip)).length
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
abba[mnop]qrst
abcd[bddb]xyyx
aaaa[qwer]tyui
ioxxoj[asdfgh]zxcvbn
`,
        expected: 2,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
aba[bab]xyz
xyx[xyx]xyx
aaa[kek]eke
zazbz[bzb]cdb
`,
        expected: 3,
      },
    ],
  },
} as AdventOfCodeContest
