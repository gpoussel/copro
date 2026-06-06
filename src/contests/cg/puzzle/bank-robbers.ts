// @ts-nocheck
// 🎮 CodinGame Puzzle - bank-robbers
// https://www.codingame.com/training/easy/bank-robbers

const R = parseInt(readline());
const V = parseInt(readline());

// Compute the number of combinations per vault
const vaultTimes: number[] = [];
for (let i = 0; i < V; i++) {
    const [C, N] = readline().split(' ').map(Number);
    const vowels = C - N;
    const combinations = Math.pow(10, N) * Math.pow(5, vowels);
    vaultTimes.push(combinations);
}

// Simulate: each robber tracks when they finish their current vault
// Use a priority queue (simple array since R <= 5): robbers[i] = time when robber i becomes free
const robbers: number[] = new Array(R).fill(0);

for (let v = 0; v < V; v++) {
    // Find the robber who finishes earliest (becomes free first)
    let minIdx = 0;
    for (let r = 1; r < R; r++) {
        if (robbers[r] < robbers[minIdx]) {
            minIdx = r;
        }
    }
    // Assign vault v to that robber
    robbers[minIdx] += vaultTimes[v];
}

// The heist ends when all robbers finish
console.log(Math.max(...robbers));
