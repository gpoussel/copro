(* 🎮 CodinGame Puzzle - rubik *)
(* https://www.codingame.com/training/medium/rubik *)

let () =
  let n = int_of_string (String.trim (read_line ())) in
  (* Visible mini-cubes = all cubes minus the hidden inner cube of side n-2. *)
  let inner = if n >= 2 then n - 2 else 0 in
  Printf.printf "%d\n" (n * n * n - inner * inner * inner)
