// 🎮 CodinGame Puzzle - mrs--knuth---part-i
// https://www.codingame.com/training/medium/mrs--knuth---part-i

const DAYS = ["M", "Tu", "W", "Th", "F"]
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const HOURS = ["8", "9", "10", "11", "1", "2", "3", "4"]

// Parses an availability string into a list of slot ids (day * 8 + hourIndex)
function parseAvailability(tokens: string[]): number[] {
  const slots: number[] = []
  let day = -1
  for (const t of tokens) {
    const d = DAYS.indexOf(t)
    if (d >= 0) day = d
    else slots.push(day * 8 + HOURS.indexOf(t))
  }
  return slots
}

const teacherSlots = parseAvailability(readline().trim().split(/\s+/))
const n = parseInt(readline())
const students: { name: string; instrument: string; slots: number[] }[] = []
for (let i = 0; i < n; i++) {
  const [name, instrument, ...rest] = readline().trim().split(/\s+/)
  const slots = parseAvailability(rest).filter(s => teacherSlots.indexOf(s) >= 0)
  students.push({ name, instrument, slots })
}

const slotOwner: number[] = new Array(40).fill(-1)
const assigned: boolean[] = new Array(n).fill(false)
const instrumentDay: { [key: string]: boolean } = {}

function candidates(i: number): number[] {
  const s = students[i]
  return s.slots.filter(slot => slotOwner[slot] < 0 && !instrumentDay[`${s.instrument}@${Math.floor(slot / 8)}`])
}

function solve(): boolean {
  // Choose the unassigned student with the fewest options
  let best = -1
  let bestOptions: number[] = []
  for (let i = 0; i < n; i++) {
    if (assigned[i]) continue
    const options = candidates(i)
    if (best < 0 || options.length < bestOptions.length) {
      best = i
      bestOptions = options
      if (options.length === 0) return false
    }
  }
  if (best < 0) return true
  const key = (slot: number) => `${students[best].instrument}@${Math.floor(slot / 8)}`
  assigned[best] = true
  for (const slot of bestOptions) {
    slotOwner[slot] = best
    instrumentDay[key(slot)] = true
    if (solve()) return true
    slotOwner[slot] = -1
    instrumentDay[key(slot)] = false
  }
  assigned[best] = false
  return false
}

solve()

function center(text: string): string {
  const left = Math.floor((14 - text.length) / 2)
  const right = 14 - text.length - left
  return " ".repeat(left) + text + " ".repeat(right)
}

const lines: string[] = []
lines.push(["  ", ...DAY_NAMES.map(center)].join(" "))
for (let h = 0; h < 8; h++) {
  if (h === 4) lines.push(["  ", ...DAYS.map(() => center("LUNCH"))].join(" "))
  const label = HOURS[h].length === 1 ? " " + HOURS[h] : HOURS[h]
  const cells = DAYS.map((_, d) => {
    const owner = slotOwner[d * 8 + h]
    return owner < 0 ? "-".repeat(14) : center(`${students[owner].name}/${students[owner].instrument}`)
  })
  lines.push([label, ...cells].join(" "))
}
console.log(lines.map(l => l.replace(/\s+$/, "")).join("\n"))
