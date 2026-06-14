const word = readline().toUpperCase()

const elements = new Set(
  "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og"
    .split(" ")
    .map(e => e.toUpperCase())
)

const results: string[] = []

function spell(pos: number, current: string): void {
  if (pos === word.length) {
    results.push(current)
    return
  }
  // 1-letter element (uppercase)
  const one = word[pos]
  if (elements.has(one)) {
    spell(pos + 1, current + one)
  }
  // 2-letter element (uppercase + lowercase)
  if (pos + 1 < word.length) {
    const two = word.substring(pos, pos + 2)
    if (elements.has(two)) {
      spell(pos + 2, current + two[0] + two[1].toLowerCase())
    }
  }
}

spell(0, "")

if (results.length === 0) {
  console.log("none")
} else {
  console.log(results.join("\n"))
}
