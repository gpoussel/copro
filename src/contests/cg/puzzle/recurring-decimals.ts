// 🎮 CodinGame Puzzle - recurring-decimals
// https://www.codingame.com/training/hard/recurring-decimals

const n: number = parseInt(readline().trim(), 10)

const digits: number[] = []
const seen = new Map<number, number>() // remainder -> index in digits
let rem = 1 % n
let repeatStart = -1

while (rem !== 0) {
  if (seen.has(rem)) {
    repeatStart = seen.get(rem)!
    break
  }
  seen.set(rem, digits.length)
  rem *= 10
  digits.push(Math.floor(rem / n))
  rem = rem % n
}

let frac: string
if (repeatStart === -1) {
  frac = digits.join("")
} else {
  const nonRep = digits.slice(0, repeatStart).join("")
  const rep = digits.slice(repeatStart).join("")
  frac = nonRep + "(" + rep + ")"
}

console.log("0." + frac)
