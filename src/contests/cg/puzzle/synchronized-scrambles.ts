// 🎮 CodinGame Puzzle - synchronized-scrambles
// https://www.codingame.com/training/easy/synchronized-scrambles

const [offset1, offset2]: string[] = readline().split(" ")

const parseOffset = (s: string): number => {
  const sign = s[0] === "-" ? -1 : 1
  const hh = parseInt(s.slice(1, 3), 10)
  const mm = parseInt(s.slice(3, 5), 10)
  return sign * (hh * 60 + mm)
}

const o1: number = parseOffset(offset1)
const o2: number = parseOffset(offset2)

const fmt = (utcMinute: number, offset: number): string => {
  const t = (((utcMinute + offset) % 1440) + 1440) % 1440
  const hh = Math.floor(t / 60)
  const mm = t % 60
  return String(hh).padStart(2, "0") + String(mm).padStart(2, "0")
}

const sortDigits = (s: string): string => s.split("").sort().join("")

const lines: string[] = []
const seen: Set<string> = new Set<string>()

for (let m = 0; m < 1440; m++) {
  const a = fmt(m, o1)
  const b = fmt(m, o2)
  if (sortDigits(a) === sortDigits(b)) {
    const line = `${a}, ${b}`
    if (!seen.has(line)) {
      seen.add(line)
      lines.push(line)
    }
  }
}

lines.sort()
console.log(lines.join("\n"))
