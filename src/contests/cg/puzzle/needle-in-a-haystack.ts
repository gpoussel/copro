// 🎮 CodinGame Puzzle - needle-in-a-haystack
// https://www.codingame.com/training/medium/needle-in-a-haystack

const [, h] = readline().split(" ").map(Number)
let hay = ""
for (let i = 0; i < h; i++) hay += readline()
const n = parseInt(readline())

function parseWanted(spec: string): string[] {
  const wanted: string[] = []
  for (const token of spec.split(",")) {
    const from = token.charCodeAt(0)
    const to = token.length === 3 ? token.charCodeAt(2) : from
    for (let c = from; c <= to; c++) {
      const ch = String.fromCharCode(c)
      if (wanted.indexOf(ch) < 0) wanted.push(ch)
    }
  }
  return wanted
}

// Classic minimum window: extend right, shrink left while all wanted elements are present
function shortestWindow(wanted: string[]): [number, number] {
  const count: { [ch: string]: number } = {}
  for (const ch of wanted) count[ch] = 0
  let missing = wanted.length
  let best: [number, number] = [0, hay.length]
  let left = 0
  for (let right = 0; right < hay.length; right++) {
    const ch = hay[right]
    if (ch in count && count[ch]++ === 0) missing--
    while (missing === 0) {
      if (right - left < best[1] - best[0]) best = [left, right]
      const out = hay[left++]
      if (out in count && --count[out] === 0) missing++
    }
  }
  return best
}

for (let i = 0; i < n; i++) console.log(shortestWindow(parseWanted(readline().trim())).join(" "))
