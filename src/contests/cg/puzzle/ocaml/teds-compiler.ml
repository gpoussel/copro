(* 🎮 CodinGame Puzzle - teds-compiler *)
(* https://www.codingame.com/training/easy/teds-compiler *)

let () =
  let line = String.trim (read_line ()) in
  let balance = ref 0 and best = ref 0 in
  (try
     for i = 0 to String.length line - 1 do
       if line.[i] = '<' then incr balance else decr balance;
       if !balance < 0 then raise Exit;
       if !balance = 0 then best := i + 1
     done
   with Exit -> ());
  Printf.printf "%d\n" !best
