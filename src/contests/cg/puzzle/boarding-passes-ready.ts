// 🎮 CodinGame Puzzle - boarding-passes-ready
// https://www.codingame.com/training/medium/boarding-passes-ready

const bpRows = parseInt(readline())
const bpWidth = parseInt(readline())
const bpCount = parseInt(readline())

// seats[row][col] = passenger name, or null for an unsold/boarded seat
const seats: (string | null)[][] = []
for (let r = 0; r <= bpRows; r++) seats.push(new Array(bpWidth).fill(null))
for (let i = 0; i < bpCount; i++) {
  const line = readline()
  const comma = line.lastIndexOf(",")
  const passengerName = line.substring(0, comma)
  const seat = line.substring(comma + 1).trim()
  const row = parseInt(seat.substring(0, seat.length - 1))
  const col = seat.charCodeAt(seat.length - 1) - 65
  seats[row][col] = passengerName
}

const half = bpWidth / 2
let remaining = bpCount
let leftSide = true
while (remaining > 0) {
  const group: string[] = []
  for (let r = bpRows; r >= 1; r--) {
    const cols: number[] = []
    if (leftSide) for (let c = 0; c < half; c++) cols.push(c)
    else for (let c = bpWidth - 1; c >= half; c--) cols.push(c)
    for (const c of cols) {
      const passenger = seats[r][c]
      if (passenger !== null) {
        group.push(passenger)
        seats[r][c] = null
        break
      }
    }
  }
  if (group.length > 0) console.log("Now boarding: " + group.join(","))
  remaining -= group.length
  leftSide = !leftSide
}
