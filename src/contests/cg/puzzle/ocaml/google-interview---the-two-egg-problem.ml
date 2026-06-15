(* 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem *)
(* https://www.codingame.com/training/hard/google-interview---the-two-egg-problem *)

let () =
  let n = int_of_string (String.trim (read_line ())) in
  let k = ref 0 in
  while !k * (!k + 1) / 2 < n do incr k done;
  Printf.printf "%d\n" !k
