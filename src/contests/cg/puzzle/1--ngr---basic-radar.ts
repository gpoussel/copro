// 🎮 CodinGame Puzzle - 1--ngr---basic-radar
// https://www.codingame.com/training/easy/1--ngr---basic-radar

const N = parseInt(readline())

const readings: Map<string, Map<string, number>> = new Map()

for (let i = 0; i < N; i++) {
  const [plate, radar, timestamp] = readline().split(" ")
  if (!readings.has(plate)) {
    readings.set(plate, new Map())
  }
  readings.get(plate)!.set(radar, parseInt(timestamp))
}

const DISTANCE_KM = 13
const SPEED_LIMIT = 130

const tickets: Array<[string, number]> = []

for (const [plate, radars] of readings) {
  const t42 = radars.get("A21-42")
  const t55 = radars.get("A21-55")

  if (t42 === undefined || t55 === undefined) {
    continue
  }

  // Time in milliseconds, convert to hours
  const elapsedMs = Math.abs(t55 - t42)
  const elapsedHours = elapsedMs / 1000 / 3600
  const speed = Math.trunc(DISTANCE_KM / elapsedHours)

  if (speed > SPEED_LIMIT) {
    tickets.push([plate, speed])
  }
}

tickets.sort((a, b) => a[0].localeCompare(b[0]))

for (const [plate, speed] of tickets) {
  console.log(`${plate} ${speed}`)
}
