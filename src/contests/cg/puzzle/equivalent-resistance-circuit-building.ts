// @ts-nocheck
// 🎮 CodinGame Puzzle - equivalent-resistance-circuit-building
// https://www.codingame.com/training/easy/equivalent-resistance-circuit-building

const N = parseInt(readline());
const resistors: Record<string, number> = {};
for (let i = 0; i < N; i++) {
  const parts = readline().split(' ');
  resistors[parts[0]] = parseInt(parts[1]);
}

const circuit = readline();
// Tokenize: split into tokens (parentheses, brackets, and names)
const tokens = circuit.split(/\s+/).filter(t => t.length > 0);

let pos = 0;

function parse(): number {
  const token = tokens[pos];
  if (token === '(') {
    // Series: sum of all contained resistances
    pos++; // consume '('
    let total = 0;
    while (tokens[pos] !== ')') {
      total += parse();
    }
    pos++; // consume ')'
    return total;
  } else if (token === '[') {
    // Parallel: 1 / sum(1/R_i)
    pos++; // consume '['
    let sumInverse = 0;
    while (tokens[pos] !== ']') {
      sumInverse += 1 / parse();
    }
    pos++; // consume ']'
    return 1 / sumInverse;
  } else {
    // Named resistor
    pos++;
    return resistors[token];
  }
}

const result = parse();
console.log(result.toFixed(1));
