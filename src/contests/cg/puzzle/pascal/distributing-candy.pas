// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

{$mode objfpc}{$H+}
var
  n, m, i: integer;
  candies: array of longint;
  best, diff: int64;

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
  readln(n, m);
  setlength(candies, n);
  for i := 0 to n - 1 do read(candies[i]);
  readln;
  qsort(candies, 0, n - 1);
  best := high(int64);
  for i := 0 to n - m do
  begin
    diff := candies[i + m - 1] - candies[i];
    if diff < best then best := diff;
  end;
  writeln(best);
end.
