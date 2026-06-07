// @ts-nocheck
// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

const n: number = parseInt(readline());
const root: Record<string, any> = {};
let cableUnits: number = 0;

for (let i = 0; i < n; i++) {
  const number: string = readline().trim();
  let node: Record<string, any> = root;
  for (const digit of number) {
    if (!(digit in node)) {
      node[digit] = {};
      cableUnits++;
    }
    node = node[digit];
  }
}

console.log(cableUnits);
