// 🎮 CodinGame Puzzle - the-descent
// https://www.codingame.com/training/easy/the-descent

{$mode objfpc}{$H+}
var
  maxHeight, maxIndex, h, i: integer;
begin
  // Game loop: each turn, read 8 mountain heights and fire on the tallest one.
  while true do
  begin
    maxHeight := -1;
    maxIndex := 0;
    for i := 0 to 7 do
    begin
      readln(h);
      if h > maxHeight then
      begin
        maxHeight := h;
        maxIndex := i;
      end;
    end;
    writeln(maxIndex);
    flush(output);
  end;
end.
