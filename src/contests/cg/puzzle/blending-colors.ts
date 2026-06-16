// 🎮 CodinGame Puzzle - blending-colors
// https://www.codingame.com/training/easy/blending-colors

interface Shape {
  name: string
  x0: number
  y0: number
  len: number
  r: number
  g: number
  b: number
}

const [s, p] = readline()
  .split(" ")
  .map(n => parseInt(n, 10))

const shapes: Shape[] = []
for (let i = 0; i < s; i++) {
  const parts = readline().split(" ")
  shapes.push({
    name: parts[0],
    x0: parseInt(parts[1], 10),
    y0: parseInt(parts[2], 10),
    len: parseInt(parts[3], 10),
    r: parseInt(parts[4], 10),
    g: parseInt(parts[5], 10),
    b: parseInt(parts[6], 10),
  })
}

function classify(shape: Shape, x: number, y: number): "border" | "inside" | "outside" {
  if (shape.name === "SQUARE") {
    const xMin = shape.x0
    const xMax = shape.x0 + shape.len
    const yMin = shape.y0
    const yMax = shape.y0 + shape.len
    if (x < xMin || x > xMax || y < yMin || y > yMax) {
      return "outside"
    }
    if (x === xMin || x === xMax || y === yMin || y === yMax) {
      return "border"
    }
    return "inside"
  }
  const dx = x - shape.x0
  const dy = y - shape.y0
  const dist2 = dx * dx + dy * dy
  const r2 = shape.len * shape.len
  if (dist2 > r2) {
    return "outside"
  }
  if (dist2 === r2) {
    return "border"
  }
  return "inside"
}

const out: string[] = []
for (let i = 0; i < p; i++) {
  const [x, y] = readline()
    .split(" ")
    .map(n => parseInt(n, 10))

  let onBorder = false
  let sumR = 0
  let sumG = 0
  let sumB = 0
  let count = 0

  for (const shape of shapes) {
    const c = classify(shape, x, y)
    if (c === "border") {
      onBorder = true
      break
    }
    if (c === "inside") {
      const isBlack = shape.r === 0 && shape.g === 0 && shape.b === 0
      const isWhite = shape.r === 255 && shape.g === 255 && shape.b === 255
      if (isBlack || isWhite) {
        continue
      }
      sumR += shape.r
      sumG += shape.g
      sumB += shape.b
      count++
    }
  }

  if (onBorder) {
    out.push("(0, 0, 0)")
  } else if (count === 0) {
    out.push("(255, 255, 255)")
  } else {
    const r = Math.round(sumR / count)
    const g = Math.round(sumG / count)
    const b = Math.round(sumB / count)
    out.push(`(${r}, ${g}, ${b})`)
  }
}

console.log(out.join("\n"))
