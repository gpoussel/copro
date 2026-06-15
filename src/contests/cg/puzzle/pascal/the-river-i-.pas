// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

{$mode objfpc}{$H+}
var
  a, b: int64;

function digitSum(x: int64): int64;
var
  s: int64;
begin
  s := 0;
  while x > 0 do
  begin
    s := s + x mod 10;
    x := x div 10;
  end;
  digitSum := s;
end;

begin
  readln(a);
  readln(b);
  while a <> b do
    if a < b then a := a + digitSum(a) else b := b + digitSum(b);
  writeln(a);
end.
