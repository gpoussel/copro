// @ts-nocheck
// 🎮 CodinGame Puzzle - reverse-fizzbuzz
// https://www.codingame.com/training/easy/reverse-fizzbuzz

const n = parseInt(readline());
const lines = [];
for (let i = 0; i < n; i++) {
    lines.push(readline());
}

// Find all numeric positions in the sequence — they tell us the actual numbers.
// Strategy: find a run of numbers and use them to anchor the sequence.
// From numbers, we can work out the starting offset and then check multiples.

// Find the first number in the sequence to determine starting position.
// If lines[i] is a number, then lines[i] represents (startNum + i) where startNum is the real first number.
// If lines[0] is Fizz/Buzz/FizzBuzz, we need to find the start indirectly.

// Approach: collect number values and their indices. Use two adjacent numbers to find step (should be 1).
// Then deduce startNum from (value - index). After knowing the real numbers for each position:
// f = period of Fizz (not FizzBuzz) occurrences.
// b = period of Buzz (not FizzBuzz) occurrences.
// When f == b, FizzBuzz appears every f lines and there are no pure Fizz or pure Buzz.

// Find actual numbers for each line index.
// numbers[i] is the real integer that position i represents.
let startNum = null;

// Try to find startNum from any numeric line.
for (let i = 0; i < lines.length; i++) {
    if (/^\d+$/.test(lines[i])) {
        startNum = parseInt(lines[i]) - i;
        break;
    }
}

// If no numeric line found, all lines are Fizz/Buzz/FizzBuzz.
// In that case every position is either fizz, buzz, or fizzbuzz.
// We need another strategy: find from FizzBuzz positions.
// FizzBuzz appears at multiples of lcm(f,b). The distance between consecutive FizzBuzz is lcm(f,b).
// Fizz appears every f positions, Buzz every b positions.
// But if no numbers, f divides every position in the range and b divides every position? No.
// Actually if all are fizz/buzz/fizzbuzz: f=1 or b=1 (or both).
// f=1 means everything is Fizz or FizzBuzz. b=1 means everything is Buzz or FizzBuzz.
// In the "Everything is Fizz" test case: f=1, b=5.
// If f=1: every position is Fizz (or FizzBuzz if also divisible by b).
// Then Buzz appears at multiples of b. FizzBuzz appears at multiples of b too (since f=1 divides all).
// Actually if f=1, then multiples of f = all numbers. And for those also divisible by b, print FizzBuzz. Otherwise Fizz.
// So in this case lines[i] is either Fizz or FizzBuzz, and FizzBuzz period = b.
// Similarly if b=1: lines[i] is Buzz or FizzBuzz, FizzBuzz period = f.
// If both f=1,b=1: everything is FizzBuzz.

if (startNum === null) {
    // All lines are Fizz/Buzz/FizzBuzz. Find period of FizzBuzz if present.
    // Find indices of FizzBuzz
    const fizzBuzzIndices = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === 'FizzBuzz') fizzBuzzIndices.push(i);
    }
    // Find indices of pure Fizz
    const fizzOnlyIndices = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === 'Fizz') fizzOnlyIndices.push(i);
    }
    // Find indices of pure Buzz
    const buzzOnlyIndices = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === 'Buzz') buzzOnlyIndices.push(i);
    }

    // All Fizz or FizzBuzz: f=1, determine b from FizzBuzz period
    if (buzzOnlyIndices.length === 0) {
        // f=1, b = period of FizzBuzz in the sequence
        // startNum is unknown but we know FizzBuzz means divisible by b.
        // Since all positions are Fizz or FizzBuzz, f=1.
        // FizzBuzz period = b (since f=1, FizzBuzz = multiple of b).
        if (fizzBuzzIndices.length >= 2) {
            const b = fizzBuzzIndices[1] - fizzBuzzIndices[0];
            // startNum: at fizzBuzzIndices[0], the real number is a multiple of b.
            // We need startNum. Real number at fizzBuzzIndices[0] = startNum + fizzBuzzIndices[0].
            // That must be divisible by b.
            // We can deduce startNum modulo b: startNum ≡ -fizzBuzzIndices[0] (mod b).
            // Then startNum = (b - fizzBuzzIndices[0] % b) % b, or some multiple.
            // But we only need to output f and b.
            console.log(1 + ' ' + b);
        } else if (fizzBuzzIndices.length === 1) {
            // Only one FizzBuzz, hard to determine b precisely, but n could be short.
            // Check if all other lines are Fizz. If so f=1, b > n, but b < 60.
            // FizzBuzz at position i means (startNum+i) divisible by b.
            // Fizz at all others means (startNum+j) divisible by 1 (always) but not b.
            // b must be > 1. The real number at fizzBuzzIndices[0] is divisible by b.
            // We need more info — but with only one FizzBuzz, b could be anything that divides one number in range.
            // Brute force: try all b 2..59.
            // For each b, find what startNum would be. Then verify all lines.
            let foundF = null, foundB = null;
            outer: for (let b = 2; b < 60; b++) {
                for (let s = 1; s <= 1000; s++) {
                    // startNum = s
                    let valid = true;
                    for (let i = 0; i < n; i++) {
                        const num = s + i;
                        const fizz = (num % 1 === 0);
                        const buzz = (num % b === 0);
                        let expected;
                        if (fizz && buzz) expected = 'FizzBuzz';
                        else if (fizz) expected = 'Fizz';
                        else if (buzz) expected = 'Buzz';
                        else expected = String(num);
                        if (expected !== lines[i]) { valid = false; break; }
                    }
                    if (valid) { foundF = 1; foundB = b; break outer; }
                }
            }
            console.log(foundF + ' ' + foundB);
        } else {
            // No FizzBuzz at all, everything is Fizz. f=1, b > n or b doesn't appear.
            // b must be chosen such that no multiple of b is in range. Since f=1.
            // This means b must not divide any number in [startNum, startNum+n-1].
            // Brute force.
            let foundF = null, foundB = null;
            outer: for (let b = 2; b < 60; b++) {
                for (let s = 1; s <= 10000; s++) {
                    let valid = true;
                    for (let i = 0; i < n; i++) {
                        const num = s + i;
                        const buzz = (num % b === 0);
                        let expected = buzz ? 'FizzBuzz' : 'Fizz';
                        if (expected !== lines[i]) { valid = false; break; }
                    }
                    if (valid) { foundF = 1; foundB = b; break outer; }
                }
            }
            console.log(foundF + ' ' + foundB);
        }
    } else if (fizzOnlyIndices.length === 0) {
        // b=1, f = period of FizzBuzz (since b=1 means all are Buzz or FizzBuzz)
        if (fizzBuzzIndices.length >= 2) {
            const f = fizzBuzzIndices[1] - fizzBuzzIndices[0];
            console.log(f + ' ' + 1);
        } else {
            // Brute force
            let foundF = null, foundB = null;
            outer: for (let f = 1; f < 60; f++) {
                for (let s = 1; s <= 10000; s++) {
                    let valid = true;
                    for (let i = 0; i < n; i++) {
                        const num = s + i;
                        const fizz = (num % f === 0);
                        let expected = fizz ? 'FizzBuzz' : 'Buzz';
                        if (expected !== lines[i]) { valid = false; break; }
                    }
                    if (valid) { foundF = f; foundB = 1; break outer; }
                }
            }
            console.log(foundF + ' ' + foundB);
        }
    } else {
        // Mix of Fizz, Buzz, FizzBuzz (no plain numbers). Brute force all f,b,startNum.
        let foundF = null, foundB = null;
        outer: for (let f = 1; f < 60; f++) {
            for (let b = 1; b < 60; b++) {
                for (let s = 1; s <= 10000; s++) {
                    let valid = true;
                    for (let i = 0; i < n; i++) {
                        const num = s + i;
                        const fizz = (num % f === 0);
                        const buzz = (num % b === 0);
                        let expected;
                        if (fizz && buzz) expected = 'FizzBuzz';
                        else if (fizz) expected = 'Fizz';
                        else if (buzz) expected = 'Buzz';
                        else expected = String(num);
                        if (expected !== lines[i]) { valid = false; break; }
                    }
                    if (valid) { foundF = f; foundB = b; break outer; }
                }
            }
        }
        console.log(foundF + ' ' + foundB);
    }
} else {
    // We know startNum. Now brute-force f and b.
    // For each candidate f,b: simulate and check all lines.
    let foundF = null, foundB = null;
    outer: for (let f = 1; f < 60; f++) {
        for (let b = 1; b < 60; b++) {
            let valid = true;
            for (let i = 0; i < n; i++) {
                const num = startNum + i;
                const fizz = (num % f === 0);
                const buzz = (num % b === 0);
                let expected;
                if (fizz && buzz) expected = 'FizzBuzz';
                else if (fizz) expected = 'Fizz';
                else if (buzz) expected = 'Buzz';
                else expected = String(num);
                if (expected !== lines[i]) { valid = false; break; }
            }
            if (valid) { foundF = f; foundB = b; break outer; }
        }
    }
    console.log(foundF + ' ' + foundB);
}
