// 🎮 CodinGame Puzzle - spy-the-spies
// https://www.codingame.com/training/expert/spy-the-spies

// BFS over the set of suspects still in the list (15 bits). A command on an
// attribute removes every remaining suspect having it; it is legal when that
// group is non-empty and made only of spies (plain attribute) or only of
// innocents ("NOT attribute"). Goal: every spy indicated, or every innocent
// absolved (only spies left). The shortest list is unique.

const spyNames = new Set(readline().trim().split(" "))
const attrIndex = new Map<string, number>()
const attrNames: string[] = []
const attrMask: number[] = []
let spyMask = 0
for (let i = 0; i < 15; i++) {
  const parts = readline().trim().split(" ")
  if (spyNames.has(parts[0])) spyMask |= 1 << i
  const cnt = parseInt(parts[1])
  for (let k = 0; k < cnt; k++) {
    const attr = parts[2 + k]
    let idx = attrIndex.get(attr)
    if (idx === undefined) {
      idx = attrNames.length
      attrIndex.set(attr, idx)
      attrNames.push(attr)
      attrMask.push(0)
    }
    attrMask[idx] |= 1 << i
  }
}

const full = (1 << 15) - 1
const prevState = new Int32Array(1 << 15).fill(-1)
const prevCmd: string[] = new Array<string>(1 << 15).fill("")
prevState[full] = full
const queue: number[] = [full]
let goal = -1
for (let qi = 0; qi < queue.length; qi++) {
  const cur = queue[qi]
  if ((cur & spyMask) === 0 || (cur & ~spyMask) === 0) {
    goal = cur
    break
  }
  for (let a = 0; a < attrNames.length; a++) {
    const hit = attrMask[a] & cur
    if (!hit) continue
    let cmd: string
    if ((hit & ~spyMask) === 0) cmd = attrNames[a]
    else if ((hit & spyMask) === 0) cmd = "NOT " + attrNames[a]
    else continue
    const nxt = cur & ~hit
    if (prevState[nxt] !== -1) continue
    prevState[nxt] = cur
    prevCmd[nxt] = cmd
    queue.push(nxt)
  }
}

const commands: string[] = []
for (let s = goal; s !== full; s = prevState[s]) commands.push(prevCmd[s])
console.log(commands.reverse().join("\n"))
