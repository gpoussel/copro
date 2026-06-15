(* 🎮 CodinGame Puzzle - the-river-i- *)
(* https://www.codingame.com/training/easy/the-river-i- *)

let digit_sum x =
  let x = ref x and s = ref 0 in
  while !x > 0 do
    s := !s + !x mod 10;
    x := !x / 10
  done;
  !s

let () =
  let a = ref (int_of_string (String.trim (read_line ()))) in
  let b = ref (int_of_string (String.trim (read_line ()))) in
  while !a <> !b do
    if !a < !b then a := !a + digit_sum !a
    else b := !b + digit_sum !b
  done;
  Printf.printf "%d\n" !a
