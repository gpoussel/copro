// 🎮 CodinGame Puzzle - numeral-system
// https://www.codingame.com/training/medium/numeral-system

const [addX, rest] = readline().trim().split("+")
const [addY, sumZ] = rest.split("=")
const toDigits = (s: string): number[] => s.split("").reverse().map(ch => parseInt(ch, 36))
const dx = toDigits(addX)
const dy = toDigits(addY)
const dz = toDigits(sumZ)
const maxDigit = Math.max(...dx, ...dy, ...dz)

// Column-wise addition with carry: exact, no big numbers needed
function holdsInBase(base: number): boolean {
  let carry = 0
  const len = Math.max(dx.length, dy.length, dz.length)
  for (let i = 0; i < len; i++) {
    const s = (dx[i] || 0) + (dy[i] || 0) + carry
    if (s % base !== (dz[i] || 0)) return false
    carry = Math.floor(s / base)
  }
  return carry === 0
}

let answerBase = Math.max(2, maxDigit + 1)
while (answerBase <= 36 && !holdsInBase(answerBase)) answerBase++
console.log(answerBase)
