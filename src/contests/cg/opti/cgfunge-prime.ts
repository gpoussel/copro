// 🎮 CodinGame Optimization - cgfunge-prime
// https://www.codingame.com/training/optim/cgfunge-prime
//
// Print a CGFunge program (<= 30 lines x 40 cols) that says PRIME / NOT PRIME for the
// N (1..10000) initially on the stack. Score = executed steps (referee Points = turn-1),
// summed over the 100 validators (public in eulerscheZahl/CGFunge-Prime config/*.json).
//
// Approach: unrolled trial division by the 25 primes < 100, one block per grid column,
// laid out as a vertical zig-zag (down column, up column, ...). ':' turns right on >0 and
// left on <0, so a down column must continue on a negative value and an up column on a
// positive one: the stack holds +N or -N (flip = "01X-") and each test uses either
// "DD p/p*-:" (sign of N mod p follows N) or "DD p/p*1X-:" (opposite sign). The zero
// case (p | N) goes straight into an exit route. Cutoffs "N < p^2 -> PRIME" are "D c/:"
// or "D0 c-/:". Numbers are pushed as one unicode char in string mode ("<char>").
// Exits are routed (Dijkstra, S-skips to cross the main path) to one NOT PRIME and one
// PRIME printer on the last row. The grid is generated offline by
// cgfunge-prime-tools/build.mjs and emitted by emit.mjs; this program only prints it.

// Grid rows; "`hhhh" = char with that hex code (quotes, control chars, unicode numbers).
const FUNGE_ROWS: string[] = [
  "v                                       ",
  "                         >     v        ",
  "                    >         v         ",
  " >   > > > > > > > >   >S S> v          ",
  " :v                      :v:v           ",
  " -D>  S             ^    - -D           ",
  " *D    :v           ^< :vX XD           ",
  "D23    -D              -D1D1`0022           ",
  "0//:v  *D:v            XD*D*a           ",
  "423/D  `00229-D            1`0022`0022`0022`0022`0022           ",
  "-D*`0022D:v`000b4*D:v:v:v:v:v:v*IOSY/           ",
  "/D1`00195-D`0022+`0022`0022-D-D-D-D-D/D`0022`0022`0022`0022`0022`0022           ",
  ":^X`0022/*0//`0011`0013*D*D*D*D*D`0022DG////a           ",
  "1 -D57`0022`00229`0022`0022`0022`0022`0022`0022`0022`0022`0022`0022`0022`0022`1189`0022`0022`0022`0022`0022`0022`0022           ",
  "1 :^*/y`000b4//`0017`001d`001f%)+/5;=`0022C/IOSY*           ",
  "X   17`0022`0022+`0022`0022`0022`0022`0022`0022`0022`0022`0022`0022`0022`0022D`0022`0022`0022`0022`0022`0022-S          ",
  "-   XD-D*`0011`0013////////// /G*D*D: v         ",
  ":  v-D/D1`0022`0022`0022`0022`0022`0022`0022`0022`0022`0022`0022`0022 `0022`0022-D-D            ",
  "    :^:^XD*`0017`001d`001f%)+/5;= CD:^:^  > v       ",
  "  v <   -D1`0022`0022`0022`0022`0022`0022`0022`0022`0022`0022 `0022Dv < <v <>v      ",
  "   >  v :^XD*D*D*D*D* *-                ",
  "  v     < -D1D1D1D1D1 1X                ",
  "      > v :^X X X X X X1                ",
  "            - - - - - -0   v <   >v     ",
  "            :^:^:^:^:^:^  v<            ",
  " v<       < <S S S S S S< <             ",
  "v<      >                         >v    ",
  "v             < < < < <            > v  ",
  "                                     > v",
  ">`0022EMIRP TON`0022CCCCCCCCCE    ECCCCC`0022PRIME`0022<",
]

console.log(FUNGE_ROWS.length)
for (const row of FUNGE_ROWS)
  console.log(row.replace(/`([0-9a-f]{4})/g, (_m: string, h: string) => String.fromCharCode(parseInt(h, 16))))
