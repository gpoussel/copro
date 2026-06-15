// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/training/easy/mirrors

{$mode objfpc}{$H+}
var
  n, i: integer;
  r: array of double;
  reflected, ri, denom: double;
begin
  readln(n);
  setlength(r, n);
  for i := 0 to n - 1 do read(r[i]);
  readln;
  reflected := 0.0;
  for i := n - 1 downto 0 do
  begin
    ri := r[i];
    denom := 1 - ri * reflected;
    if denom = 0 then reflected := ri
    else reflected := ri + ((1 - ri) * (1 - ri) * reflected) / denom;
  end;
  writeln(reflected:0:4);
end.
