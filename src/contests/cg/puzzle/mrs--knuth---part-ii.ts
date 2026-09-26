// 🎮 CodinGame Puzzle - mrs--knuth---part-ii
// https://www.codingame.com/training/medium/mrs--knuth---part-ii

const DAYS = ["M", "Tu", "W", "Th", "F"]
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const HOURS = ["8", "9", "10", "11", "1", "2", "3", "4"]
const LOUD = ["Trumpet", "Drums", "Trombone"]

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

interface Student {
  name: string
  instrument: string
  loud: boolean
  slots: number[]
}

const teacherSlots = parseAvailability(readline().trim().split(/\s+/))
const nStudents = parseInt(readline())
const students: Student[] = []
for (let i = 0; i < nStudents; i++) {
  const [name, instrument, ...rest] = readline().trim().split(/\s+/)
  const slots = parseAvailability(rest).filter(s => teacherSlots.indexOf(s) >= 0)
  students.push({ name, instrument, loud: LOUD.indexOf(instrument) >= 0, slots })
}
const nPairs = parseInt(readline())
const troublesome: { [key: string]: boolean } = {}
for (let i = 0; i < nPairs; i++) {
  const [a, b] = readline().trim().split(/\s+/)
  troublesome[`${a}|${b}`] = true
  troublesome[`${b}|${a}`] = true
}

const slotOwner: number[] = new Array(40).fill(-1)
const assigned: boolean[] = new Array(nStudents).fill(false)
const instrumentDay: { [key: string]: boolean } = {}

// Slots directly before/after (lunch breaks adjacency between 11 and 1)
function neighbours(slot: number): number[] {
  const h = slot % 8
  const res: number[] = []
  if (h !== 0 && h !== 4) res.push(slot - 1)
  if (h !== 3 && h !== 7) res.push(slot + 1)
  return res
}

function canPlace(i: number, slot: number): boolean {
  const s = students[i]
  if (slotOwner[slot] >= 0 || instrumentDay[`${s.instrument}@${Math.floor(slot / 8)}`]) return false
  for (const nb of neighbours(slot)) {
    const o = slotOwner[nb]
    if (o < 0) continue
    if (s.loud && students[o].loud) return false
    if (troublesome[`${s.name}|${students[o].name}`]) return false
  }
  return true
}

function solve(): boolean {
  // Choose the unassigned student with the fewest options
  let best = -1
  let bestOptions: number[] = []
  for (let i = 0; i < nStudents; i++) {
    if (assigned[i]) continue
    const options = students[i].slots.filter(slot => canPlace(i, slot))
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
  return " ".repeat(left) + text + " ".repeat(14 - text.length - left)
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
