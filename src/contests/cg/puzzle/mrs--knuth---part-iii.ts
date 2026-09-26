// 🎮 CodinGame Puzzle - mrs--knuth---part-iii
// https://www.codingame.com/training/hard/mrs--knuth---part-iii

// Exhaustive search over all valid schedules (each lesson of a student gets
// a slot later than its previous lesson, to skip permutations), keeping the
// best-scoring one. Hard constraints are checked while placing lessons; the
// score is evaluated on complete schedules.

const DAYS = ["M", "Tu", "W", "Th", "F"]
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const HOURS = ["8", "9", "10", "11", "1", "2", "3", "4"]
const LOUD = ["Trumpet", "Drums", "Trombone"]
const MORNING_POINTS = [15, 12, 9, 6, 3]
const AFTERNOON_POINTS = [10, 8, 6, 4, 2]

// Parses an availability string into slot ids (day * 8 + hourIndex)
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
  hours: number
  slots: number[]
}

const teacherSlots = new Set(parseAvailability(readline().trim().split(/\s+/)))
const nStudents = parseInt(readline())
const students: Student[] = []
for (let i = 0; i < nStudents; i++) {
  const [name, instrument, hours, ...rest] = readline().trim().split(/\s+/)
  const slots = parseAvailability(rest)
    .filter(s => teacherSlots.has(s))
    .sort((a, b) => a - b)
  students.push({ name, instrument, loud: LOUD.includes(instrument), hours: parseInt(hours), slots })
}
const nPairs = parseInt(readline())
const troublesome = new Set<string>()
for (let i = 0; i < nPairs; i++) {
  const [a, b] = readline().trim().split(/\s+/)
  troublesome.add(`${a}|${b}`)
  troublesome.add(`${b}|${a}`)
}

const slotOwner: number[] = new Array(40).fill(-1)
const instrumentDay = new Set<string>()

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
  if (slotOwner[slot] >= 0 || instrumentDay.has(`${s.instrument}@${Math.floor(slot / 8)}`)) return false
  for (const nb of neighbours(slot)) {
    const o = slotOwner[nb]
    if (o < 0) continue
    if (s.loud && students[o].loud) return false
    if (troublesome.has(`${s.name}|${students[o].name}`)) return false
  }
  return true
}

// Per-day scores of the four categories for the current schedule
function scoreDetails(): number[][] {
  const free: number[] = []
  const loud: number[] = []
  const sched: number[] = []
  const alpha: number[] = []
  for (let d = 0; d < 5; d++) {
    // 9 hours including lunch (index 4 in this list), lunch always free
    const busy: boolean[] = []
    for (let h = 0; h < 8; h++) {
      if (h === 4) busy.push(false)
      busy.push(slotOwner[d * 8 + h] >= 0)
    }
    let freeScore = 0
    let run = 0
    for (const b of [...busy, true]) {
      if (!b) run++
      else {
        if (run === 1) freeScore += 2
        else if (run > 1) freeScore += 2 ** run
        run = 0
      }
    }
    free.push(freeScore)
    let loudScore = 0
    let schedScore = 0
    let alphaScore = 0
    let prev = ""
    for (let h = 0; h < 8; h++) {
      const o = slotOwner[d * 8 + h]
      if (o < 0) continue
      const s = students[o]
      if (s.loud && h < 4) loudScore += 50
      schedScore += h < 4 ? MORNING_POINTS[d] : AFTERNOON_POINTS[d]
      if (prev && prev < s.name) alphaScore += 15
      prev = s.name
    }
    loud.push(loudScore)
    sched.push(schedScore)
    alpha.push(alphaScore)
  }
  return [free, loud, sched, alpha]
}

// Lessons to place, most constrained students first
const lessons: number[] = []
students
  .map((_, i) => i)
  .sort((a, b) => students[a].slots.length - students[b].slots.length)
  .forEach(i => {
    for (let k = 0; k < students[i].hours; k++) lessons.push(i)
  })

let bestScore = -1
let bestOwner: number[] = []
const lastIndex: number[] = new Array(nStudents).fill(-1)

function search(k: number): void {
  if (k === lessons.length) {
    const total = scoreDetails().reduce((acc, row) => acc + row.reduce((a, b) => a + b, 0), 0)
    if (total > bestScore) {
      bestScore = total
      bestOwner = [...slotOwner]
    }
    return
  }
  const i = lessons[k]
  const s = students[i]
  const saved = lastIndex[i]
  // Lessons of this student still to place (this one included)
  let left = 0
  for (let m = k; m < lessons.length; m++) if (lessons[m] === i) left++
  for (let j = saved + 1; j + left <= s.slots.length; j++) {
    const slot = s.slots[j]
    if (!canPlace(i, slot)) continue
    const key = `${s.instrument}@${Math.floor(slot / 8)}`
    slotOwner[slot] = i
    instrumentDay.add(key)
    lastIndex[i] = j
    search(k + 1)
    lastIndex[i] = saved
    slotOwner[slot] = -1
    instrumentDay.delete(key)
  }
}

search(0)
bestOwner.forEach((o, i) => (slotOwner[i] = o))

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
lines.push("")
for (const row of scoreDetails()) lines.push(`${row.join("+")}=${row.reduce((a, b) => a + b, 0)}`)
lines.push(String(bestScore))
console.log(lines.map(l => l.replace(/\s+$/, "")).join("\n"))
