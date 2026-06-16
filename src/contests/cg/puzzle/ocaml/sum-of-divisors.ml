(* 🎮 CodinGame Puzzle - sum-of-divisors *)
(* https://www.codingame.com/training/medium/sum-of-divisors *)

(* d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
   of divisors is sum over d of d * floor(n/d). *)
let () =
  let n = int_of_string (String.trim (read_line ())) in
  let total = ref 0 in
  for d = 1 to n do total := !total + d * (n / d) done;
  Printf.printf "%d\n" !total
