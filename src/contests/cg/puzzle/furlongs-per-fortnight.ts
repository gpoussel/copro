// 🎮 CodinGame Puzzle - furlongs-per-fortnight
// https://www.codingame.com/training/easy/furlongs-per-fortnight

const line: string = readline()
const [in1, dist1, , time1, , , dist2, , time2] = line.split(" ")
const inputSpeed: number = parseInt(in1, 10)

// distance unit -> inches (plural forms)
const inches: { [unit: string]: number } = {
  inches: 1,
  feet: 12,
  yards: 36,
  chains: 792,
  furlongs: 7920,
  miles: 63360,
}

// time unit -> seconds (singular forms)
const seconds: { [unit: string]: number } = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400,
  week: 604800,
  fortnight: 1209600,
}

const inchesPerSec: number = (inputSpeed * inches[dist1]) / seconds[time1]
const converted: number = (inchesPerSec * seconds[time2]) / inches[dist2]
const rounded: number = Math.round(converted * 10) / 10

console.log(`${rounded.toFixed(1)} ${dist2} per ${time2}`)
