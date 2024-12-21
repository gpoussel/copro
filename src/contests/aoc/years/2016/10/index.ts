import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 10

interface ValueLine {
  type: "value"
  value: number
  bot: number
}
interface BotLine {
  type: "bot"
  bot: number
  low: { type: "bot" | "output"; id: number }
  high: { type: "bot" | "output"; id: number }
}

function parseInput(input: string): (ValueLine | BotLine)[] {
  return utils.input.lines(input).map(line => {
    if (line.startsWith("value")) {
      const [value, bot] = line.match(/\d+/g)!.map(Number)
      return { type: "value", value, bot }
    }
    if (line.startsWith("bot")) {
      const [_, bot, lowType, lowId, highType, highId] = line.match(
        /^bot (\d+) gives low to (bot|output) (\d+) and high to (bot|output) (\d+)/
      )!
      return {
        type: "bot",
        bot: +bot,
        low: {
          type: lowType as "bot" | "output",
          id: +lowId,
        },
        high: {
          type: highType as "bot" | "output",
          id: +highId,
        },
      }
    }
    throw new Error()
  })
}

function execute(inputString: string, numbers: [number, number]): number
function execute(inputString: string): number[]
function execute(inputString: string, numbers?: [number, number]): number | number[] {
  const input = parseInput(inputString)
  const bots = new Map<number, number[]>()
  const outputs = new Map<number, number>()

  function addToBot(botId: number, value: number) {
    if (!bots.has(botId)) {
      bots.set(botId, [])
    }
    bots.get(botId)!.push(value)
  }
  for (const valueLine of input.filter(line => line.type === "value")) {
    const { value, bot } = valueLine
    addToBot(bot, value)
  }

  while (true) {
    const entryToProcess = [...bots.entries()].find(bot => {
      const values = bot[1]
      return values.length === 2
    })
    if (!entryToProcess) {
      break
    }
    const [botToProcess, botValues] = entryToProcess
    const [low, high] = botValues.sort((a, b) => a - b)
    if (numbers && low === numbers[0] && high === numbers[1]) {
      return botToProcess
    }
    const bot = input.find(line => line.type === "bot" && line.bot === botToProcess)! as BotLine
    if (bot.low.type === "bot") {
      addToBot(bot.low.id, low)
    } else {
      outputs.set(bot.low.id, low)
    }
    if (bot.high.type === "bot") {
      addToBot(bot.high.id, high)
    } else {
      outputs.set(bot.high.id, high)
    }
    bots.delete(botToProcess)
  }

  return [outputs.get(0)!, outputs.get(1)!, outputs.get(2)!]
}

function part1(inputString: string) {
  return execute(inputString, [17, 61])
}

function part2(inputString: string) {
  return execute(inputString).reduce((a, b) => a * b, 1)
}

const EXAMPLE = `
value 5 goes to bot 2
bot 2 gives low to bot 1 and high to bot 0
value 17 goes to bot 1
bot 1 gives low to output 1 and high to bot 0
bot 0 gives low to output 2 and high to output 0
value 61 goes to bot 2`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 0,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 5185,
      },
    ],
  },
} as AdventOfCodeContest
