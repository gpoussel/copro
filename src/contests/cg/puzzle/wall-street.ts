// 🎮 CodinGame Puzzle - wall-street
// https://www.codingame.com/training/hard/wall-street

// A small limit order book per symbol. An incoming order repeatedly matches
// the best opposite order (lowest sell / highest buy, FIFO on ties) at the
// resting order's price; any leftover is added to the book. Prices in cents.
type Order = { qty: number; price: number; seq: number }

const books = new Map<string, { BUY: Order[]; SELL: Order[] }>()
const trades: string[] = []
const n = Number(readline())
for (let seq = 0; seq < n; seq++) {
  const [symbol, verb, qtyStr, priceStr] = readline().trim().split(/\s+/)
  let qty = Number(qtyStr)
  const price = Math.round(parseFloat(priceStr) * 100)
  if (!books.has(symbol)) books.set(symbol, { BUY: [], SELL: [] })
  const book = books.get(symbol)!
  const isBuy = verb === "BUY"
  const opposite = isBuy ? book.SELL : book.BUY
  while (qty > 0) {
    let best = -1
    opposite.forEach((o, i) => {
      if (isBuy ? o.price > price : o.price < price) return
      if (best < 0) best = i
      else {
        const b = opposite[best]
        const better = isBuy ? o.price < b.price : o.price > b.price
        if (better || (o.price === b.price && o.seq < b.seq)) best = i
      }
    })
    if (best < 0) break
    const resting = opposite[best]
    const traded = Math.min(qty, resting.qty)
    trades.push(`${symbol} ${traded} ${(resting.price / 100).toFixed(2)}`)
    qty -= traded
    resting.qty -= traded
    if (resting.qty === 0) opposite.splice(best, 1)
  }
  if (qty > 0) (isBuy ? book.BUY : book.SELL).push({ qty, price, seq })
}
console.log(trades.length ? trades.join("\n") : "NO TRADE")
