// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

{$mode objfpc}{$H+}
type
  PNode = ^TNode;
  TNode = record
    ch: array['0'..'9'] of PNode;
  end;
var
  n, i, j: integer;
  cable: int64;
  number: string;
  root, node: PNode;
  d: char;

function newNode: PNode;
var
  nd: PNode;
  c: char;
begin
  new(nd);
  for c := '0' to '9' do nd^.ch[c] := nil;
  newNode := nd;
end;

begin
  readln(n);
  root := newNode;
  cable := 0;
  for i := 1 to n do
  begin
    readln(number);
    node := root;
    for j := 1 to length(number) do
    begin
      d := number[j];
      if node^.ch[d] = nil then
      begin
        node^.ch[d] := newNode;
        inc(cable);
      end;
      node := node^.ch[d];
    end;
  end;
  writeln(cable);
end.
