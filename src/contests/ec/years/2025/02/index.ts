import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2025 - Quest 2

class Complex {
  real: number
  imag: number

  constructor(real: number, imag: number) {
    this.real = real
    this.imag = imag
  }

  add(other: Complex): Complex {
    return new Complex(this.real + other.real, this.imag + other.imag)
  }

  mul(other: Complex): Complex {
    return new Complex(this.real * other.real - this.imag * other.imag, this.real * other.imag + this.imag * other.real)
  }

  div(other: Complex): Complex {
    return new Complex(Math.trunc(this.real / other.real), Math.trunc(this.imag / other.imag))
  }

  toString(): string {
    return `[${this.real},${this.imag}]`
  }
}

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const match = line.match(/A=\[([-\d]+),([-\d]+)\]/)
    if (!match) throw new Error("Invalid input line: " + line)
    return new Complex(Number(match[1]), Number(match[2]))
  })
}

function part1(inputString: string) {
  const [A] = parseInput(inputString)
  let result = new Complex(0, 0)
  for (let i = 0; i < 3; ++i) {
    result = result.mul(result)
    result = result.div(new Complex(10, 10))
    result = result.add(A)
  }
  return result.toString()
}

function nextNumber(point: Complex, n: Complex): Complex {
  return n.mul(n).div(new Complex(100000, 100000)).add(point)
}

function isEngraved(point: Complex) {
  let cycle = 0
  let current = point
  while (cycle < 100 && Math.abs(current.real) < 1_000_000 && Math.abs(current.imag) < 1_000_000) {
    current = nextNumber(point, current)
    cycle++
  }
  return cycle === 100
}

function part2(inputString: string) {
  const [A] = parseInput(inputString)

  let countEngraved = 0
  for (let x = A.real; x <= A.real + 1000; x += 10) {
    for (let y = A.imag; y <= A.imag + 1000; y += 10) {
      if (isEngraved(new Complex(x, y))) {
        countEngraved++
      }
    }
  }
  return countEngraved
}

function part3(inputString: string) {
  const [A] = parseInput(inputString)

  let countEngraved = 0
  for (let x = A.real; x <= A.real + 1000; x++) {
    for (let y = A.imag; y <= A.imag + 1000; y++) {
      if (isEngraved(new Complex(x, y))) {
        countEngraved++
      }
    }
  }
  return countEngraved
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `A=[25,9]`,
        expected: "[357,862]",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `A=[35300,-64910]`,
        expected: 4076,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `A=[35300,-64910]`,
        expected: 406954,
      },
    ],
  },
} as EverybodyCodesContest
