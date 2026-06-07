// @ts-nocheck
// 🎮 CodinGame Puzzle - mayan-calculation
// https://www.codingame.com/training/medium/mayan-calculation

const [L, H] = readline().split(' ').map(Number);

// Read the 20 glyph definitions
// Each of the H lines contains all 20 glyphs concatenated (each glyph is L wide)
const numeralLines: string[] = [];
for (let i = 0; i < H; i++) {
    numeralLines.push(readline());
}

// Extract glyph for digit d: array of H strings, each L chars
function getGlyph(d: number): string[] {
    const result: string[] = [];
    for (let row = 0; row < H; row++) {
        result.push(numeralLines[row].substring(d * L, (d + 1) * L));
    }
    return result;
}

// Build a map from glyph fingerprint -> digit value
const glyphMap = new Map<string, number>();
for (let d = 0; d < 20; d++) {
    const glyph = getGlyph(d);
    const key = glyph.join('\n');
    glyphMap.set(key, d);
}

// Parse a Mayan number from its lines (S lines of L chars each, top = highest power)
function parseMayanNumber(lines: string[]): bigint {
    const numDigits = lines.length / H;
    let value = BigInt(0);
    // sections go from top (highest power) to bottom (lowest power = 20^0)
    for (let sec = 0; sec < numDigits; sec++) {
        const sectionLines: string[] = [];
        for (let row = 0; row < H; row++) {
            sectionLines.push(lines[sec * H + row]);
        }
        const key = sectionLines.join('\n');
        const digit = glyphMap.get(key);
        if (digit === undefined) {
            throw new Error('Unknown glyph: ' + key);
        }
        value = value * BigInt(20) + BigInt(digit);
    }
    return value;
}

// Read first number
const S1 = Number(readline());
const num1Lines: string[] = [];
for (let i = 0; i < S1; i++) {
    num1Lines.push(readline());
}

// Read second number
const S2 = Number(readline());
const num2Lines: string[] = [];
for (let i = 0; i < S2; i++) {
    num2Lines.push(readline());
}

// Read operation
const operation = readline().trim();

const val1 = parseMayanNumber(num1Lines);
const val2 = parseMayanNumber(num2Lines);

let result: bigint;
if (operation === '+') {
    result = val1 + val2;
} else if (operation === '-') {
    result = val1 - val2;
} else if (operation === '*') {
    result = val1 * val2;
} else {
    result = val1 / val2;
}

// Convert result to Mayan digits (base 20), most significant first
function toMayanDigits(n: bigint): number[] {
    if (n === BigInt(0)) {
        return [0];
    }
    const digits: number[] = [];
    while (n > BigInt(0)) {
        digits.unshift(Number(n % BigInt(20)));
        n = n / BigInt(20);
    }
    return digits;
}

const digits = toMayanDigits(result);

// Output each digit as a glyph
for (const d of digits) {
    const glyph = getGlyph(d);
    for (const row of glyph) {
        console.log(row);
    }
}
