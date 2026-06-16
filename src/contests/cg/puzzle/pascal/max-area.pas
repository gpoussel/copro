// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/training/easy/max-area

{$mode objfpc}{$H+}
var
  n, i, left, right: integer;
  a: array of int64;
  best, h, area: int64;
begin
  readln(n);
  setlength(a, n);
  for i := 0 to n - 1 do read(a[i]);
  readln;
  left := 0;
  right := n - 1;
  best := 0;
  while left < right do
  begin
    if a[left] < a[right] then h := a[left] else h := a[right];
    area := h * (right - left);
    if area > best then best := area;
    if a[left] < a[right] then inc(left) else dec(right);
  end;
  writeln(best);
end.
