// @ts-nocheck
// 🎮 CodinGame Puzzle - minicpu-instruction-decoder
// https://www.codingame.com/training/easy/minicpu-instruction-decoder

const bytes = readline().split(' ').map(b => parseInt(b, 16));
const reg = [0, 0, 0, 0];

let ip = 0;
while (ip < bytes.length) {
    const op = bytes[ip];
    if (op === 0xFF) {
        // HLT — but only if this is the opcode position, not an operand
        // We need to distinguish HLT opcode from 0xFF as immediate value V.
        // The program is parsed sequentially; we consume operands properly.
        break;
    } else if (op === 0x01) {
        // MOV Rx, V
        const x = bytes[ip + 1];
        const v = bytes[ip + 2];
        reg[x] = v;
        ip += 3;
    } else if (op === 0x02) {
        // ADD Rx, Ry
        const x = bytes[ip + 1];
        const y = bytes[ip + 2];
        reg[x] = (reg[x] + reg[y]) & 0xFF;
        ip += 3;
    } else if (op === 0x03) {
        // SUB Rx, Ry
        const x = bytes[ip + 1];
        const y = bytes[ip + 2];
        reg[x] = (reg[x] - reg[y] + 256) & 0xFF;
        ip += 3;
    } else if (op === 0x04) {
        // MUL Rx, Ry
        const x = bytes[ip + 1];
        const y = bytes[ip + 2];
        reg[x] = (reg[x] * reg[y]) & 0xFF;
        ip += 3;
    } else if (op === 0x05) {
        // INC Rx
        const x = bytes[ip + 1];
        reg[x] = (reg[x] + 1) & 0xFF;
        ip += 2;
    } else if (op === 0x06) {
        // DEC Rx
        const x = bytes[ip + 1];
        reg[x] = (reg[x] - 1 + 256) & 0xFF;
        ip += 2;
    } else {
        // Unknown opcode — skip
        ip += 1;
    }
}

console.log(reg[0]);
console.log(reg[1]);
console.log(reg[2]);
console.log(reg[3]);
