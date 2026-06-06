// @ts-nocheck
// 🎮 CodinGame Puzzle - histogram
// https://www.codingame.com/training/easy/histogram

const S = readline();

// Count occurrences of each letter (case-insensitive)
const counts = new Array(26).fill(0);
for (const ch of S) {
  const code = ch.toLowerCase().charCodeAt(0);
  if (code >= 97 && code <= 122) {
    counts[code - 97]++;
  }
}

const total = counts.reduce((a, b) => a + b, 0);

// Compute bar lengths (rounded percentage) and formatted percentage strings
const bars: number[] = [];
const pctStrs: string[] = [];
for (let i = 0; i < 26; i++) {
  const pct = (counts[i] / total) * 100;
  pctStrs.push(pct.toFixed(2) + '%');
  bars.push(Math.round(pct));
}

// Build a separator line for a given bar length (0 = just `  +`)
function sep(barLen: number): string {
  if (barLen === 0) return '  +';
  return '  +' + '-'.repeat(barLen) + '+';
}

// Build the shared separator between two adjacent non-zero bars of lengths a and b.
// Places `+` at position 0, min(a,b), and max(a,b).
function sharedSep(a: number, b: number): string {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  if (lo === hi) {
    return '  +' + '-'.repeat(lo) + '+';
  }
  return '  +' + '-'.repeat(lo) + '+' + '-'.repeat(hi - lo - 1) + '+';
}

const lines: string[] = [];

// State:
// - prevBarLen: the bar length of the previous non-zero letter (0 if none)
// - topAlreadyPrinted: true if the separator above the CURRENT letter has already been emitted
//   (this happens when the previous zero-bar letter already printed the next bar's top)

let prevBarLen = 0;
let topAlreadyPrinted = false;

for (let i = 0; i < 26; i++) {
  const letter = String.fromCharCode(65 + i);
  const barLen = bars[i];

  if (barLen > 0) {
    // Print top separator (if not already printed by previous zero-bar letter)
    if (!topAlreadyPrinted) {
      if (prevBarLen > 0) {
        lines.push(sharedSep(prevBarLen, barLen));
      } else {
        lines.push(sep(barLen));
      }
    }
    topAlreadyPrinted = false;

    // Print the letter line
    lines.push(`${letter} |${' '.repeat(barLen)}|${pctStrs[i]}`);
    prevBarLen = barLen;
  } else {
    // Zero bar
    // The separator above this letter: if previous was non-zero, print its bottom.
    // The histogram always opens with a top border, so when the very first letter
    // has no bar we still emit a `  +` above it (no previous letter printed it).
    if (!topAlreadyPrinted) {
      if (prevBarLen > 0) {
        lines.push(sep(prevBarLen));
      } else if (i === 0) {
        lines.push("  +");
      }
    }
    topAlreadyPrinted = false;

    // Print the letter line
    lines.push(`${letter} |${pctStrs[i]}`);

    // Print separator below.
    // This serves as the TOP separator for the next non-zero letter (if immediately next).
    // If next letter has a bar, we print sep(nextBarLen) and mark topAlreadyPrinted = true.
    // If next letter is zero, we print `  +`.
    const nextBarLen = i < 25 ? bars[i + 1] : 0;
    lines.push(sep(nextBarLen));
    if (nextBarLen > 0) {
      topAlreadyPrinted = true;
    }
    prevBarLen = 0; // Reset: after a zero-bar letter, no pending non-zero bar
  }
}

// Print the bottom separator of the last non-zero bar (if needed)
if (!topAlreadyPrinted && prevBarLen > 0) {
  lines.push(sep(prevBarLen));
}

console.log(lines.join('\n'));
