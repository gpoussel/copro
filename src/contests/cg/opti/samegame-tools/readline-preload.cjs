// Defines a synchronous global readline() over stdin (CodinGame-style) for local runs.
const fs = require("fs");
let buf = "";
const chunk = Buffer.alloc(65536);
globalThis.readline = () => {
  for (;;) {
    const nl = buf.indexOf("\n");
    if (nl >= 0) {
      const line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      return line;
    }
    let n = 0;
    try {
      n = fs.readSync(0, chunk, 0, chunk.length, null);
    } catch (e) {
      if (e.code === "EAGAIN") continue;
      throw e;
    }
    if (n === 0) process.exit(0);
    buf += chunk.toString("utf8", 0, n);
  }
};
