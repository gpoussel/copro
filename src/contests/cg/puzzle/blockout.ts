// 🎮 CodinGame Puzzle - blockout
// https://www.codingame.com/training/hard/blockout

// 3D Tetris. For every rotation and (x, z) shift we drop the block from the top,
// clear full layers and score the pit with a Dellacherie-like heuristic
// (landing height, eroded cells, transitions, holes, wells, covered cells...)
// and play the best placement (greedy, one ply).
// Cells are indexed like the input: (z * H + y) * W + x, with y = 0 the floor.

interface Rotation {
  index: number
  w: number
  h: number
  d: number
  cells: number[][]
}

interface Placement {
  board: Uint8Array
  score: number
  action: string
}

let W = 0
let H = 0
let D = 0
const at = (x: number, y: number, z: number): number => (z * H + y) * W + x
// Weights: landing, eroded, row/col transitions, holes, wells, sum of heights,
// bumpiness, cells above holes, layers with holes, near-top penalty
const K = [4.5, 3.4, 3.2, 9.3, 15.8, 3.4, 0, 0, 3, 10, 20]

const collides = (pit: Uint8Array, r: Rotation, ox: number, oy: number, oz: number): boolean => {
  for (const [x, y, z] of r.cells) if (pit[at(x + ox, y + oy, z + oz)]) return true
  return false
}

// Static evaluation of a pit, plus the landing height / eroded cells of the last move
const evaluate = (b: Uint8Array, landing: number, eroded: number): number => {
  const filled = (x: number, y: number, z: number): number =>
    x < 0 || x >= W || z < 0 || z >= D || y < 0 ? 1 : y >= H ? 0 : b[at(x, y, z)]
  let layerTop = 0
  for (let i = 0; i < b.length; i++) if (b[i]) layerTop = Math.max(layerTop, (Math.floor(i / W) % H) + 1)

  let rowTrans = 0
  let colTrans = 0
  let holes = 0
  let wells = 0
  let sumH = 0
  let bump = 0
  let covers = 0
  let holeRows = 0
  const hs: number[] = []
  const rowHasHole = new Uint8Array(H)
  for (let z = 0; z < D; z++) {
    for (let x = 0; x < W; x++) {
      let top = 0
      let well = 0
      for (let y = H - 1; y >= 0; y--) {
        const c = b[at(x, y, z)]
        if (c) {
          if (!top) top = y + 1
        } else if (top) {
          holes++
          covers += top - y - 1
          rowHasHole[y] = 1
        }
        if (c !== filled(x, y - 1, z)) colTrans++
        // Horizontal transitions, only inside the occupied layers
        if (y < layerTop) {
          if (W > 1 && c !== filled(x - 1, y, z)) rowTrans++
          if (W > 1 && x === W - 1 && c !== filled(x + 1, y, z)) rowTrans++
          if (D > 1 && c !== filled(x, y, z - 1)) rowTrans++
          if (D > 1 && z === D - 1 && c !== filled(x, y, z + 1)) rowTrans++
        }
        if (!c && !top && filled(x - 1, y, z) && filled(x + 1, y, z) && filled(x, y, z - 1) && filled(x, y, z + 1)) {
          well++
          wells += well
        } else well = 0
      }
      if (b[at(x, H - 1, z)]) colTrans++
      hs.push(top)
      sumH += top
    }
  }
  for (let z = 0; z < D; z++)
    for (let x = 0; x < W; x++) {
      if (x + 1 < W) bump += Math.abs(hs[z * W + x] - hs[z * W + x + 1])
      if (z + 1 < D) bump += Math.abs(hs[z * W + x] - hs[(z + 1) * W + x])
    }
  for (let y = 0; y < H; y++) holeRows += rowHasHole[y]
  return (
    -K[0] * landing +
    K[1] * eroded -
    K[2] * rowTrans -
    K[3] * colTrans -
    K[4] * holes -
    K[5] * wells -
    K[6] * sumH -
    K[7] * bump -
    K[8] * covers -
    K[9] * holeRows -
    (layerTop > H - 3 ? K[10] * (layerTop - H + 3) : 0)
  )
}

// Drop rotation r at (ox, oz): resulting board (full layers cleared) and its score
const drop = (pit: Uint8Array, r: Rotation, ox: number, oz: number): Placement | null => {
  let oy = H - r.h
  if (collides(pit, r, ox, oy, oz)) return null
  while (oy > 0 && !collides(pit, r, ox, oy - 1, oz)) oy--
  const g = pit.slice()
  let landing = 0
  for (const [x, y, z] of r.cells) {
    g[at(x + ox, y + oy, z + oz)] = 1
    landing += y + oy
  }
  landing /= r.cells.length

  let eroded = 0
  const keep: number[] = []
  for (let y = 0; y < H; y++) {
    let cnt = 0
    for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) cnt += g[at(x, y, z)]
    if (cnt === W * D) {
      for (const c of r.cells) if (c[1] + oy === y) eroded++
    } else keep.push(y)
  }
  let board = g
  if (keep.length < H) {
    board = new Uint8Array(g.length)
    keep.forEach((y, ny) => {
      for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) board[at(x, ny, z)] = g[at(x, y, z)]
    })
  }
  return { board, score: evaluate(board, landing, eroded), action: `${r.index} ${ox} ${oz}` }
}

const placements = (pit: Uint8Array, rotations: Rotation[]): Placement[] => {
  const res: Placement[] = []
  for (const r of rotations) {
    if (r.w > W || r.d > D || r.h > H) continue
    for (let oz = 0; oz + r.d <= D; oz++)
      for (let ox = 0; ox + r.w <= W; ox++) {
        const p = drop(pit, r, ox, oz)
        if (p) res.push(p)
      }
  }
  return res
}

while (true) {
  const [pw, ph, pd, shape] = readline().split(" ")
  W = +pw
  H = +ph
  D = +pd
  const pit = new Uint8Array(W * H * D)
  for (let i = 0; i < pit.length; i++) pit[i] = shape[i] === "#" ? 1 : 0

  const count = parseInt(readline())
  const rotations: Rotation[] = []
  for (let i = 0; i < count; i++) {
    const [idx, bw, bh, bd, s] = readline().split(" ")
    const r: Rotation = { index: +idx, w: +bw, h: +bh, d: +bd, cells: [] }
    for (let z = 0; z < r.d; z++)
      for (let y = 0; y < r.h; y++)
        for (let x = 0; x < r.w; x++) if (s[(z * r.h + y) * r.w + x] === "#") r.cells.push([x, y, z])
    rotations.push(r)
  }

  let best: Placement | null = null
  for (const p of placements(pit, rotations)) if (!best || p.score > best.score) best = p
  console.log(best ? best.action : `${rotations[0].index} 0 0`)
}
