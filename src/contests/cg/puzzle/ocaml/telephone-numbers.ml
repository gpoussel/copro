(* 🎮 CodinGame Puzzle - telephone-numbers *)
(* https://www.codingame.com/training/medium/telephone-numbers *)

type node = { tbl : (char, node) Hashtbl.t }

let () =
  let n = int_of_string (String.trim (read_line ())) in
  let cable = ref 0 in
  let root = { tbl = Hashtbl.create 16 } in
  for _ = 1 to n do
    let number = String.trim (read_line ()) in
    let node = ref root in
    String.iter
      (fun d ->
        if not (Hashtbl.mem (!node).tbl d) then begin
          Hashtbl.add (!node).tbl d { tbl = Hashtbl.create 16 };
          incr cable
        end;
        node := Hashtbl.find (!node).tbl d)
      number
  done;
  Printf.printf "%d\n" !cable
