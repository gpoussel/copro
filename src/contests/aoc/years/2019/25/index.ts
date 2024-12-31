import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { breadthFirstSearch } from "../../../../../utils/algo.js"
import { fromCompassChar, fromDirectionChar } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"
import { Computer } from "../09/index.js"

// 🎄 Advent of Code 2019 - Day 25

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function getOutput(computer: Computer) {
  const text = computer.outputs.map(code => String.fromCharCode(code)).join("")
  if (text.includes("back in the cockpit")) {
    return undefined
  }
  const lines = utils.input.lines(text)
  const name = lines[0].slice(3, -3)
  const startOfDoorsList = lines.findIndex(line => line === "Doors here lead:")
  const availableDirections = []
  if (startOfDoorsList >= 0) {
    for (let i = startOfDoorsList + 1; i < lines.length; i++) {
      const line = lines[i]
      if (line === "") {
        break
      }
      const direction = line.slice(2)
      availableDirections.push(direction)
    }
  }
  const startOfItemList = lines.findIndex(line => line === "Items here:")
  const availableItems = []
  if (startOfItemList >= 0) {
    for (let i = startOfItemList + 1; i < lines.length; i++) {
      const line = lines[i]
      if (line === "") {
        break
      }
      const item = line.slice(2)
      if (!["infinite loop", "giant electromagnet", "photons", "molten lava", "escape pod"].includes(item)) {
        availableItems.push(item)
      }
    }
  }
  return {
    name,
    availableDirections,
    availableItems,
  }
}

function toAscii(text: string) {
  return [...text.split("").map(char => char.charCodeAt(0)), 10]
}

function explore(program: number[]) {
  const computer = new Computer(program, [])
  const computers = new Map<string, Computer>()
  for (const command of [
    "south",
    "south",
    "south",
    "take fixed point",
    "south",
    "take festive hat",
    "west",
    "west",
    "west",
    "take jam",
    "south",
    "take easter egg",
    "north",
    "east",
    "east",
    "north",
    "west",
    "take asterisk",
    "east",
    "north",
    "west",
    "north",
    "north",
    "take tambourine",
    "south",
    "south",
    "east",
    "north",
    "west",
    "south",
    "take antenna",
    "north",
    "west",
    "west",
    "take space heater",
    "west",
  ]) {
    computer.inputs.push(...toAscii(command))
  }
  computer.runUntilInputEmpty()

  const items = ["fixed point", "festive hat", "jam", "easter egg", "asterisk", "tambourine", "antenna", "space heater"]
  for (let i = 0; i < 2 ** items.length; i++) {
    const computerForCombination = computer.clone()
    computerForCombination.outputs.length = 0
    const itemsToDrop = []
    for (let j = 0; j < items.length; j++) {
      if ((i >> j) & 1) {
        itemsToDrop.push(items[j])
      }
    }
    for (const item of itemsToDrop) {
      computerForCombination.inputs.push(...toAscii(`drop ${item}`))
    }
    computerForCombination.inputs.push(...toAscii(`west`))
    computerForCombination.runUntilInputEmpty()
    const outputText = computerForCombination.outputs.map(code => String.fromCharCode(code)).join("")
    if (outputText.includes("back to the checkpoint")) {
      continue
    }
    if (outputText.includes("on the keypad")) {
      return outputText.match(/typing (\d+) on the keypad/)![1]
    }
    throw new Error()
  }
}

function part1(inputString: string) {
  const program = parseInput(inputString)
  return explore(program)
}

function part2(inputString: string) {
  return "Merry Christmas!"
}

const EXAMPLE = ``

export default {
  part1: {
    run: part1,
    tests: [],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
