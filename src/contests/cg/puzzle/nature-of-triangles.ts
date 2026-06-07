// 🎮 CodinGame Puzzle - nature-of-triangles
// https://www.codingame.com/training/easy/nature-of-triangles

const n = parseInt(readline())

for (let i = 0; i < n; i++) {
  const parts = readline().split(" ")
  const nameA = parts[0]
  const xA = parseInt(parts[1]),
    yA = parseInt(parts[2])
  const nameB = parts[3]
  const xB = parseInt(parts[4]),
    yB = parseInt(parts[5])
  const nameC = parts[6]
  const xC = parseInt(parts[7]),
    yC = parseInt(parts[8])

  const triangleName = nameA + nameB + nameC

  // Squared side lengths
  const ab2 = (xB - xA) ** 2 + (yB - yA) ** 2
  const bc2 = (xC - xB) ** 2 + (yC - yB) ** 2
  const ca2 = (xA - xC) ** 2 + (yA - yC) ** 2

  // Dot products at each vertex (for angle classification)
  // At A: vectors AB and AC
  const dotA = (xB - xA) * (xC - xA) + (yB - yA) * (yC - yA)
  // At B: vectors BA and BC
  const dotB = (xA - xB) * (xC - xB) + (yA - yB) * (yC - yB)
  // At C: vectors CA and CB
  const dotC = (xA - xC) * (xB - xC) + (yA - yC) * (yB - yC)

  // Side nature
  // isosceles: two sides equal. The apex vertex is the one shared by the two equal sides.
  // AB = CA => common vertex A; AB = BC => common vertex B; BC = CA => common vertex C
  let sideNature: string
  if (ab2 === bc2) {
    sideNature = `isosceles in ${nameB}`
  } else if (ab2 === ca2) {
    sideNature = `isosceles in ${nameA}`
  } else if (bc2 === ca2) {
    sideNature = `isosceles in ${nameC}`
  } else {
    sideNature = "scalene"
  }

  // Angle nature using dot products
  // right: dot == 0; obtuse: dot < 0; acute: all dots > 0
  let angleNature: string
  if (dotA === 0) {
    angleNature = `right in ${nameA}`
  } else if (dotB === 0) {
    angleNature = `right in ${nameB}`
  } else if (dotC === 0) {
    angleNature = `right in ${nameC}`
  } else if (dotA < 0) {
    // Obtuse at A
    const cosA = dotA / Math.sqrt(ab2 * ca2)
    const deg = Math.round((Math.acos(cosA) * 180) / Math.PI)
    angleNature = `obtuse in ${nameA} (${deg}°)`
  } else if (dotB < 0) {
    const cosB = dotB / Math.sqrt(ab2 * bc2)
    const deg = Math.round((Math.acos(cosB) * 180) / Math.PI)
    angleNature = `obtuse in ${nameB} (${deg}°)`
  } else if (dotC < 0) {
    const cosC = dotC / Math.sqrt(bc2 * ca2)
    const deg = Math.round((Math.acos(cosC) * 180) / Math.PI)
    angleNature = `obtuse in ${nameC} (${deg}°)`
  } else {
    angleNature = "acute"
  }

  // "a" vs "an"
  const vowels = new Set(["a", "e", "i", "o", "u"])
  const artSide = vowels.has(sideNature[0].toLowerCase()) ? "an" : "a"
  const artAngle = vowels.has(angleNature[0].toLowerCase()) ? "an" : "a"

  console.log(`${triangleName} is ${artSide} ${sideNature} and ${artAngle} ${angleNature} triangle.`)
}
