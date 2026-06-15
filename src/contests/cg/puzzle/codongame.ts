// 🎮 CodinGame Puzzle - codongame
// https://www.codingame.com/training/easy/codongame

const table: Record<string, string> = {
  UUU: "F",
  CUU: "L",
  AUU: "I",
  GUU: "V",
  UUC: "F",
  CUC: "L",
  AUC: "I",
  GUC: "V",
  UUA: "L",
  CUA: "L",
  AUA: "I",
  GUA: "V",
  UUG: "L",
  CUG: "L",
  AUG: "M",
  GUG: "V",
  UCU: "S",
  CCU: "P",
  ACU: "T",
  GCU: "A",
  UCC: "S",
  CCC: "P",
  ACC: "T",
  GCC: "A",
  UCA: "S",
  CCA: "P",
  ACA: "T",
  GCA: "A",
  UCG: "S",
  CCG: "P",
  ACG: "T",
  GCG: "A",
  UAU: "Y",
  CAU: "H",
  AAU: "N",
  GAU: "D",
  UAC: "Y",
  CAC: "H",
  AAC: "N",
  GAC: "D",
  UAA: "Stop",
  CAA: "Q",
  AAA: "K",
  GAA: "E",
  UAG: "Stop",
  CAG: "Q",
  AAG: "K",
  GAG: "E",
  UGU: "C",
  CGU: "R",
  AGU: "S",
  GGU: "G",
  UGC: "C",
  CGC: "R",
  AGC: "S",
  GGC: "G",
  UGA: "Stop",
  CGA: "R",
  AGA: "R",
  GGA: "G",
  UGG: "W",
  CGG: "R",
  AGG: "R",
  GGG: "G",
}

function translate(rna: string, start: number): string[] {
  const sequences: string[] = []
  let opened = false
  let current = ""
  for (let i = start; i + 3 <= rna.length; i += 3) {
    const codon = rna.slice(i, i + 3)
    const amino = table[codon]
    if (!opened) {
      if (codon === "AUG") {
        opened = true
        current = "M"
      }
      continue
    }
    if (amino === "Stop") {
      sequences.push(current)
      opened = false
      current = ""
      continue
    }
    current += amino
  }
  return sequences
}

function aminoCount(sequences: string[]): number {
  let total = 0
  for (const s of sequences) total += s.length
  return total
}

const n = parseInt(readline(), 10)
const out: string[] = []
for (let k = 0; k < n; k++) {
  const rna = readline()
  let best: string[] = []
  let bestCount = -1
  for (let start = 0; start < 3; start++) {
    const seqs = translate(rna, start)
    const count = aminoCount(seqs)
    if (count > bestCount) {
      bestCount = count
      best = seqs
    }
  }
  out.push(best.join("-"))
}
console.log(out.join("\n"))
