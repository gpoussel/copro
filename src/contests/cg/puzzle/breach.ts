// @ts-nocheck
// 🎮 CodinGame Puzzle - breach
// https://www.codingame.com/training/expert/breach

// Periodic table element symbols indexed by atomic number
const PERIODIC: Map<number, string> = new Map<number, string>([
  [1,"H"],[2,"He"],[3,"Li"],[4,"Be"],[5,"B"],[6,"C"],[7,"N"],[8,"O"],[9,"F"],[10,"Ne"],
  [11,"Na"],[12,"Mg"],[13,"Al"],[14,"Si"],[15,"P"],[16,"S"],[17,"Cl"],[18,"Ar"],[19,"K"],[20,"Ca"],
  [21,"Sc"],[22,"Ti"],[23,"V"],[24,"Cr"],[25,"Mn"],[26,"Fe"],[27,"Co"],[28,"Ni"],[29,"Cu"],[30,"Zn"],
  [31,"Ga"],[32,"Ge"],[33,"As"],[34,"Se"],[35,"Br"],[36,"Kr"],[37,"Rb"],[38,"Sr"],[39,"Y"],[40,"Zr"],
  [41,"Nb"],[42,"Mo"],[43,"Tc"],[44,"Ru"],[45,"Rh"],[46,"Pd"],[47,"Ag"],[48,"Cd"],[49,"In"],[50,"Sn"],
  [51,"Sb"],[52,"Te"],[53,"I"],[54,"Xe"],[55,"Cs"],[56,"Ba"],[57,"La"],[58,"Ce"],[59,"Pr"],[60,"Nd"],
  [61,"Pm"],[62,"Sm"],[63,"Eu"],[64,"Gd"],[65,"Tb"],[66,"Dy"],[67,"Ho"],[68,"Er"],[69,"Tm"],[70,"Yb"],
  [71,"Lu"],[72,"Hf"],[73,"Ta"],[74,"W"],[75,"Re"],[76,"Os"],[77,"Ir"],[78,"Pt"],[79,"Au"],[80,"Hg"],
  [81,"Tl"],[82,"Pb"],[83,"Bi"],[84,"Po"],[85,"At"],[86,"Rn"],[87,"Fr"],[88,"Ra"],[89,"Ac"],[90,"Th"],
  [91,"Pa"],[92,"U"],[93,"Np"],[94,"Pu"],[95,"Am"],[96,"Cm"],[97,"Bk"],[98,"Cf"],[99,"Es"],[100,"Fm"],
  [101,"Md"],[102,"No"],[103,"Lr"],[104,"Rf"],[105,"Db"],[106,"Sg"],[107,"Bh"],[108,"Hs"],[109,"Mt"],
  [110,"Ds"],[111,"Rg"],[112,"Cn"],[113,"Nh"],[114,"Fl"],[115,"Mc"],[116,"Lv"],[117,"Ts"],[118,"Og"],
]);

// Reverse: element symbol → atomic number
const PERIODIC_REV: Map<string, number> = new Map<string, number>();
for (const [k, v] of PERIODIC) {
  PERIODIC_REV.set(v, k);
}

// Color code map: single char → color name
function resolveColor(ch: string): string {
  switch (ch) {
    case "W": return "GRAY";
    case "w": return "WHITE";
    case "R": return "RED";
    case "r": return "LIGHT_RED";
    case "G": return "GREEN";
    case "g": return "LIGHT_GREEN";
    case "B": return "BLUE";
    case "b": return "LIGHT_BLUE";
    case "y": return "YELLOW";
    case "o": return "ORANGE";
    case "P": return "PINK";
    case "p": return "LIGHT_PINK";
    case "V": return "VIOLET";
    case "v": return "LIGHT_VIOLET";
    case "?": return "CORRUPT";
    default: return "DARK";
  }
}

// ss_n: Fibonacci-like sequence. Find t-th term starting with a,b (1-indexed iteration)
function solveSSN(a: number, b: number, t: number): number {
  for (let n = 1; n < t; n++) {
    [a, b] = [b, a + b];
  }
  return b;
}

// rs_n: Arithmetic sequence. Find t-th term starting with a, step d (0-indexed iteration)
function solveRSN(a: number, d: number, t: number): number {
  return a + d * t;
}

// ss_asc: ASCII art digit recognition
// The input lines (excluding header) form a grid of digits displayed in ASCII art.
// Each digit occupies 6 columns (5 chars wide + 1 space separator), displayed in 3 rows.
// We detect digit groups by finding columns that are all spaces.
function solveSSAsc(lines: string[]): string {
  // lines[0] is the header (lockType:...), remaining are the ASCII art rows
  const rows: string[] = lines.slice(1);
  if (rows.length === 0) return "";

  // Pad all rows to same length
  let maxLen = 0;
  for (const r of rows) {
    if (r.length > maxLen) maxLen = r.length;
  }
  const padded: string[] = rows.map((r: string) => r.padEnd(maxLen, " "));

  // Find column groups (separated by all-space columns)
  // Collect columns of each group
  const groups: string[][] = [];
  let current: string[] = [];

  for (let col = 0; col < maxLen; col++) {
    let allSpace = true;
    let colStr = "";
    for (let row = 0; row < padded.length; row++) {
      const ch = col < padded[row].length ? padded[row][col] : " ";
      colStr += ch;
      if (ch !== " ") allSpace = false;
    }

    if (allSpace) {
      if (current.length > 0) {
        groups.push(current);
        current = [];
      }
    } else {
      current.push(colStr);
    }
  }
  if (current.length > 0) groups.push(current);

  // Decode each group into a digit
  let result = "";
  for (const g of groups) {
    result += decodeAsciiDigit(g);
  }
  return result;
}

// Decode a column group (array of column strings, each string is the chars in that col across rows)
// Based on the patterns observed in the Go solution (6 rows, pattern matching on col 0 and col 1)
function decodeAsciiDigit(cols: string[]): string {
  if (cols.length === 0) return "";
  const c0 = cols[0];
  const c1 = cols.length > 1 ? cols[1] : "";

  // Patterns derived from Go solution (row strings for col 0 and col 1)
  if (c0 === " +   +" && c1 === "+++  +") return "2";
  if (c0 === "+++  +" && c1 === "+ +  +") return "5";
  if (c0 === "+     " && c1 === "+   ++") return "7";
  if (c0 === " + +  " && c1 === "+ + + ") return "8";
  if (c0 === " + +  " && c1 === "++ ++ ") return "3";
  if (c0 === " ++++ " && c1 === "+ + + ") return "6";
  if (c0 === " ++++ " && c1 === "+    +") return "0";
  if (c0 === " +    " && c1 === "+ +   ") return "9";
  if (c0 === " +    " && c1 === "++   +") return "1";
  if (c0 === "   +  " && c1 === " +++  ") return "4";
  return "?";
}

// ss_con: Find pattern ¬X. in line 1, output 1-based index where X == 'r'
function solveSSCon(line: string): number {
  // ¬ is U+00AC
  const re = /\xACw\./g;  // placeholder - actually match ¬(single char).
  // We need to find all ¬X. occurrences and find index (1-based) of first 'r'
  const matches: string[] = [];
  let i = 0;
  while (i < line.length) {
    // Look for ¬ (U+00AC)
    if (line.charCodeAt(i) === 0x00AC) {
      if (i + 2 < line.length && line[i + 2] === ".") {
        matches.push(line[i + 1]);
        i += 3;
        continue;
      }
    }
    i++;
  }
  for (let idx = 0; idx < matches.length; idx++) {
    if (matches[idx] === "r") {
      return idx + 1;
    }
  }
  return 0;
}

// ss_colv: Find first ¬X+ pattern in line 1, return color name
function solveSSColv(line: string): string {
  for (let i = 0; i < line.length - 2; i++) {
    if (line.charCodeAt(i) === 0x00AC && line[i + 2] === "+") {
      return resolveColor(line[i + 1]);
    }
  }
  return "DARK";
}

// rs_colv: Find first ¬X pattern in line 1, return color name
function solveRSColv(line: string): string {
  for (let i = 0; i < line.length - 1; i++) {
    if (line.charCodeAt(i) === 0x00AC) {
      return resolveColor(line[i + 1]);
    }
  }
  return "DARK";
}

// Main loop
while (true) {
  const numLinesStr = readline();
  if (!numLinesStr) break;
  const numLines = parseInt(numLinesStr, 10);

  const rawLock: string[] = [];
  for (let i = 0; i < numLines; i++) {
    rawLock.push(readline());
  }

  const lockType = rawLock[0].split(":")[0].toLowerCase();
  const dataLine = rawLock.length > 1 ? rawLock[1] : "";

  let answer = "";

  switch (lockType) {
    case "ss_n": {
      // Extract all numbers from dataLine
      const nums = (dataLine.match(/\d+/g) || []).map(Number);
      // a = nums[0], b = nums[1], t = nums[last]
      const a = nums[0];
      const b = nums[1];
      const t = nums[nums.length - 1];
      answer = String(solveSSN(a, b, t));
      break;
    }
    case "rs_n": {
      const nums = (dataLine.match(/\d+/g) || []).map(Number);
      const a = nums[0];
      const b = nums[1];
      const d = b - a;
      const t = nums[nums.length - 1];
      answer = String(solveRSN(a, d, t));
      break;
    }
    case "ss_f": {
      // Find first lowercase letter, output its 0-indexed position in alphabet
      const m = dataLine.match(/[a-z]/);
      if (m) {
        answer = String(m[0].charCodeAt(0) - "a".charCodeAt(0));
      }
      break;
    }
    case "rs_f": {
      // First char of dataLine, position from 'a'
      if (dataLine.length > 0) {
        answer = String(dataLine.charCodeAt(0) - "a".charCodeAt(0));
      }
      break;
    }
    case "gs_m": {
      // Last number in dataLine → periodic element symbol
      const nums2 = dataLine.match(/\d+/g) || [];
      const n = parseInt(nums2[nums2.length - 1], 10);
      answer = PERIODIC.get(n) || "";
      break;
    }
    case "ss_m": {
      // Last word in dataLine → periodic element atomic number
      const words = dataLine.match(/\w+/g) || [];
      const sym = words[words.length - 1];
      answer = String(PERIODIC_REV.get(sym) || 0);
      break;
    }
    case "ss_asc": {
      answer = solveSSAsc(rawLock);
      break;
    }
    case "ss_con": {
      answer = String(solveSSCon(dataLine));
      break;
    }
    case "ss_colv": {
      answer = solveSSColv(dataLine);
      break;
    }
    case "rs_colv": {
      answer = solveRSColv(dataLine);
      break;
    }
    default: {
      answer = "";
      break;
    }
  }

  console.log(answer);
}
