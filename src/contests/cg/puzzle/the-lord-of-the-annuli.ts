// 🎮 CodinGame Puzzle - the-lord-of-the-annuli
// https://www.codingame.com/training/medium/the-lord-of-the-annuli

const SHADES = " .:-=+*#%@"

const [width, height, cx, cy, ro, ri, samples] = readline().trim().split(/\s+/).map(Number)

// Coordinates are in character cells; a cell is half a unit wide, hence the halved dx
function onRing(x: number, y: number): boolean {
  const dx = (x - cx) / 2
  const dy = y - cy
  const d2 = dx * dx + dy * dy
  return ri * ri <= d2 && d2 <= ro * ro
}

const border = "+" + "-".repeat(width) + "+"
console.log(border)
for (let y = 0; y < height; y++) {
  let line = "|"
  for (let x = 0; x < width; x++) {
    let hits = 0
    for (let j = 0; j < samples; j++) {
      for (let i = 0; i < samples; i++) if (onRing(x + (i + 0.5) / samples, y + (j + 0.5) / samples)) hits++
    }
    line += SHADES[Math.min(9, Math.floor((hits * 10) / (samples * samples)))]
  }
  console.log(line + "|")
}
console.log(border)
