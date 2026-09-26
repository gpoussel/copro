// 🎮 CodinGame Puzzle - bmp-compression
// https://www.codingame.com/training/medium/bmp-compression

type Area = [number, number, number, number] // row, col, height, width

// Sub-areas in upper-left, upper-right, lower-left, lower-right order;
// a single row/column is only cut along the other axis
function split([r, c, h, w]: Area): Area[] {
  const th = Math.ceil(h / 2)
  const lw = Math.ceil(w / 2)
  const rows: [number, number][] = h === 1 ? [[r, 1]] : [[r, th], [r + th, h - th]]
  const cols: [number, number][] = w === 1 ? [[c, 1]] : [[c, lw], [c + lw, w - lw]]
  const areas: Area[] = []
  for (const [rr, hh] of rows) for (const [cc, ww] of cols) areas.push([rr, cc, hh, ww])
  return areas
}

const [header, cStr, rStr] = readline().trim().split(" ")
const cols = +cStr
const rows = +rStr
const ln = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < ln; i++) lines.push(readline())

if (header === "B") {
  const encode = (area: Area): string => {
    const [r, c, h, w] = area
    let blacks = 0
    for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) if (lines[y][x] === "#") blacks++
    if (blacks === 0) return "0"
    if (blacks === h * w) return "1"
    return "+" + split(area).map(encode).join("")
  }
  const data = encode([0, 0, rows, cols])
  const chunks: string[] = []
  for (let i = 0; i < data.length; i += 50) chunks.push(data.slice(i, i + 50))
  console.log(`C ${cols} ${rows}`)
  console.log(chunks.length)
  for (const chunk of chunks) console.log(chunk)
} else {
  const data = lines.join("")
  let pos = 0
  const image: string[][] = []
  for (let y = 0; y < rows; y++) image.push(new Array(cols).fill("."))
  const decode = (area: Area) => {
    const token = data[pos++]
    if (token === "+") {
      for (const sub of split(area)) decode(sub)
      return
    }
    const [r, c, h, w] = area
    for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) image[y][x] = token === "1" ? "#" : "."
  }
  decode([0, 0, rows, cols])
  console.log(`B ${cols} ${rows}`)
  console.log(rows)
  for (const row of image) console.log(row.join(""))
}
