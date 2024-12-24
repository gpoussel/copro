import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2018 - Day 4

function parseInput(input: string) {
  const lines = utils.input
    .lines(input)
    .sort()
    .map(line => {
      const dateAndTime = line.slice(1, 17)
      const [date, time] = dateAndTime.split(" ")
      let [year, month, day] = date.split("-").map(Number)
      let [hour, minute] = time.split(":").map(Number)
      if (hour === 23) {
        hour = 0
        minute = 0
        day += 1
      }
      if (day === 32 || (day === 31 && [4, 6, 9, 11].includes(month))) {
        day = 1
        month += 1
      }
      if (month === 13) {
        month = 1
        year += 1
      }
      const text = line.slice(19)
      return { year, month, day, hour, minute, text }
    })
  const linesByDay = utils.iterate.mapBy(lines, r => `${r.year}-${r.month}-${r.day}`)
  const guards = new Map<number, Map<string, number[]>>()
  for (const [, linesOfDay] of linesByDay) {
    const guardId = Number(linesOfDay[0].text.match(/Guard #(\d+)/)![1])
    if (!guards.has(guardId)) {
      guards.set(guardId, new Map())
    }
    const guard = guards.get(guardId)!
    const asleepMinutes = []
    const beginShiftMinute = linesOfDay[0].minute
    if (beginShiftMinute > 0) {
      for (let i = 0; i < beginShiftMinute; i++) {
        asleepMinutes.push(i)
      }
    }
    for (let i = 1; i < linesOfDay.length; i += 2) {
      const asleep = linesOfDay[i].minute
      const awake = linesOfDay[i + 1].minute
      for (let j = asleep; j < awake; j++) {
        asleepMinutes.push(j)
      }
    }
    guard.set(`${linesOfDay[0].year}-${linesOfDay[0].month}-${linesOfDay[0].day}`, asleepMinutes)
  }
  return guards
}

function part1(inputString: string) {
  const guards = parseInput(inputString)
  const guardAndAsleepDuration = [...guards.entries()].map(([guardId, days]) => {
    const totalAsleepminutes = [...days.values()].map(asleepMinutes => asleepMinutes.length).reduce((a, b) => a + b, 0)
    return { guardId, totalAsleepminutes }
  })
  const { guardId } = utils.iterate.maxBy(guardAndAsleepDuration, r => r.totalAsleepminutes)!
  const allMinutesAsleep = [...guards.get(guardId)!.values()].flat()
  const mostAsleepMinute = utils.iterate.maxBy(allMinutesAsleep, r => utils.iterate.count(allMinutesAsleep, r))!
  return mostAsleepMinute * guardId
}

function part2(inputString: string) {
  const guards = parseInput(inputString)
  const mostAsleepMinutes = [...guards.entries()].map(([guardId, days]) => {
    const allMinutesAsleep = [...days.values()].flat()
    const mostAsleepMinute = utils.iterate.maxBy(allMinutesAsleep, r => utils.iterate.count(allMinutesAsleep, r))!
    return { guardId, mostAsleepMinute, count: utils.iterate.count(allMinutesAsleep, mostAsleepMinute) }
  })
  const { guardId, mostAsleepMinute } = utils.iterate.maxBy(mostAsleepMinutes, r => r.count)!
  return mostAsleepMinute * guardId
}

const EXAMPLE = `
[1518-11-01 00:00] Guard #10 begins shift
[1518-11-01 00:05] falls asleep
[1518-11-01 00:25] wakes up
[1518-11-01 00:30] falls asleep
[1518-11-01 00:55] wakes up
[1518-11-01 23:58] Guard #99 begins shift
[1518-11-02 00:40] falls asleep
[1518-11-02 00:50] wakes up
[1518-11-03 00:05] Guard #10 begins shift
[1518-11-03 00:24] falls asleep
[1518-11-03 00:29] wakes up
[1518-11-04 00:02] Guard #99 begins shift
[1518-11-04 00:36] falls asleep
[1518-11-04 00:46] wakes up
[1518-11-05 00:03] Guard #99 begins shift
[1518-11-05 00:45] falls asleep
[1518-11-05 00:55] wakes up`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 240,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 4455,
      },
    ],
  },
} as AdventOfCodeContest
