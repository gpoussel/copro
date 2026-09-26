// 🎮 CodinGame Puzzle - lets-go-to-the-cinema
// https://www.codingame.com/training/medium/lets-go-to-the-cinema

const [maxRow, maxColumn] = readline().split(" ").map(Number)
const n = parseInt(readline())
const taken: boolean[][] = []
for (let r = 0; r < maxRow; r++) taken.push(new Array(maxColumn).fill(false))

const fits = (row: number, seat: number, size: number): boolean => {
  if (row < 0 || row >= maxRow || seat < 0 || seat + size > maxColumn) return false
  for (let s = seat; s < seat + size; s++) if (taken[row][s]) return false
  return true
}

// Shift sequence 0, -1, +1, -2, +2, ... used both for rows and seats
const shifts = (limit: number): number[] => {
  const out = [0]
  for (let k = 1; k <= limit; k++) out.push(-k, k)
  return out
}
const rowShifts = shifts(maxRow)
const seatShifts = shifts(maxColumn)

const find = (row: number, seat: number, size: number): [number, number] | null => {
  for (const dr of rowShifts) {
    for (const ds of seatShifts) {
      if (fits(row + dr, seat + ds, size)) return [row + dr, seat + ds]
    }
  }
  return null
}

let groupSuccess = 0
let personSuccess = 0
for (let i = 0; i < n; i++) {
  const [numPersons, row, column] = readline().split(" ").map(Number)
  if (fits(row, column, numPersons)) groupSuccess++

  // Seats a (sub)group, splitting it in halves (bigger first) until it fits somewhere
  const place = (size: number): void => {
    const spot = find(row, column, size)
    if (!spot) {
      if (size <= 1) return // cannot happen: a single person always finds a seat
      place(Math.ceil(size / 2))
      place(Math.floor(size / 2))
      return
    }
    const [r, s] = spot
    for (let k = s; k < s + size; k++) {
      taken[r][k] = true
      if (r === row && k >= column && k < column + numPersons) personSuccess++
    }
  }
  place(numPersons)
}
console.log(`${groupSuccess} ${personSuccess}`)
