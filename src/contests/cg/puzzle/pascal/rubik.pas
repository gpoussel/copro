// 🎮 CodinGame Puzzle - rubik
// https://www.codingame.com/training/medium/rubik

{$mode objfpc}{$H+}
var
  n, inner: int64;
begin
  readln(n);
  // Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
  if n >= 2 then inner := n - 2 else inner := 0;
  writeln(n * n * n - inner * inner * inner);
end.
