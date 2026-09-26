// 🎮 CodinGame Puzzle - monthly-system
// https://www.codingame.com/training/medium/monthly-system

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const n = parseInt(readline())
let sum = 0
for (let i = 0; i < n; i++) {
  const m = readline().trim()
  let value = 0
  for (let j = 0; j < m.length; j += 3) value = value * 12 + MONTHS.indexOf(m.substr(j, 3))
  sum += value
}

let out = ""
do {
  out = MONTHS[sum % 12] + out
  sum = Math.floor(sum / 12)
} while (sum > 0)
console.log(out)
