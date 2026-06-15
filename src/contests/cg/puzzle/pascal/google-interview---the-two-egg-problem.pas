// 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
// https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

{$mode objfpc}{$H+}
var
  n, k: int64;
begin
  readln(n);
  k := 0;
  while k * (k + 1) div 2 < n do
    k := k + 1;
  writeln(k);
end.
