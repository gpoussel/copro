// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

{$mode objfpc}{$H+}
var
  line: string;
  balance, best, i: integer;
begin
  readln(line);
  balance := 0;
  best := 0;
  for i := 1 to length(line) do
  begin
    if line[i] = '<' then balance := balance + 1 else balance := balance - 1;
    if balance < 0 then break;
    if balance = 0 then best := i;
  end;
  writeln(best);
end.
