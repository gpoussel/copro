// 🎮 CodinGame Puzzle - who-is-leading
// https://www.codingame.com/

const teams: string[] = readline().split(",")
const scores1: string = readline()
const scores2: string = readline()

const POINTS: number[] = [5, 2, 3, 3]

function parseEvents(line: string): Array<[number, number]> {
  const events: Array<[number, number]> = []
  const categories: string[] = line.split(",")
  for (let i = 0; i < categories.length; i++) {
    const part: string = categories[i].trim()
    if (part.length === 0) {
      continue
    }
    const times: string[] = part.split(/\s+/)
    for (let j = 0; j < times.length; j++) {
      events.push([parseInt(times[j], 10), POINTS[i]])
    }
  }
  return events
}

const events1: Array<[number, number]> = parseEvents(scores1)
const events2: Array<[number, number]> = parseEvents(scores2)

function scoreAt(events: Array<[number, number]>, minute: number): number {
  let total: number = 0
  for (let i = 0; i < events.length; i++) {
    if (events[i][0] <= minute) {
      total += events[i][1]
    }
  }
  return total
}

const final1: number = scoreAt(events1, 80)
const final2: number = scoreAt(events2, 80)

let advantage1: number = 0
let advantage2: number = 0
for (let minute = 1; minute <= 80; minute++) {
  const s1: number = scoreAt(events1, minute)
  const s2: number = scoreAt(events2, minute)
  if (s1 > s2) {
    advantage1++
  } else if (s2 > s1) {
    advantage2++
  }
}

console.log(`${teams[0]}: ${final1} ${advantage1}`)
console.log(`${teams[1]}: ${final2} ${advantage2}`)
