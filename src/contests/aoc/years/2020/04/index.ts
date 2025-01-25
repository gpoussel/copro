import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 4

function parseInput(input: string) {
  const passportBlocks = utils.input.blocks(input)
  const passports = passportBlocks.map(block => {
    const attributes: Record<string, string> = {}
    block
      .replace(/\n/g, " ")
      .split(" ")
      .map(field => {
        const [key, value] = field.split(":")
        return { key, value }
      })
      .forEach(({ key, value }) => {
        attributes[key] = value
      })
    return attributes
  })
  return passports
}

function isValidPart1(passport: Record<string, string>) {
  const requiredFields = ["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"]
  return requiredFields.every(field => field in passport)
}

function isValidPart2(passport: Record<string, string>) {
  if (!isValidPart1(passport)) {
    return false
  }
  const birthYear = Number(passport.byr)
  if (birthYear < 1920 || birthYear > 2002) {
    return false
  }
  const issueYear = Number(passport.iyr)
  if (issueYear < 2010 || issueYear > 2020) {
    return false
  }
  const expirationYear = Number(passport.eyr)
  if (expirationYear < 2020 || expirationYear > 2030) {
    return false
  }
  const height = passport.hgt
  if (!height.match(/^\d+(cm|in)$/)) {
    return false
  }
  const heightValue = Number(height.slice(0, -2))
  const heightUnit = height.slice(-2)
  if (heightUnit === "cm" && (heightValue < 150 || heightValue > 193)) {
    return false
  }
  if (heightUnit === "in" && (heightValue < 59 || heightValue > 76)) {
    return false
  }
  const hairColor = passport.hcl
  if (!hairColor.match(/^#[0-9a-f]{6}$/)) {
    return false
  }
  const eyeColor = passport.ecl
  if (!["amb", "blu", "brn", "gry", "grn", "hzl", "oth"].includes(eyeColor)) {
    return false
  }
  const passportId = passport.pid
  if (!passportId.match(/^\d{9}$/)) {
    return false
  }
  return true
}

function part1(inputString: string) {
  const passports = parseInput(inputString)
  return passports.filter(isValidPart1).length
}

function part2(inputString: string) {
  const passports = parseInput(inputString)
  return passports.filter(isValidPart2).length
}

const EXAMPLE = `
ecl:gry pid:860033327 eyr:2020 hcl:#fffffd
byr:1937 iyr:2017 cid:147 hgt:183cm

iyr:2013 ecl:amb cid:350 eyr:2023 pid:028048884
hcl:#cfa07d byr:1929

hcl:#ae17e1 iyr:2013
eyr:2024
ecl:brn pid:760753108 byr:1931
hgt:179cm

hcl:#cfa07d eyr:2025 pid:166559648
iyr:2011 ecl:brn hgt:59in`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 2,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 2,
      },
    ],
  },
} as AdventOfCodeContest
