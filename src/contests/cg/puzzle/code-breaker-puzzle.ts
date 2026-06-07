// @ts-nocheck
// 🎮 CodinGame Puzzle - code-breaker-puzzle
// https://www.codingame.com/training/medium/code-breaker-puzzle

const ALPHABET = readline();
const MESSAGE = readline();
const WORD = readline();

const L = ALPHABET.length;

// Build lookup: character -> index in alphabet
const charIndex = new Map();
for (let i = 0; i < L; i++) {
    charIndex.set(ALPHABET[i], i);
}

// Encoding: encoded_char = ((plain_index + A) * B) % L
// Decoding: plain_index = ((encoded_index * B_inv) - A + L) % L
// where B_inv is the modular inverse of B mod L

// Helper: modular inverse using extended Euclidean algorithm
function modInverse(b, m) {
    // Returns x such that (b * x) % m === 1, or -1 if not invertible
    let [old_r, r] = [b, m];
    let [old_s, s] = [1, 0];
    while (r !== 0) {
        const q = Math.floor(old_r / r);
        [old_r, r] = [r, old_r - q * r];
        [old_s, s] = [s, old_s - q * s];
    }
    if (old_r !== 1) return -1; // not invertible (gcd != 1)
    return ((old_s % m) + m) % m;
}

// Try to decode MESSAGE using shift A and multiply B
// Returns decoded string or null if any character is not in alphabet
function decode(A, B) {
    const bInv = modInverse(B, L);
    if (bInv === -1) return null;

    let result = '';
    for (let i = 0; i < MESSAGE.length; i++) {
        const encIdx = charIndex.get(MESSAGE[i]);
        if (encIdx === undefined) return null;
        // encoded = ((plain + A) * B) % L
        // => plain = (encoded * bInv - A + L) % L (but may need multiple L)
        const plainIdx = (((encIdx * bInv) % L) - A % L + L) % L;
        result += ALPHABET[plainIdx];
    }
    return result;
}

// Brute-force A (0..L-1) and B (1..L-1)
// Check if decoded message contains WORD
let answer = null;

outer:
for (let B = 1; B < L; B++) {
    for (let A = 0; A < L; A++) {
        const decoded = decode(A, B);
        if (decoded !== null && decoded.includes(WORD)) {
            answer = decoded;
            break outer;
        }
    }
}

console.log(answer);
