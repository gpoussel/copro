// 🎮 CodinGame Puzzle - blood-types
// https://www.codingame.com/training/medium/blood-types

const TYPES = ["A+", "A-", "AB+", "AB-", "B+", "B-", "O+", "O-"]

const aboOf = (g: string) => {
  if (g.indexOf("A") >= 0 && g.indexOf("B") >= 0) return "AB"
  if (g.indexOf("A") >= 0) return "A"
  if (g.indexOf("B") >= 0) return "B"
  return "O"
}
const rhOf = (g: string) => (g.indexOf("+") >= 0 ? "+" : "-")

// Every genotype (ABO pair + Rh pair) with its resulting blood type
const genotypes: { abo: string; rh: string; type: string }[] = []
for (const abo of ["AA", "AO", "BB", "BO", "OO", "AB"]) {
  for (const rh of ["++", "+-", "--"]) genotypes.push({ abo, rh, type: aboOf(abo) + rhOf(rh) })
}

const canHave = (p1: string, p2: string, child: string) => {
  for (const g1 of genotypes) {
    if (g1.type !== p1) continue
    for (const g2 of genotypes) {
      if (g2.type !== p2) continue
      for (const a1 of g1.abo) for (const a2 of g2.abo) {
        for (const r1 of g1.rh) for (const r2 of g2.rh) {
          if (aboOf(a1 + a2) + rhOf(r1 + r2) === child) return true
        }
      }
    }
  }
  return false
}

const n = parseInt(readline())
for (let i = 0; i < n; i++) {
  const [p1, p2, child] = readline().trim().split(/\s+/)
  const fits = TYPES.filter(t => {
    if (p1 === "?") return canHave(t, p2, child)
    if (p2 === "?") return canHave(p1, t, child)
    return canHave(p1, p2, t)
  })
  console.log(fits.length > 0 ? fits.join(" ") : "impossible")
}
