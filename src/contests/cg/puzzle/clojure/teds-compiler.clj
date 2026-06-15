;; 🎮 CodinGame Puzzle - teds-compiler
;; https://www.codingame.com/training/easy/teds-compiler

(ns Solution (:gen-class))

(defn -main [& _]
  (let [line (.trim (read-line))
        len (count line)]
    (loop [i 0 balance 0 best 0]
      (if (< i len)
        (let [nb (if (= (.charAt line i) \<) (inc balance) (dec balance))]
          (cond
            (< nb 0) (println best)
            (= nb 0) (recur (inc i) nb (inc i))
            :else (recur (inc i) nb best)))
        (println best))))
  (flush))
