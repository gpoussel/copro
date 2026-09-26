// 🎮 CodinGame Puzzle - literary-alfabet-soupe
// https://www.codingame.com/training/medium/literary-alfabet-soupe

// [name, excluded ASCII letters, extra letters] (built from char codes: the
// CodinGame submission pipeline mangles non-ASCII source text)
const chars = (...codes: number[]) => String.fromCharCode(...codes)
const LANGUAGES: [string, string, string][] = [
  ["Danish", "qz", chars(0x00e6, 0x00e5, 0x00f8)],
  ["English", "", ""],
  ["Estonian", "cfqwxy", chars(0x0161, 0x017e, 0x00f5, 0x00e4, 0x00f6, 0x00fc)],
  ["Finnish", "bfqwx", chars(0x00e4, 0x00f6)],
  ["French", "", chars(0x00e7, 0x0153, 0x00eb, 0x00ef, 0x00fc, 0x00e0, 0x00e8, 0x00f9, 0x00e2, 0x00ea, 0x00ee, 0x00f4, 0x00fb, 0x00e9)],
  ["German", "", chars(0x00df, 0x00e4, 0x00f6, 0x00fc)],
  ["Irish", "jkqvwxyz", chars(0x00e1, 0x00e9, 0x00ed, 0x00f3, 0x00fa)],
  ["Italian", "jkwxy", chars(0x00e0, 0x00e8, 0x00ec, 0x00f2, 0x00f9, 0x00e9)],
  ["Portuguese", "kw", chars(0x00e7, 0x00e3, 0x00f5, 0x00e0, 0x00e2, 0x00ea, 0x00f4, 0x00e1, 0x00e9, 0x00ed, 0x00f3, 0x00fa)],
  ["Spanish", "kw", chars(0x00f1, 0x00fc, 0x00e1, 0x00e9, 0x00ed, 0x00f3, 0x00fa)],
  ["Swedish", "qw", chars(0x00e5, 0x00e4, 0x00f6)],
  ["Turkish", "qwx", chars(0x011f, 0x00e7, 0x015f, 0x0130, 0x0131, 0x00f6, 0x00fc)],
  ["Welsh", "jkqvxz", chars(0x0175, 0x0177, 0x00e2, 0x00ea, 0x00ee, 0x00f4, 0x00fb)],
]
const ASCII = "abcdefghijklmnopqrstuvwxyz"
const SPECIAL = LANGUAGES.map(l => l[2]).join("")

// Distinct letters used by an excerpt (lowercased, capital dotted I kept as is)
const lettersOf = (text: string): string[] => {
  const seen: { [c: string]: boolean } = {}
  for (const raw of text.normalize("NFC").split("")) {
    const c = raw === chars(0x0130) ? raw : raw.toLowerCase()
    if (ASCII.indexOf(c) >= 0 || SPECIAL.indexOf(c) >= 0) seen[c] = true
  }
  return Object.keys(seen)
}

const N = LANGUAGES.length
const excerpts: string[][] = []
for (let i = 0; i < N; i++) excerpts.push(lettersOf(readline()))

// weight[i][j]: -1 if excerpt i cannot be language j, else number of language-specific letters used
const weight = excerpts.map(letters =>
  LANGUAGES.map(([, excluded, extra]) => {
    let w = 0
    for (const c of letters) {
      if (ASCII.indexOf(c) >= 0) {
        if (excluded.indexOf(c) >= 0) return -1
      } else if (extra.indexOf(c) >= 0) w++
      else return -1
    }
    return w
  }),
)

// Max-weight perfect assignment via DP over the bitmask of used languages
const FULL = 1 << N
const NONE = -Infinity
const best: number[][] = []
for (let i = 0; i <= N; i++) best.push(new Array<number>(FULL).fill(NONE))
best[N][FULL - 1] = 0
for (let i = N - 1; i >= 0; i--) {
  for (let mask = 0; mask < FULL; mask++) {
    for (let j = 0; j < N; j++) {
      if (mask & (1 << j) || weight[i][j] < 0) continue
      const v = weight[i][j] + best[i + 1][mask | (1 << j)]
      if (v > best[i][mask]) best[i][mask] = v
    }
  }
}

let mask = 0
for (let i = 0; i < N; i++) {
  for (let j = 0; j < N; j++) {
    if (mask & (1 << j) || weight[i][j] < 0) continue
    if (weight[i][j] + best[i + 1][mask | (1 << j)] === best[i][mask]) {
      console.log(LANGUAGES[j][0])
      mask |= 1 << j
      break
    }
  }
}
