// 🎮 CodinGame Puzzle - 0xc0ffee-request-validator
// https://www.codingame.com/

readline() // frameLength (unused; frame string is self-describing)
const frame = readline()

let valid = true
let orderSize = 0
if (frame.length < 12 || frame.slice(0, 8) !== "DECAFBAD") {
  valid = false
} else {
  orderSize = parseInt(frame.slice(8, 11), 16)
  if (orderSize <= 0 || frame.length !== 12 + orderSize) valid = false
}
if (valid) {
  let sum = 0
  for (const c of frame) sum += parseInt(c, 16)
  if (sum % 16 !== 0) valid = false
}

if (!valid) {
  console.log("403 Forbidden")
} else {
  const order = frame.slice(11, 11 + orderSize)
  const counts = new Map<string, number>()
  for (const c of order) counts.set(c, (counts.get(c) ?? 0) + 1)
  console.log([...counts].map(([id, cnt]) => `${cnt} ${id}`).join("\n"))
}
