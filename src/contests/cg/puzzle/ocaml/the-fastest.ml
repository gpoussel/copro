(* 🎮 CodinGame Puzzle - the-fastest *)
(* https://www.codingame.com/training/medium/the-fastest *)

(* Times are HH:MM:SS so lexicographic comparison equals chronological comparison. *)
let () =
  let n = int_of_string (String.trim (read_line ())) in
  let best = ref "" in
  for _ = 1 to n do
    let t = String.trim (read_line ()) in
    if !best = "" || t < !best then best := t
  done;
  print_string !best;
  print_newline ()
