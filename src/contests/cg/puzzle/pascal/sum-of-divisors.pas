// 🎮 CodinGame Puzzle - sum-of-divisors
// https://www.codingame.com/training/medium/sum-of-divisors

{$mode objfpc}{$H+}
var
  n, total, d: int64;
begin
  // d appears as a divisor in floor(n/d) of the numbers 1..n, so the total
  // sum of divisors is sum over d of d * floor(n/d).
  readln(n);
  total := 0;
  d := 1;
  while d <= n do
  begin
    total := total + d * (n div d);
    d := d + 1;
  end;
  writeln(total);
end.
