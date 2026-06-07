// @ts-nocheck
// 🎮 CodinGame Puzzle - personal-best
// https://www.codingame.com/training/easy/personal-best

const gymnasts = readline().split(',').map(s => s.trim());
const categories = readline().split(',').map(s => s.trim());
const N = parseInt(readline());

// category index mapping: bars=0, beam=1, floor=2
const categoryIndex = { bars: 0, beam: 1, floor: 2 };

// For each gymnast, track best score per category
const bests: Record<string, number[]> = {};
for (const g of gymnasts) {
    bests[g] = [-Infinity, -Infinity, -Infinity];
}

for (let i = 0; i < N; i++) {
    const row = readline();
    // Find the last occurrence of comma-separated scores
    // Format: name,bars,beam,floor
    // Name may contain commas? No — looking at examples, names have spaces but no commas.
    // Split on comma, last 3 tokens are scores, everything before is name.
    const parts = row.split(',');
    const scores = parts.slice(-3).map(Number);
    const name = parts.slice(0, -3).join(',').trim();

    if (bests[name] !== undefined) {
        for (let c = 0; c < 3; c++) {
            if (scores[c] > bests[name][c]) {
                bests[name][c] = scores[c];
            }
        }
    }
}

for (const gymnast of gymnasts) {
    const line = categories.map(cat => {
        const idx = categoryIndex[cat];
        const val = bests[gymnast][idx];
        // Format: if integer, print without decimals; otherwise print as-is
        // The expected output for "9" is "9", for "8.3" is "8.3"
        // We should preserve minimal decimal representation
        return String(val + 0);
    }).join(',');
    console.log(line);
}
