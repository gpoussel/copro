// 🎮 CodinGame Puzzle - detective-geek
// https://www.codingame.com/training/easy/detective-geek

const months: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
}

const timeLine = readline()
const addressLine = readline()

// Decode time: # = 1, * = 0 → binary → decimal → hh:mm
const binaryStr = timeLine
  .split("")
  .map(c => (c === "#" ? "1" : "0"))
  .join("")
const timeNum = parseInt(binaryStr, 2)
const hours = Math.floor(timeNum / 100)
const minutes = timeNum % 100
const hh = String(hours).padStart(2, "0")
const mm = String(minutes).padStart(2, "0")
console.log(`${hh}:${mm}`)

// Decode address: each word is 6 chars = two 3-char month abbreviations
// The two months form a base-12 number → decimal → ASCII character
const words = addressLine.split(" ")
const decoded = words
  .map(word => {
    const m1 = word.slice(0, 3)
    const m2 = word.slice(3, 6)
    const digit1 = months[m1]
    const digit2 = months[m2]
    const decimal = digit1 * 12 + digit2
    return String.fromCharCode(decimal)
  })
  .join("")
console.log(decoded)
