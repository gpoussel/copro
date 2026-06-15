// 🎮 CodinGame Puzzle - tricky-number-verifier
// https://www.codingame.com/training/easy/tricky-number-verifier

const factors: number[] = [3, 7, 9, 5, 8, 4, 2, 1, 6]

function isValidDate(dd: number, mm: number, yy: number): boolean {
  if (mm < 1 || mm > 12) return false
  if (dd < 1) return false
  const year: number = 2000 + yy
  const leap: boolean = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const daysInMonth: number[] = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return dd <= daysInMonth[mm - 1]
}

function checkDigit(lll: number, birthDigits: number[]): number {
  let l: number = lll
  while (true) {
    const digits: number[] = [Math.floor(l / 100) % 10, Math.floor(l / 10) % 10, l % 10, ...birthDigits]
    let sum: number = 0
    for (let i: number = 0; i < 9; i++) sum += digits[i] * factors[i]
    const r: number = sum % 11
    if (r === 10) {
      l += 1
      continue
    }
    return l * 10000000 + r * 1000000 + birthNumber(birthDigits)
  }
}

function birthNumber(birthDigits: number[]): number {
  let n: number = 0
  for (const d of birthDigits) n = n * 10 + d
  return n
}

const n: number = parseInt(readline(), 10)
const out: string[] = []
for (let k: number = 0; k < n; k++) {
  const s: string = readline()
  if (!/^[0-9]{10}$/.test(s) || s[0] === "0") {
    out.push("INVALID SYNTAX")
    continue
  }
  const lll: number = parseInt(s.slice(0, 3), 10)
  const dd: number = parseInt(s.slice(4, 6), 10)
  const mm: number = parseInt(s.slice(6, 8), 10)
  const yy: number = parseInt(s.slice(8, 10), 10)
  if (!isValidDate(dd, mm, yy)) {
    out.push("INVALID DATE")
    continue
  }
  const birthDigits: number[] = s
    .slice(4, 10)
    .split("")
    .map((c: string): number => parseInt(c, 10))
  const corrected: number = checkDigit(lll, birthDigits)
  const correctedStr: string = String(corrected).padStart(10, "0")
  out.push(correctedStr === s ? "OK" : correctedStr)
}
console.log(out.join("\n"))
