// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

{$mode objfpc}{$H+}
var
  a, b, x, y, q, r: int64;
begin
  readln(a, b);
  x := a;
  y := b;
  while y <> 0 do
  begin
    q := x div y;
    r := x mod y;
    writeln(x, '=', y, '*', q, '+', r);
    x := y;
    y := r;
  end;
  writeln('GCD(', a, ',', b, ')=', x);
end.
