// 🎮 CodinGame Puzzle - xorandor
// https://www.codingame.com/training/expert/xorandor

// Parse the layout: components are "[...]" spans, their output pins are the
// "|" just above (the special char column, or both side pins for a switch),
// their input pins the "|" just below. Wires ("|" vertical, "-" horizontal,
// "+" both) are grouped into nets by flood fill, each net having exactly one
// source (an input digit or an output pin). Then every subset of toggles
// (switches then inputs, at most 2^18) is tried by increasing size; the
// circuit is evaluated bottom-up and the lexicographically first minimal
// subset (K1..Kn, I1..In order) lighting the LED is printed.

const [gridH, gridW] = readline().split(" ").map(Number)
const rows: string[] = []
for (let i = 0; i < gridH; i++) rows.push((readline() ?? "").padEnd(gridW, " "))

interface Part {
  kind: string
  row: number
  left: number
  right: number
  col: number
  ins: number[] // input nets
}
const parts: Part[] = []
const spanOf: Int32Array = new Int32Array(gridH * gridW).fill(-1)
for (let r = 0; r < gridH; r++) {
  for (let c = 0; c < gridW; c++) {
    if (rows[r][c] !== "[") continue
    const e = rows[r].indexOf("]", c + 1)
    let col = c + 1
    while (rows[r][col] === " ") col++
    const id = parts.length
    parts.push({ kind: rows[r][col], row: r, left: c, right: e, col, ins: [] })
    for (let x = c; x <= e; x++) spanOf[r * gridW + x] = id
    c = e
  }
}

// flood fill wires into nets
const lastRow = gridH - 1
const isDigit = (r: number, c: number): boolean => r === lastRow && (rows[r][c] === "0" || rows[r][c] === "1")
const isWire = (r: number, c: number): boolean =>
  spanOf[r * gridW + c] === -1 && (rows[r][c] === "|" || rows[r][c] === "-" || rows[r][c] === "+" || isDigit(r, c))
const horiz = (ch: string): boolean => ch === "-" || ch === "+"
const vert = (ch: string): boolean => ch === "|" || ch === "+" || ch === "0" || ch === "1"
const netOf = new Int32Array(gridH * gridW).fill(-1)
let netCount = 0
for (let r = 0; r < gridH; r++) {
  for (let c = 0; c < gridW; c++) {
    if (netOf[r * gridW + c] !== -1 || !isWire(r, c)) continue
    const stack: number[] = [r * gridW + c]
    netOf[r * gridW + c] = netCount
    while (stack.length) {
      const cur = stack.pop()!
      const cc = cur % gridW
      const cr = (cur - cc) / gridW
      const ch = rows[cr][cc]
      const link = (nr: number, nc: number, ok: boolean): void => {
        if (!ok || nr < 0 || nc < 0 || nr >= gridH || nc >= gridW) return
        const id = nr * gridW + nc
        if (netOf[id] !== -1 || !isWire(nr, nc)) return
        netOf[id] = netCount
        stack.push(id)
      }
      if (horiz(ch)) {
        if (cc + 1 < gridW) link(cr, cc + 1, horiz(rows[cr][cc + 1]))
        if (cc > 0) link(cr, cc - 1, horiz(rows[cr][cc - 1]))
      }
      if (vert(ch)) {
        if (cr + 1 < gridH) link(cr + 1, cc, vert(rows[cr + 1][cc]))
        if (cr > 0) link(cr - 1, cc, vert(rows[cr - 1][cc]))
      }
    }
    netCount++
  }
}

// sources: value slots. slot = input index, or gate output, or switch side
const inputCols: number[] = []
for (let c = 0; c < gridW; c++) if (isDigit(lastRow, c)) inputCols.push(c)
const switches: number[] = []
parts.forEach((p, i) => {
  if (p.kind === "<" || p.kind === ">") switches.push(i)
})
// slot layout: inputs [0..nI), then 2 slots per part (out / right out)
const nI = inputCols.length
const netSlot = new Int32Array(netCount).fill(-1)
inputCols.forEach((c, i) => {
  netSlot[netOf[lastRow * gridW + c]] = i
})
const netAt = (r: number, c: number): number => (r >= 0 && r < gridH ? netOf[r * gridW + c] : -1)
parts.forEach((p, i) => {
  if (p.kind === "<" || p.kind === ">") {
    const pins: number[] = []
    for (let x = p.left; x <= p.right; x++) if (netAt(p.row - 1, x) !== -1) pins.push(x)
    if (pins.length) netSlot[netAt(p.row - 1, pins[0])] = nI + 2 * i
    if (pins.length > 1) netSlot[netAt(p.row - 1, pins[pins.length - 1])] = nI + 2 * i + 1
  } else if (p.kind !== "@") {
    const n = netAt(p.row - 1, p.col)
    if (n !== -1) netSlot[n] = nI + 2 * i
  }
  for (let x = p.left; x <= p.right; x++) {
    const n = netAt(p.row + 1, x)
    if (n !== -1) p.ins.push(n)
  }
})

// evaluation order: bottom-up (the LED, on the top row, comes last)
const order = parts.map((_, i) => i).sort((a, b) => parts[b].row - parts[a].row)
const baseInputs = inputCols.map(c => rows[lastRow][c] === "1")
const baseSwitch = switches.map(i => parts[i].kind === ">")
const switchIdx = new Map<number, number>()
switches.forEach((p, k) => switchIdx.set(p, k))
const vals = new Uint8Array(nI + 2 * parts.length)
const nK = switches.length

const lights = (mask: number): boolean => {
  vals.fill(0)
  for (let i = 0; i < nI; i++) vals[i] = (baseInputs[i] ? 1 : 0) ^ ((mask >> (nK + i)) & 1)
  for (const pi of order) {
    const p = parts[pi]
    const iv = p.ins.map(n => (netSlot[n] === -1 ? 0 : vals[netSlot[n]]))
    const a = iv[0] ?? 0
    const b = iv[1] ?? 0
    let out = 0
    switch (p.kind) {
      case "@":
        return iv.every(v => v === 1)
      case "~":
        out = a ^ 1
        break
      case "&":
        out = a & b
        break
      case "|":
        out = a | b
        break
      case "+":
        out = a ^ b
        break
      case "^":
        out = (a & b) ^ 1
        break
      case "-":
        out = (a | b) ^ 1
        break
      case "=":
        out = a ^ b ^ 1
        break
      default: {
        const k = switchIdx.get(pi)!
        const right = baseSwitch[k] !== (((mask >> k) & 1) === 1)
        vals[nI + 2 * pi + (right ? 1 : 0)] = a
        continue
      }
    }
    vals[nI + 2 * pi] = out
  }
  return false
}

const total = nK + nI
const popcount = (x: number): number => {
  let c = 0
  for (; x; x &= x - 1) c++
  return c
}
// bit order key: lower bit index = earlier name; lexicographic list compare
const listOf = (m: number): number[] => {
  const res: number[] = []
  for (let i = 0; i < total; i++) if ((m >> i) & 1) res.push(i)
  return res
}
const lexLess = (x: number[], y: number[]): boolean => {
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] < y[i]
  return false
}
let best: number[] | null = null
for (let size = 0; size <= total && best === null; size++) {
  for (let m = 0; m < 1 << total; m++) {
    if (popcount(m) !== size || !lights(m)) continue
    const l = listOf(m)
    if (best === null || lexLess(l, best)) best = l
  }
}
const names = (best ?? []).map(i => (i < nK ? "K" + (i + 1) : "I" + (i - nK + 1)))
console.log(names.join("\n"))
