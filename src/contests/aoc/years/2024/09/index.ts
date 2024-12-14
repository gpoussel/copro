import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2024 - Day 9

type BlockType = { empty: true; id: undefined; size: number } | { empty: false; id: number; size: number }

function parseInput(input: string): BlockType[] {
  const line = utils.input.firstLine(input)
  let empty = false
  const blocks = []
  let id = 0
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char !== "0") {
      if (empty) {
        blocks.push({
          empty: true,
          size: parseInt(char),
        } as BlockType)
      } else {
        blocks.push({
          empty: false,
          id,
          size: parseInt(char),
        } as BlockType)
      }
    }
    empty = !empty
    if (empty) {
      id++
    }
  }
  return blocks
}

function computeChecksum(blocks: BlockType[]) {
  let index = 0
  let checksum = 0
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    for (let j = 0; j < block.size; j++) {
      if (!block.empty) {
        checksum += index * block.id
      }
      index++
    }
  }
  return checksum
}

function defragment(blocks: BlockType[], onlyFullBlock: boolean) {
  let done = false
  let iteration = 0
  while (!done) {
    let canMove = false
    for (let i = blocks.length - 1; i >= 0 && !canMove; i--) {
      if (blocks[i].empty) {
        continue
      }
      for (let j = 0; j < i; j++) {
        if (blocks[j].empty) {
          if (blocks[i].size === blocks[j].size) {
            blocks[j] = { ...blocks[i] }
            blocks[i].empty = true
            delete blocks[i].id

            canMove = true
            break
          } else if (blocks[i].size < blocks[j].size) {
            const blockToInsert = {
              ...blocks[i],
            }
            blocks[j].size -= blocks[i].size
            blocks[i].empty = true
            delete blocks[i].id
            blocks.splice(j, 0, blockToInsert)
            canMove = true
            break
          } else if (!onlyFullBlock) {
            blocks[j].empty = false
            blocks[j].id = blocks[i].id
            blocks[i].size -= blocks[j].size
            blocks.push({
              empty: true,
              size: blocks[j].size,
            } as BlockType)
            canMove = true
          }
        }
      }
    }
    if (!canMove) {
      done = true
    }
    utils.log.logEvery(iteration++, 500)
  }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  defragment(input, false)
  return computeChecksum(input)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  defragment(input, true)
  return computeChecksum(input)
}

const EXAMPLE = `2333133121414131402`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 1928,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 2858,
      },
    ],
  },
} as AdventOfCodeContest
