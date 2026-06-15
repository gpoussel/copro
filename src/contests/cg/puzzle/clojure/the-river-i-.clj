;; 🎮 CodinGame Puzzle - the-river-i-
;; https://www.codingame.com/training/easy/the-river-i-

(ns Solution (:gen-class))

(defn digit-sum [x]
  (loop [x x s 0]
    (if (> x 0) (recur (quot x 10) (+ s (rem x 10))) s)))

(defn -main [& _]
  (let [a (Long/parseLong (.trim (read-line)))
        b (Long/parseLong (.trim (read-line)))]
    (loop [a a b b]
      (cond
        (= a b) (println a)
        (< a b) (recur (+ a (digit-sum a)) b)
        :else (recur a (+ b (digit-sum b))))))
  (flush))
