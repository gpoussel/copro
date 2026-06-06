// @ts-nocheck
// 🎮 CodinGame Puzzle - brackets-extreme-edition
// https://www.codingame.com/training/easy/brackets-extreme-edition

const expression = readline();

const stack: string[] = [];
const open = new Set(['(', '[', '{']);
const close: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

let valid = true;

for (const ch of expression) {
  if (open.has(ch)) {
    stack.push(ch);
  } else if (close[ch] !== undefined) {
    if (stack.length === 0 || stack[stack.length - 1] !== close[ch]) {
      valid = false;
      break;
    }
    stack.pop();
  }
}

if (stack.length > 0) valid = false;

console.log(valid ? 'true' : 'false');
