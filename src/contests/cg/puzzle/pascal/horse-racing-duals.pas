// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

{$mode objfpc}{$H+}
var
  n, i: integer;
  s: array of longint;
  minDiff, diff: int64;

procedure qsort(var a: array of longint; lo, hi: integer);
var
  i, j, pivot, tmp: longint;
begin
  i := lo;
  j := hi;
  pivot := a[(lo + hi) div 2];
  repeat
    while a[i] < pivot do inc(i);
    while a[j] > pivot do dec(j);
    if i <= j then
    begin
      tmp := a[i]; a[i] := a[j]; a[j] := tmp;
      inc(i); dec(j);
    end;
  until i > j;
  if lo < j then qsort(a, lo, j);
  if i < hi then qsort(a, i, hi);
end;

begin
  readln(n);
  setlength(s, n);
  for i := 0 to n - 1 do readln(s[i]);
  qsort(s, 0, n - 1);
  minDiff := high(int64);
  for i := 1 to n - 1 do
  begin
    diff := s[i] - s[i - 1];
    if diff < minDiff then minDiff := diff;
  end;
  writeln(minDiff);
end.
