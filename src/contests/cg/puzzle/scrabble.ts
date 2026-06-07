// @ts-nocheck
// 🎮 CodinGame Puzzle - scrabble
// https://www.codingame.com/training/medium/scrabble

const SCORES: Record<string, number> = {
  e: 1, a: 1, i: 1, o: 1, n: 1, r: 1, t: 1, l: 1, s: 1, u: 1,
  d: 2, g: 2,
  b: 3, c: 3, m: 3, p: 3,
  f: 4, h: 4, v: 4, w: 4, y: 4,
  k: 5,
  j: 8, x: 8,
  q: 10, z: 10,
};

function wordScore(word: string): number {
  let score = 0;
  for (let i = 0; i < word.length; i++) {
    score += SCORES[word[i]] || 0;
  }
  return score;
}

function canBuild(word: string, available: Map<string, number>): boolean {
  const need = new Map<string, number>();
  for (let i = 0; i < word.length; i++) {
    const c = word[i];
    need.set(c, (need.get(c) || 0) + 1);
  }
  for (const [c, count] of need) {
    if ((available.get(c) || 0) < count) return false;
  }
  return true;
}

const n: number = parseInt(readline());
const words: string[] = [];
for (let i = 0; i < n; i++) {
  words.push(readline());
}
const letters: string = readline();

const available = new Map<string, number>();
for (let i = 0; i < letters.length; i++) {
  const c = letters[i];
  available.set(c, (available.get(c) || 0) + 1);
}

let bestWord = "";
let bestScore = -1;

for (const word of words) {
  if (canBuild(word, available)) {
    const score = wordScore(word);
    if (score > bestScore) {
      bestScore = score;
      bestWord = word;
    }
  }
}

console.log(bestWord);
