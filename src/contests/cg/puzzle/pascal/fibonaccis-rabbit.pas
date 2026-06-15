// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

{$mode objfpc}{$H+}
var
  f0, n, a, b, i, k: integer;
  f: array of qword;
  total: qword;
begin
  readln(f0, n);
  readln(a, b);
  // FN can exceed 2^63 (but is < 2^64), so accumulate in QWord (unsigned 64-bit).
  setlength(f, n + 1);
  for i := 0 to n do f[i] := 0;
  f[0] := qword(f0);
  for i := 1 to n do
  begin
    total := 0;
    for k := a to b do
      if i - k >= 0 then total := total + f[i - k];
    f[i] := total;
  end;
  writeln(f[n]);
end.
