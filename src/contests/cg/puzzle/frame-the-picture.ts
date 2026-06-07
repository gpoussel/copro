// 🎮 CodinGame Puzzle - frame-the-picture
// https://www.codingame.com/training/easy/frame-the-picture

const framePattern: string = readline()
const [h, w] = readline().split(" ").map(Number)
const lines: string[] = []
for (let i = 0; i < h; i++) {
  lines.push(readline())
}

const patLen = framePattern.length

// The frame adds `patLen` layers on each side, plus 1 space gap on each side.
// Total width: w + 2 * patLen + 2 (for the space gaps)
// Total height: h + 2 * patLen + 2 (for the space gaps)
const totalWidth = w + 2 * patLen + 2
const totalHeight = h + 2 * patLen + 2

// For row index r (0-based) and col index c (0-based):
// The "layer" from outside is min(r, totalHeight-1-r, c, totalWidth-1-c).
// If layer < patLen, it's a frame character: framePattern[layer]
// But the outermost layer uses pattern[0], repeated. However, looking at test 4:
//   Top row: all 'O' (pattern[0])
//   Second row: 'O' at ends, 'o' (pattern[1]) in middle
// So each layer i corresponds to pattern[i], and the character at each cell
// is determined by the minimum distance to any edge.

// Wait — looking more carefully at test 4 with "Oo:":
// Row 0: OOOOOOOOOOOOOOO — all pattern[0]='O'
// Row 1: OoooooooooooooO — pattern[0]='O' at col 0 and last, pattern[1]='o' elsewhere
// Row 2: Oo:::::::::::oO — pattern[0] at col 0, pattern[1] at col 1, pattern[2]=':' elsewhere
// Row 3: Oo:         :oO — pattern[0], pattern[1], pattern[2], then spaces, then pattern[2], pattern[1], pattern[0]
// This confirms: layer = min(distFromTop, distFromBottom, distFromLeft, distFromRight)
// If layer < patLen => framePattern[layer], else ' '

for (let r = 0; r < totalHeight; r++) {
  let row = ""
  for (let c = 0; c < totalWidth; c++) {
    const distTop = r
    const distBottom = totalHeight - 1 - r
    const distLeft = c
    const distRight = totalWidth - 1 - c
    const layer = Math.min(distTop, distBottom, distLeft, distRight)
    if (layer < patLen) {
      row += framePattern[layer]
    } else {
      // Inner area: either picture content or space padding
      // Inner content starts at offset patLen+1 from each edge
      const innerR = r - patLen - 1
      const innerC = c - patLen - 1
      if (innerR >= 0 && innerR < h && innerC >= 0 && innerC < w) {
        row += lines[innerR][innerC] ?? " "
      } else {
        row += " "
      }
    }
  }
  console.log(row)
}
