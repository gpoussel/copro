// @ts-nocheck
// 🎮 CodinGame Puzzle - simple-auto-scaling
// https://www.codingame.com/training/easy/simple-auto-scaling

const [S, M] = readline().split(' ').map(Number);
const maxClients = readline().split(' ').map(Number);

// Track current number of running instances per service
const running = new Array(S).fill(0);

for (let i = 0; i < M; i++) {
    const clients = readline().split(' ').map(Number);
    const output: number[] = [];

    for (let s = 0; s < S; s++) {
        const needed = clients[s] === 0 ? 0 : Math.ceil(clients[s] / maxClients[s]);
        const delta = needed - running[s];
        running[s] = needed;
        output.push(delta);
    }

    console.log(output.join(' '));
}
