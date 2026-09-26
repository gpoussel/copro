// 🎮 CodinGame Puzzle - wave-function-collapse-sans-shannon
// https://www.codingame.com/training/hard/wave-function-collapse-sans-shannon

// Every 3x3 window of the prototype is a patch. Each output cell keeps its
// set of possible symbols and each 3x3 window of the output its set of
// possible patches. Sweeping windows left to right, top to bottom, patches
// incompatible with the covered cells are dropped, then the covered cells
// are narrowed to the symbols still offered by the surviving patches. Sweeps
// repeat (only on windows touching a changed cell) until nothing changes.

const [protoW, protoH] = readline().trim().split(/\s+/).map(Number)
const proto: string[] = []
for (let i = 0; i < protoH; i++) proto.push(readline().padEnd(protoW, " ").slice(0, protoW))
const [outW, outH] = readline().trim().split(/\s+/).map(Number)
const partial: string[] = []
for (let i = 0; i < outH; i++) partial.push(readline().padEnd(outW, " ").slice(0, outW))

// Symbol alphabet and unique patches (9 symbol ids each, row-major)
const symbols: string[] = []
const symId = new Map<string, number>()
const idOf = (ch: string) => {
  if (!symId.has(ch)) {
    symId.set(ch, symbols.length)
    symbols.push(ch)
  }
  return symId.get(ch)!
}
proto.forEach(row => [...row].forEach(idOf))
const S = symbols.length
const patchKeys = new Set<string>()
const patches: number[][] = []
for (let r = 0; r + 3 <= protoH; r++)
  for (let c = 0; c + 3 <= protoW; c++) {
    const p: number[] = []
    for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) p.push(idOf(proto[r + dr][c + dc]))
    const key = p.join(",")
    if (!patchKeys.has(key)) {
      patchKeys.add(key)
      patches.push(p)
    }
  }

// allowed[cell * S + s] = symbol s still possible in cell
const allowed = new Uint8Array(outW * outH * S)
const count = new Int32Array(outW * outH)
for (let r = 0; r < outH; r++)
  for (let c = 0; c < outW; c++) {
    const cell = r * outW + c
    const ch = partial[r][c]
    if (ch === "?") {
      allowed.fill(1, cell * S, cell * S + S)
      count[cell] = S
    } else if (symId.has(ch)) {
      allowed[cell * S + symId.get(ch)!] = 1
      count[cell] = 1
    }
  }

// Possible patches per window (top-left corner), and dirty flags
const winW = outW - 2
const winH = outH - 2
const windows: number[][] = Array.from({ length: winW * winH }, () => patches.map((_, i) => i))
const dirty = new Uint8Array(winW * winH).fill(1)
const seen = new Uint8Array(S)

let changed = true
while (changed) {
  changed = false
  for (let wr = 0; wr < winH; wr++)
    for (let wc = 0; wc < winW; wc++) {
      const w = wr * winW + wc
      if (!dirty[w]) continue
      dirty[w] = 0
      const cells: number[] = []
      for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) cells.push((wr + dr) * outW + wc + dc)
      const kept = windows[w].filter(p => patches[p].every((s, k) => allowed[cells[k] * S + s]))
      // A window no prototype patch fits gives no information: leave it alone
      if (!kept.length) continue
      windows[w] = kept
      // Narrow every covered cell to the symbols offered by the remaining patches
      cells.forEach((cell, k) => {
        seen.fill(0)
        for (const p of windows[w]) seen[patches[p][k]] = 1
        let removed = false
        for (let s = 0; s < S; s++)
          if (allowed[cell * S + s] && !seen[s]) {
            allowed[cell * S + s] = 0
            count[cell]--
            removed = true
          }
        if (!removed) return
        changed = true
        const r = Math.floor(cell / outW)
        const c = cell % outW
        for (let ar = Math.max(0, r - 2); ar <= Math.min(winH - 1, r); ar++)
          for (let ac = Math.max(0, c - 2); ac <= Math.min(winW - 1, c); ac++) dirty[ar * winW + ac] = 1
      })
    }
}

const outLines: string[] = []
for (let r = 0; r < outH; r++) {
  let line = ""
  for (let c = 0; c < outW; c++) {
    const cell = r * outW + c
    if (count[cell] === 1) {
      let s = 0
      while (!allowed[cell * S + s]) s++
      line += symbols[s]
    } else line += count[cell] === 0 ? partial[r][c] : "?"
  }
  outLines.push(line)
}
console.log(outLines.join("\n"))
