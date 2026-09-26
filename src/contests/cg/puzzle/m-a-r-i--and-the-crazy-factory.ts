// 🎮 CodinGame Puzzle - m-a-r-i--and-the-crazy-factory
// https://www.codingame.com/training/hard/m-a-r-i--and-the-crazy-factory

// Depth-first search over the moves: pick an unused instruction, insert it
// anywhere in the current set (nop must stay last), then replay the whole set
// from the robot's current state (position, direction, gears, key, door,
// zl/zr toggles persist between sets). A move is valid only if the replay
// never bumps into anything; the search stops when a set ends on the exit
// with the key grabbed (when there is one).
const W = 5
const H = 7
const insLine = readline()
const tokens = insLine.split(" ")
const initialSet: string[] = tokens[0] === "" ? [] : [tokens[0]]
const pool = tokens.slice(1).filter(t => t !== "")
const rows: string[] = []
for (let i = 0; i < H; i++) rows.push(readline())

const DR = [-1, 0, 1, 0]
const DC = [0, 1, 0, -1]

interface State {
  grid: string[] // flattened cells: "#", ".", "E", "G", "k", "d", "r"
  pos: number
  dir: number
  hasKey: boolean
  // current form of each set instruction (zl/zr toggle when executed)
  forms: string[]
}

const cells: string[] = []
let startPos = 0
let startDir = 0
for (let r = 0; r < H; r++)
  for (let c = 0; c < W; c++) {
    const ch = rows[r][c] ?? "#"
    if (ch >= "0" && ch <= "3") {
      startPos = r * W + c
      startDir = Number(ch)
      cells.push(".")
    } else cells.push(ch)
  }
const hasKeyTile = cells.includes("k")
const exitPos = cells.indexOf("E")

// Replays the set on a copy of the state; returns the new state or null
const runSet = (st: State): State | null => {
  const s: State = { grid: [...st.grid], pos: st.pos, dir: st.dir, hasKey: st.hasKey, forms: [...st.forms] }
  let broken = false

  const step = (): boolean => {
    const r = Math.floor(s.pos / W) + DR[s.dir]
    const c = (s.pos % W) + DC[s.dir]
    if (r < 0 || r >= H || c < 0 || c >= W) return false
    const np = r * W + c
    const ch = s.grid[np]
    if (ch === "#" || ch === "d") return false
    if (ch === "G") {
      const r2 = r + DR[s.dir]
      const c2 = c + DC[s.dir]
      if (r2 < 0 || r2 >= H || c2 < 0 || c2 >= W || s.grid[r2 * W + c2] !== ".") return false
      s.grid[r2 * W + c2] = "G"
      s.grid[np] = "."
    }
    s.pos = np
    return true
  }
  const slideDoor = (): boolean => {
    if (!s.hasKey) return false
    const rail = s.grid.indexOf("r")
    const doors: number[] = []
    s.grid.forEach((ch, i) => ch === "d" && doors.push(i))
    if (rail < 0 || doors.length !== 2) return false
    if (s.pos === rail) return false // the door would crush M.A.R.I.
    const dist = (a: number, b: number) => Math.abs(Math.floor(a / W) - Math.floor(b / W)) + Math.abs((a % W) - (b % W))
    const far = dist(doors[0], rail) > dist(doors[1], rail) ? doors[0] : doors[1]
    s.grid[far] = "r"
    s.grid[rail] = "d"
    return true
  }
  const grab = () => {
    if (s.grid[s.pos] === "k") {
      s.grid[s.pos] = "."
      s.hasKey = true
    }
  }

  // Executes instruction i; returns the index of the next one, or -1 on failure
  const exec = (i: number): number => {
    const ins = s.forms[i]
    let ok = true
    switch (ins) {
      case "p1":
        ok = step()
        break
      case "p2":
        ok = step() && step()
        break
      case "tl":
        s.dir = (s.dir + 3) % 4
        break
      case "tr":
        s.dir = (s.dir + 1) % 4
        break
      case "zl":
        s.dir = (s.dir + 3) % 4
        s.forms[i] = "zr"
        break
      case "zr":
        s.dir = (s.dir + 1) % 4
        s.forms[i] = "zl"
        break
      case "bk":
        broken = true
        break
      case "uk":
        ok = slideDoor()
        break
      case "x2": {
        if (i + 1 >= s.forms.length) return -1 // nothing to repeat
        const a = exec(i + 1)
        if (a < 0) return -1
        if (broken) return a
        const b = exec(i + 1)
        return b < 0 ? -1 : Math.max(a, b)
      }
    }
    if (!ok) return -1
    grab()
    return i + 1
  }

  for (let i = 0; i < s.forms.length && !broken; ) {
    i = exec(i)
    if (i < 0) return null
  }
  return s
}

const names: string[] = [...initialSet]
const output: string[] = []

const search = (st: State, used: boolean[]): boolean => {
  const tried = new Set<string>()
  for (let k = 0; k < pool.length; k++) {
    if (used[k]) continue
    const ins = pool[k]
    const hasNop = names.length > 0 && names[names.length - 1] === "nop"
    for (let at = 0; at <= names.length; at++) {
      if (ins === "nop" && at !== names.length) continue
      if (hasNop && at === names.length) continue
      const newNames = [...names.slice(0, at), ins, ...names.slice(at)]
      const newForms = [...st.forms.slice(0, at), ins, ...st.forms.slice(at)]
      const key = newNames.join(" ") + "|" + newForms.join(" ")
      if (tried.has(key)) continue
      tried.add(key)
      const res = runSet({ ...st, forms: newForms })
      if (!res) continue
      names.splice(at, 0, ins)
      output.push(newNames.join(" "))
      if (res.pos === exitPos && (!hasKeyTile || res.hasKey)) return true
      used[k] = true
      if (search(res, used)) return true
      used[k] = false
      output.pop()
      names.splice(at, 1)
    }
  }
  return false
}

search(
  { grid: cells, pos: startPos, dir: startDir, hasKey: false, forms: [...initialSet] },
  pool.map(() => false)
)
console.log(output.join("\n"))
