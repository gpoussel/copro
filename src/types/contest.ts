export interface Contest {
  name: string
  run: (args: string[]) => Promise<void>
}

export interface AdventOfCodePart {
  run: (args: string[]) => string
  tests: {
    input: string
    expected: string
  }[]
}

export interface AdventOfCodeContest {
  part1: AdventOfCodePart
  part2: AdventOfCodePart
}
