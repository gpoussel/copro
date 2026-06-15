// 🎮 CodinGame Puzzle - periodic-table-spelling
// https://www.codingame.com/

const word: string = readline().toLowerCase()

const elements: string[] = [
  "H",
  "He",
  "Li",
  "Be",
  "B",
  "C",
  "N",
  "O",
  "F",
  "Ne",
  "Na",
  "Mg",
  "Al",
  "Si",
  "P",
  "S",
  "Cl",
  "Ar",
  "K",
  "Ca",
  "Sc",
  "Ti",
  "V",
  "Cr",
  "Mn",
  "Fe",
  "Co",
  "Ni",
  "Cu",
  "Zn",
  "Ga",
  "Ge",
  "As",
  "Se",
  "Br",
  "Kr",
  "Rb",
  "Sr",
  "Y",
  "Zr",
  "Nb",
  "Mo",
  "Tc",
  "Ru",
  "Rh",
  "Pd",
  "Ag",
  "Cd",
  "In",
  "Sn",
  "Sb",
  "Te",
  "I",
  "Xe",
  "Cs",
  "Ba",
  "La",
  "Ce",
  "Pr",
  "Nd",
  "Pm",
  "Sm",
  "Eu",
  "Gd",
  "Tb",
  "Dy",
  "Ho",
  "Er",
  "Tm",
  "Yb",
  "Lu",
  "Hf",
  "Ta",
  "W",
  "Re",
  "Os",
  "Ir",
  "Pt",
  "Au",
  "Hg",
  "Tl",
  "Pb",
  "Bi",
  "Po",
  "At",
  "Rn",
  "Fr",
  "Ra",
  "Ac",
  "Th",
  "Pa",
  "U",
  "Np",
  "Pu",
  "Am",
  "Cm",
  "Bk",
  "Cf",
  "Es",
  "Fm",
  "Md",
  "No",
  "Lr",
  "Rf",
  "Db",
  "Sg",
  "Bh",
  "Hs",
  "Mt",
  "Ds",
  "Rg",
  "Cn",
  "Nh",
  "Fl",
  "Mc",
  "Lv",
  "Ts",
  "Og",
]

const symbols: Set<string> = new Set<string>(elements.map((e: string): string => e.toLowerCase()))

const results: string[] = []

const dfs = (pos: number, acc: string): void => {
  if (pos === word.length) {
    results.push(acc)
    return
  }
  const one: string = word[pos]
  if (symbols.has(one)) {
    dfs(pos + 1, acc + one.toUpperCase())
  }
  if (pos + 1 < word.length) {
    const two: string = word.slice(pos, pos + 2)
    if (symbols.has(two)) {
      dfs(pos + 2, acc + two[0].toUpperCase() + two[1])
    }
  }
}

dfs(0, "")

if (results.length === 0) {
  console.log("none")
} else {
  results.sort()
  console.log(results.join("\n"))
}
