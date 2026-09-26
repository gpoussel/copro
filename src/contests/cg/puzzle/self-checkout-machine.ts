// 🎮 CodinGame Puzzle - self-checkout-machine
// https://www.codingame.com/training/medium/self-checkout-machine

// Denominations in cents, from highest to lowest
const DENOMINATIONS = [5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1]
const stock: { [cents: number]: number } = {}
const jammed: { [cents: number]: boolean } = {}
for (const d of DENOMINATIONS) stock[d] = 0

const toCents = (value: string) => Math.round(parseFloat(value) * 100)
const format = (cents: number) => (cents >= 100 ? String(cents / 100) : (cents / 100).toFixed(2))

// Parses "1X20+2X10" and adds it to the machine (a "J" in the count marks a jamming slot)
const addCash = (notation: string) => {
  for (const part of notation.split("+")) {
    const [count, value] = part.split("X")
    const cents = toCents(value)
    if (count.indexOf("J") >= 0) jammed[cents] = true
    stock[cents] = (stock[cents] || 0) + parseInt(count)
  }
}

addCash(readline().trim())
const n = parseInt(readline())
const output: string[] = []
for (let i = 0; i < n; i++) {
  const [bill, given] = readline().trim().split(/\s+/)
  addCash(given)
  let due = -toCents(bill)
  for (const part of given.split("+")) {
    const [count, value] = part.split("X")
    due += parseInt(count) * toCents(value)
  }
  if (due === 0) {
    output.push("0")
    continue
  }

  // Greedy: always hand out the highest available denomination first
  const parts: string[] = []
  let error = ""
  for (const d of DENOMINATIONS) {
    const count = Math.min(Math.floor(due / d), stock[d])
    if (count === 0) continue
    if (jammed[d]) {
      error = "ERROR: JAM"
      break
    }
    stock[d] -= count
    due -= count * d
    parts.push(`${count}X${format(d)}`)
  }
  if (!error && due > 0) error = "ERROR: OUT OF MONEY"
  if (error) {
    output.push(error)
    break
  }
  output.push(parts.join("+"))
}
console.log(output.join("\n"))
