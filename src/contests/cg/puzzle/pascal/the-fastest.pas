// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

{$mode objfpc}{$H+}
var
  n, i: integer;
  best, t: string;
begin
  // Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
  readln(n);
  best := '';
  for i := 1 to n do
  begin
    readln(t);
    if (best = '') or (t < best) then best := t;
  end;
  writeln(best);
end.
