export interface Contest {
  name: string
  run: (args: string[]) => Promise<void>
}

export interface MultiLevelQuestPart {
  run: (args: string) => string | number | undefined
  tests: {
    input: string
    expected: string | number | undefined
  }[]
}

export interface AdventOfCodeContest {
  part1: MultiLevelQuestPart
  part2: MultiLevelQuestPart
}

export interface EverybodyCodesContest {
  part1: MultiLevelQuestPart
  part2: MultiLevelQuestPart
  part3: MultiLevelQuestPart
}
