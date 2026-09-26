// 🎮 CodinGame Puzzle - 222-rubiks-cube-movements
// https://www.codingame.com/training/medium/222-rubiks-cube-movements
// Each sticker is tracked by its cubie position (coordinates ±1) and its outward normal.
// Axes: x to the right, y up, z towards the viewer (front).

type Vec = [number, number, number]
interface Sticker {
  pos: Vec
  normal: Vec
  colour: string
}

const FACE_NORMALS: { [face: string]: Vec } = {
  F: [0, 0, 1],
  B: [0, 0, -1],
  R: [1, 0, 0],
  L: [-1, 0, 0],
  U: [0, 1, 0],
  D: [0, -1, 0],
}

const dot = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
// Clockwise quarter turn seen from the tip of the axis: rotation by -90 degrees
const turn = (v: Vec, axis: Vec): Vec => {
  const c = cross(axis, v)
  const d = dot(axis, v)
  return [axis[0] * d - c[0], axis[1] * d - c[1], axis[2] * d - c[2]]
}

const stickers: Sticker[] = []
for (const face in FACE_NORMALS) {
  const normal = FACE_NORMALS[face]
  for (const x of [-1, 1])
    for (const y of [-1, 1])
      for (const z of [-1, 1]) {
        const pos: Vec = [x, y, z]
        if (dot(pos, normal) === 1) stickers.push({ pos, normal, colour: face })
      }
}

const moveLine = readline().replace(/[^FBRLUD'2]/g, "")
const moveRegex = /([FBRLUD])(['2]?)/g
let match: RegExpExecArray | null
while ((match = moveRegex.exec(moveLine)) !== null) {
  const axis = FACE_NORMALS[match[1]]
  const quarterTurns = match[2] === "'" ? 3 : match[2] === "2" ? 2 : 1
  for (let t = 0; t < quarterTurns; t++) {
    for (const s of stickers) {
      if (dot(s.pos, axis) !== 1) continue
      s.pos = turn(s.pos, axis)
      s.normal = turn(s.normal, axis)
    }
  }
}

const frontColour = (x: number, y: number): string => {
  for (const s of stickers) if (s.normal[2] === 1 && s.pos[0] === x && s.pos[1] === y) return s.colour
  return "?"
}
console.log(frontColour(-1, 1) + frontColour(1, 1))
console.log(frontColour(-1, -1) + frontColour(1, -1))
