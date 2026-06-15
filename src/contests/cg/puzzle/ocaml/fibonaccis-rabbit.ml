(* 🎮 CodinGame Puzzle - fibonaccis-rabbit *)
(* https://www.codingame.com/training/easy/fibonaccis-rabbit *)

(* FN can exceed 2^63 (but is < 2^64); OCaml's native int is only 63-bit, so use
   Int64 (wraps mod 2^64) and print the unsigned interpretation with %Lu. *)
let () =
  let l1 = String.split_on_char ' ' (String.trim (read_line ())) in
  let f0 = int_of_string (List.nth l1 0) in
  let n = int_of_string (List.nth l1 1) in
  let l2 = String.split_on_char ' ' (String.trim (read_line ())) in
  let a = int_of_string (List.nth l2 0) in
  let b = int_of_string (List.nth l2 1) in
  let f = Array.make (n + 1) 0L in
  f.(0) <- Int64.of_int f0;
  for i = 1 to n do
    let total = ref 0L in
    for k = a to b do
      if i - k >= 0 then total := Int64.add !total f.(i - k)
    done;
    f.(i) <- !total
  done;
  Printf.printf "%Lu\n" f.(n)
