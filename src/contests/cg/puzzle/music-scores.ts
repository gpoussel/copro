// 🎮 CodinGame Puzzle - music-scores
// https://www.codingame.com/training/expert/music-scores
//
// A black & white scanned music score is given, run-length encoded with the DWE
// algorithm: tokens "C L" (C = B black / W white, L = pixel count), left-to-right
// top-to-bottom. We must read the notes (pitch A-G + type H half / Q quarter).
//
// Approach:
//  1. Decode the RLE into a 1bpp bitmap (1 = black).
//  2. Locate the 5 staff lines (rows that are mostly black) -> line centres & spacing.
//  3. Erase staff & ledger/beam lines (keep pixels where a note crosses).
//  4. Flood-fill exterior white; white pixels not reachable are hollow-head interiors;
//     fill them so a half note becomes a solid blob like a quarter note.
//  5. Build a head mask (filled blobs + raw ink so open small rings survive), drop stems
//     (tall thin vertical runs), connected-component it. Oversized blobs (two overlapping
//     notes) are split by greedy peak-picking of a head-sized window.
//  6. Map each head's vertical centre to a pitch (top staff line = F, descending FEDCBAG)
//     and read fill (white centre => half) to produce e.g. "AQ DH".

const firstLine: string = readline().trim()
const [W, H] = firstLine.split(/\s+/).map((s: string): number => parseInt(s, 10))
const tokens: string[] = readline().trim().split(/\s+/)

const px = new Uint8Array(W * H)
let pos = 0
for (let i = 0; i + 1 < tokens.length; i += 2) {
  const n = parseInt(tokens[i + 1], 10)
  const v = tokens[i] === "B" ? 1 : 0
  for (let k = 0; k < n; k++) px[pos++] = v
}

// --- staff lines ---
const rowBlack: number[] = new Array(H).fill(0)
for (let y = 0; y < H; y++) {
  let c = 0
  for (let x = 0; x < W; x++) c += px[y * W + x]
  rowBlack[y] = c
}
const staffRows: number[] = []
for (let y = 0; y < H; y++) if (rowBlack[y] > W * 0.5) staffRows.push(y)

const groups: number[][] = []
for (const y of staffRows) {
  const last = groups[groups.length - 1]
  if (last && y - last[last.length - 1] <= 2) last.push(y)
  else groups.push([y])
}
const lineCenters: number[] = groups.map((g: number[]): number => (g[0] + g[g.length - 1]) / 2)
const spacing = (lineCenters[lineCenters.length - 1] - lineCenters[0]) / (lineCenters.length - 1)
const half = spacing / 2

// --- erase staff lines (keep where a note crosses) ---
const img = Uint8Array.from(px)
for (const g of groups) {
  const a = g[0]
  const b = g[g.length - 1]
  for (let x = 0; x < W; x++) {
    const above = a - 1 >= 0 ? px[(a - 1) * W + x] : 0
    const below = b + 1 < H ? px[(b + 1) * W + x] : 0
    if (!(above && below)) {
      for (let y = a; y <= b; y++) img[y * W + x] = 0
    }
  }
}
// erase long horizontal runs left over (ledger lines / beams)
for (let y = 0; y < H; y++) {
  let x = 0
  while (x < W) {
    if (img[y * W + x]) {
      const s = x
      while (x < W && img[y * W + x]) x++
      if (x - s > spacing * 1.8) {
        for (let k = s; k < x; k++) {
          const ab = y - 1 >= 0 ? img[(y - 1) * W + k] : 0
          const be = y + 1 < H ? img[(y + 1) * W + k] : 0
          if (!(ab && be)) img[y * W + k] = 0
        }
      }
    } else x++
  }
}

// --- flood fill exterior white on img ---
const ext = new Uint8Array(W * H)
const queue = new Int32Array(W * H)
let qt = 0
const seed = (id: number): void => {
  if (!img[id] && !ext[id]) {
    ext[id] = 1
    queue[qt++] = id
  }
}
for (let x = 0; x < W; x++) {
  seed(x)
  seed((H - 1) * W + x)
}
for (let y = 0; y < H; y++) {
  seed(y * W)
  seed(y * W + W - 1)
}
let qh = 0
while (qh < qt) {
  const p = queue[qh++]
  const py = (p / W) | 0
  const pxx = p % W
  if (pxx > 0) seed(p - 1)
  if (pxx < W - 1) seed(p + 1)
  if (py > 0) seed(p - W)
  if (py < H - 1) seed(p + W)
}

const solid = new Uint8Array(W * H)
const enclosed = new Uint8Array(W * H)
for (let i = 0; i < W * H; i++) {
  if (img[i]) solid[i] = 1
  else if (!ext[i]) {
    solid[i] = 1
    enclosed[i] = 1
  }
}

// --- small-scale repair: fill near-enclosed white interiors ---
{
  const r = Math.ceil(spacing * 0.7)
  const upSolid = new Int32Array(W * H)
  const downSolid = new Int32Array(W * H)
  for (let x = 0; x < W; x++) {
    let d = 9999
    for (let y = 0; y < H; y++) {
      d = solid[y * W + x] ? 0 : d + 1
      upSolid[y * W + x] = d
    }
    d = 9999
    for (let y = H - 1; y >= 0; y--) {
      d = solid[y * W + x] ? 0 : d + 1
      downSolid[y * W + x] = d
    }
  }
  for (let y = 0; y < H; y++) {
    let x = 0
    while (x < W) {
      if (!solid[y * W + x]) {
        const s = x
        while (x < W && !solid[y * W + x]) x++
        const len = x - s
        const leftSolid = s > 0 && solid[y * W + s - 1]
        const rightSolid = x < W && solid[y * W + x]
        if (len <= r && leftSolid && rightSolid) {
          let interior = true
          for (let k = s; k < x; k++) {
            if (upSolid[y * W + k] > r || downSolid[y * W + k] > r) {
              interior = false
              break
            }
          }
          if (interior)
            for (let k = s; k < x; k++) {
              solid[y * W + k] = 1
              enclosed[y * W + k] = 1
            }
        }
      } else x++
    }
  }
}

// --- head mask (filled blobs + raw ink), drop stems (tall thin vertical runs) ---
const base = new Uint8Array(W * H)
for (let i = 0; i < W * H; i++) if (solid[i] || img[i]) base[i] = 1

const hrun = new Int32Array(W * H)
for (let y = 0; y < H; y++) {
  let x = 0
  while (x < W) {
    if (base[y * W + x]) {
      const s = x
      while (x < W && base[y * W + x]) x++
      const L = x - s
      for (let k = s; k < x; k++) hrun[y * W + k] = L
    } else x++
  }
}
const vrun = new Int32Array(W * H)
for (let x = 0; x < W; x++) {
  let y = 0
  while (y < H) {
    if (base[y * W + x]) {
      const s = y
      while (y < H && base[y * W + x]) y++
      const L = y - s
      for (let k = s; k < y; k++) vrun[k * W + x] = L
    } else y++
  }
}
const headMask = new Uint8Array(W * H)
for (let i = 0; i < W * H; i++) {
  if (base[i] && !(vrun[i] > spacing * 1.5 && hrun[i] <= spacing * 0.45)) headMask[i] = 1
}

// --- connected components ---
interface Comp {
  minx: number
  maxx: number
  miny: number
  maxy: number
  cnt: number
  id: number
}
const lbl = new Int32Array(W * H)
let nl = 0
const stack = new Int32Array(W * H)
const comps: Comp[] = []
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const id = y * W + x
    if (headMask[id] && !lbl[id]) {
      nl++
      let sp = 0
      stack[sp++] = id
      lbl[id] = nl
      let minx = x
      let maxx = x
      let miny = y
      let maxy = y
      let cnt = 0
      while (sp > 0) {
        const p = stack[--sp]
        const py = (p / W) | 0
        const pxx = p % W
        cnt++
        if (pxx < minx) minx = pxx
        if (pxx > maxx) maxx = pxx
        if (py < miny) miny = py
        if (py > maxy) maxy = py
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = py + dy
            const nx = pxx + dx
            if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue
            const qq = ny * W + nx
            if (headMask[qq] && !lbl[qq]) {
              lbl[qq] = nl
              stack[sp++] = qq
            }
          }
        }
      }
      comps.push({ minx, maxx, miny, maxy, cnt, id: nl })
    }
  }
}

// --- determine head centres (split oversized blobs by greedy peak-picking) ---
interface Center {
  cx: number
  cy: number
}
const headCenters: Center[] = []
for (const c of comps) {
  const w = c.maxx - c.minx + 1
  const h = c.maxy - c.miny + 1
  if (c.cnt < spacing * spacing * 0.18) continue
  if (w < spacing * 0.55 || h < spacing * 0.45) continue
  if (w <= spacing * 1.6 && h <= spacing * 1.6) {
    headCenters.push({ cx: (c.minx + c.maxx) / 2, cy: (c.miny + c.maxy) / 2 })
    continue
  }
  const occ = new Uint8Array(w * h)
  for (let y = c.miny; y <= c.maxy; y++)
    for (let x = c.minx; x <= c.maxx; x++) if (lbl[y * W + x] === c.id) occ[(y - c.miny) * w + (x - c.minx)] = 1
  const winW = Math.round(spacing * 0.9)
  const winH = Math.round(spacing * 0.9)
  const II = new Int32Array((w + 1) * (h + 1))
  const rebuild = (): void => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        II[(y + 1) * (w + 1) + (x + 1)] =
          occ[y * w + x] + II[y * (w + 1) + (x + 1)] + II[(y + 1) * (w + 1) + x] - II[y * (w + 1) + x]
  }
  const sumRect = (x0: number, y0: number, x1: number, y1: number): number => {
    const ax = Math.max(0, x0)
    const ay = Math.max(0, y0)
    const bx = Math.min(w - 1, x1)
    const by = Math.min(h - 1, y1)
    return (
      II[(by + 1) * (w + 1) + (bx + 1)] -
      II[ay * (w + 1) + (bx + 1)] -
      II[(by + 1) * (w + 1) + ax] +
      II[ay * (w + 1) + ax]
    )
  }
  rebuild()
  const maxHeads = Math.max(1, Math.round(w / spacing) * Math.round(h / spacing) + 2)
  const hw = winW >> 1
  const hh = winH >> 1
  for (let it = 0; it < maxHeads; it++) {
    let best = -1
    let bx = 0
    let by = 0
    for (let cy2 = 0; cy2 < h; cy2++) {
      for (let cx2 = 0; cx2 < w; cx2++) {
        const s = sumRect(cx2 - hw, cy2 - hh, cx2 + hw, cy2 + hh)
        if (s > best) {
          best = s
          bx = cx2
          by = cy2
        }
      }
    }
    if (best < winW * winH * 0.45) break
    headCenters.push({ cx: c.minx + bx, cy: c.miny + by })
    for (let y = by - hh; y <= by + hh; y++)
      for (let x = bx - hw; x <= bx + hw; x++) if (x >= 0 && x < w && y >= 0 && y < h) occ[y * w + x] = 0
    rebuild()
  }
}

headCenters.sort((a: Center, b: Center): number => a.cx - b.cx)

const SEQ = "FEDCBAG"
const nameOf = (p: number): string => SEQ[((p % 7) + 7) % 7]

const out: string[] = headCenters.map((c: Center): string => {
  const p = Math.round((c.cy - lineCenters[0]) / half)
  const ccx = Math.round(c.cx)
  const ccy = Math.round(c.cy)
  const mx = Math.max(1, Math.round(spacing * 0.18))
  const my = Math.max(1, Math.round(spacing * 0.14))
  let white = 0
  let total = 0
  for (let y = ccy - my; y <= ccy + my; y++) {
    for (let x = ccx - mx; x <= ccx + mx; x++) {
      if (x < 0 || x >= W || y < 0 || y >= H) continue
      total++
      if (!img[y * W + x]) white++
    }
  }
  const isHalf = white > total * 0.4
  return nameOf(p) + (isHalf ? "H" : "Q")
})

console.log(out.join(" "))
