// @ts-nocheck
// 🎮 CodinGame Puzzle - number-derivation
// https://www.codingame.com/training/easy/number-derivation

const n = parseInt(readline());

// Factor n into prime factors and their exponents
function primeFactors(num: number): Map<number, number> {
  const factors = new Map<number, number>();
  let d = 2;
  while (d * d <= num) {
    while (num % d === 0) {
      factors.set(d, (factors.get(d) || 0) + 1);
      num = Math.floor(num / d);
    }
    d++;
  }
  if (num > 1) {
    factors.set(num, (factors.get(num) || 0) + 1);
  }
  return factors;
}

// The arithmetic derivative satisfies: n' = n * sum(e_i / p_i) for n = prod(p_i^e_i)
// Since we need exact integer results, compute as: sum over each prime factor p_i with exponent e_i of (n / p_i * e_i)
// n' = sum_i (e_i * n / p_i)  -- this gives integer result since p_i divides n at least e_i times

if (n === 1) {
  console.log(0);
} else {
  const factors = primeFactors(n);
  let result = 0;
  for (const [p, e] of factors) {
    result += e * (n / p);
  }
  console.log(result + 0);
}
