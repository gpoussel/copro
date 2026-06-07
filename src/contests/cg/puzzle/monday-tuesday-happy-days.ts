// 🎮 CodinGame Puzzle - monday-tuesday-happy-days
// https://www.codingame.com/training/easy/monday-tuesday-happy-days

const leapYear = parseInt(readline())
const line2 = readline().split(" ")
const sourceDayOfWeek = line2[0]
const sourceMonth = line2[1]
const sourceDayOfMonth = parseInt(line2[2])
const line3 = readline().split(" ")
const targetMonth = line3[0]
const targetDayOfMonth = parseInt(line3[1])

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const MONTH_DAYS = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function dayOfYear(month: string, day: number): number {
  const monthIndex = MONTHS.indexOf(month)
  let total = 0
  for (let i = 0; i < monthIndex; i++) {
    total += MONTH_DAYS[i]
  }
  total += day
  return total
}

const sourceIndex = DAYS.indexOf(sourceDayOfWeek)
const sourceDoy = dayOfYear(sourceMonth, sourceDayOfMonth)
const targetDoy = dayOfYear(targetMonth, targetDayOfMonth)

const diff = targetDoy - sourceDoy
const targetIndex = (((sourceIndex + diff) % 7) + 7) % 7

console.log(DAYS[targetIndex])
