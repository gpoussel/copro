(* 🎮 CodinGame Puzzle - euclids-algorithm *)
(* https://www.codingame.com/training/easy/euclids-algorithm *)

let () =
  let parts = String.split_on_char ' ' (String.trim (read_line ())) in
  let a = int_of_string (List.nth parts 0) in
  let b = int_of_string (List.nth parts 1) in
  let x = ref a and y = ref b in
  while !y <> 0 do
    let q = !x / !y and r = !x mod !y in
    Printf.printf "%d=%d*%d+%d\n" !x !y q r;
    x := !y;
    y := r
  done;
  Printf.printf "GCD(%d,%d)=%d\n" a b !x
