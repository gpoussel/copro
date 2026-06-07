// @ts-nocheck
// 🎮 CodinGame Puzzle - the-resistance
// https://www.codingame.com/training/expert/the-resistance

// Morse alphabet
const MORSE: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
};

function wordToMorse(word: string): string {
  let result: string = "";
  for (let i: number = 0; i < word.length; i++) {
    result += MORSE[word[i]];
  }
  return result;
}

const morseSeq: string = readline();
const n: number = parseInt(readline());

// Map from morse code -> count of words with that morse code
const morseCount: Map<string, bigint> = new Map<string, bigint>();

for (let i: number = 0; i < n; i++) {
  const word: string = readline().trim().toUpperCase();
  const morse: string = wordToMorse(word);
  const prev: bigint = morseCount.get(morse) ?? 0n;
  morseCount.set(morse, prev + 1n);
}

// Group morse codes by length for efficient lookup
const byLength: Map<number, Map<string, bigint>> = new Map<number, Map<string, bigint>>();
for (const [morse, cnt] of morseCount) {
  const len: number = morse.length;
  if (!byLength.has(len)) {
    byLength.set(len, new Map<string, bigint>());
  }
  byLength.get(len)!.set(morse, cnt);
}

const L: number = morseSeq.length;

// dp[i] = number of ways to decode morseSeq[i..L-1]
// dp[L] = 1 (empty suffix = one way: no words)
const dp: BigInt64Array = new BigInt64Array(L + 1);
dp[L] = 1n;

for (let i: number = L - 1; i >= 0; i--) {
  let ways: bigint = 0n;
  for (const [len, codeMap] of byLength) {
    const end: number = i + len;
    if (end > L) continue;
    const sub: string = morseSeq.substring(i, end);
    const cnt: bigint | undefined = codeMap.get(sub);
    if (cnt !== undefined) {
      ways += cnt * dp[end];
    }
  }
  dp[i] = ways;
}

console.log(dp[0].toString());
