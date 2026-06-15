// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

{$mode objfpc}{$H+}
var
  n, i, drops, j: integer;
  strip: string;
begin
  readln(n);
  for i := 1 to n do
  begin
    readln(strip);
    drops := 0;
    j := 1;
    while j <= length(strip) do
    begin
      if strip[j] = 'f' then
      begin
        // Drop at j covers j, j+1, j+2 — skip past all 3.
        inc(drops);
        j := j + 3;
      end
      else
        inc(j);
    end;
    writeln(drops);
  end;
end.
