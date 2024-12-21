import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 4

function parseInput(input: string) {
  return utils.input.regexLines(input, /(.*)-(\d+)\[(.*)\]/).map(([_, name, id, checksum]) => ({
    name,
    id: +id,
    checksum,
  }))
}

function isRoomReal(room: ReturnType<typeof parseInput>[0]) {
  const charCount = utils.iterate.countBy(room.name, c => c)
  const computedChecksum = [...charCount.entries()]
    .map(([char, count]) => ({ char, count }))
    .filter(({ char }) => char !== "-")
    .sort((a, b) => {
      if (a.count === b.count) {
        return a.char.localeCompare(b.char)
      }
      return b.count - a.count
    })
    .slice(0, 5)
    .map(({ char }) => char)
    .join("")
  return computedChecksum === room.checksum
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.filter(room => isRoomReal(room)).reduce((acc, room) => acc + room.id, 0)
}

function part2(inputString: string) {
  const rooms = parseInput(inputString)
  for (const room of rooms) {
    const decrypted = room.name
      .split("")
      .map(char => (char === "-" ? " " : String.fromCharCode(((char.charCodeAt(0) - 97 + room.id) % 26) + 97)))
      .join("")
    if (decrypted.startsWith("north")) {
      return room.id
    }
  }
}

const EXAMPLE = `
aaaaa-bbb-z-y-x-123[abxyz]
a-b-c-d-e-f-g-h-987[abcde]
not-a-real-room-404[oarel]
totally-real-room-200[decoy]`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 1514,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
