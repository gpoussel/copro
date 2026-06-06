// @ts-nocheck
// 🎮 CodinGame Puzzle - walk-on-a-die
// https://www.codingame.com/training/easy/walk-on-a-die

// Input format:
//   Line 1: " F"   — whitespace + front face number
//   Line 2: "LCRT" — left, current, right, top (face "opposite you" = top of die)
//   Line 3: " B"   — whitespace + back face number (behind you)
//   Line 4: commands string of U/L/D/R
//
// Movement model: each command = optional turn + roll forward.
//   U → roll forward
//   D → turn 180° + roll forward
//   L → turn left  + roll forward
//   R → turn right + roll forward
//
// Roll forward: current←front, back←current, front←top, top←back  (left/right unchanged)
// Turn left:    front←left, right←front, back←right, left←back    (cur/top unchanged)
// Turn right:   front←right, left←front, back←left, right←back    (cur/top unchanged)
// Turn 180°:    front←back, back←front, left←right, right←left    (cur/top unchanged)

const line1 = readline();
const line2 = readline();
const line3 = readline();
const commands = readline();

interface DieState {
  cur: number;
  front: number;
  back: number;
  left: number;
  right: number;
  top: number;
}

function rollForward(d: DieState): DieState {
  return { cur: d.front, back: d.cur, front: d.top, top: d.back, left: d.left, right: d.right };
}

function turnLeft(d: DieState): DieState {
  return { cur: d.cur, top: d.top, front: d.left, right: d.front, back: d.right, left: d.back };
}

function turnRight(d: DieState): DieState {
  return { cur: d.cur, top: d.top, front: d.right, left: d.front, back: d.left, right: d.back };
}

function turn180(d: DieState): DieState {
  return { cur: d.cur, top: d.top, front: d.back, back: d.front, left: d.right, right: d.left };
}

let die: DieState = {
  cur: parseInt(line2[1]),
  front: parseInt(line1.trim()),
  back: parseInt(line3.trim()),
  left: parseInt(line2[0]),
  right: parseInt(line2[2]),
  top: parseInt(line2[3]),
};

for (const cmd of commands) {
  if (cmd === 'U') {
    die = rollForward(die);
  } else if (cmd === 'D') {
    die = rollForward(turn180(die));
  } else if (cmd === 'L') {
    die = rollForward(turnLeft(die));
  } else if (cmd === 'R') {
    die = rollForward(turnRight(die));
  }
}

console.log(die.cur);
