// 🎮 CodinGame Puzzle - tricky-number-verifier
// https://www.codingame.com/training/easy/tricky-number-verifier

const N: number = parseInt(readline())
const out: string[] = []

const isLeap = (y: number): boolean => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0

const validDate = (dd: number, mm: number, yy: number): boolean => {
  const year = 2000 + yy
  if (mm < 1 || mm > 12) return false
  if (dd < 1) return false
  const days = [31, isLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return dd <= days[mm - 1]
}

const idFactors = [3, 7, 9]
const bdFactors = [5, 8, 4, 2, 1, 6]

const checkDigit = (lll: number, bd: string): number => {
  const ls = lll.toString().padStart(3, "0")
  let sum = 0
  for (let i = 0; i < 3; i++) sum += parseInt(ls[i]) * idFactors[i]
  for (let i = 0; i < 6; i++) sum += parseInt(bd[i]) * bdFactors[i]
  return sum % 11
}

for (let k = 0; k < N; k++) {
  const line = readline()
  if (line.length !== 10 || !/^[0-9]{10}$/.test(line) || line[0] === "0") {
    out.push("INVALID SYNTAX")
    continue
  }
  const lll = parseInt(line.slice(0, 3))
  const bd = line.slice(4)
  const dd = parseInt(bd.slice(0, 2))
  const mm = parseInt(bd.slice(2, 4))
  const yy = parseInt(bd.slice(4, 6))
  if (!validDate(dd, mm, yy)) {
    out.push("INVALID DATE")
    continue
  }
  let curLll = lll
  let cd = checkDigit(curLll, bd)
  while (cd === 10) {
    curLll++
    cd = checkDigit(curLll, bd)
  }
  const corrected = curLll.toString().padStart(3, "0") + cd.toString() + bd
  out.push(corrected === line ? "OK" : corrected)
}
console.log(out.join("\n"))
