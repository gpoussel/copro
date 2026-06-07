// @ts-nocheck
// 🎮 CodinGame Puzzle - master-of-mayhem
// https://www.codingame.com/training/easy/master-of-mayhem

function parseReport(report: string): { name: string; attribute: string; value: string } {
  // Format: Name's attribute is a/an "string" or Name's attribute is a/an string
  const apostropheIdx = report.indexOf("'s ");
  const name = report.substring(0, apostropheIdx);
  const rest = report.substring(apostropheIdx + 3); // after "'s "
  // rest is like: "hat is a FEDORA" or "catchphrase is \"I am HUNTING\""
  const isIdx = rest.indexOf(" is ");
  const attribute = rest.substring(0, isIdx);
  let valueStr = rest.substring(isIdx + 4); // after " is "
  // Remove leading "a " or "an "
  if (valueStr.startsWith('"')) {
    // quoted: remove surrounding quotes
    valueStr = valueStr.substring(1, valueStr.length - 1);
  } else if (valueStr.startsWith("a ")) {
    valueStr = valueStr.substring(2);
  } else if (valueStr.startsWith("an ")) {
    valueStr = valueStr.substring(3);
  }
  return { name, attribute, value: valueStr };
}

const cyborgCount = parseInt(readline());
const cyborgs: string[] = [];
for (let i = 0; i < cyborgCount; i++) {
  cyborgs.push(readline());
}

const mayhemReportCount = parseInt(readline());
// Mayhem's known attributes
const mayhemAttrs: Record<string, string> = {};
// word is special: it's a single word from a catchphrase
let mayhemWord: string | null = null;

for (let i = 0; i < mayhemReportCount; i++) {
  const report = readline();
  const parsed = parseReport(report);
  if (parsed.attribute === "word") {
    mayhemWord = parsed.value;
  } else {
    mayhemAttrs[parsed.attribute] = parsed.value;
  }
}

const cyborgReportCount = parseInt(readline());
// Cyborg known attributes: name -> attribute -> value
const cyborgAttrs: Record<string, Record<string, string>> = {};
for (const name of cyborgs) {
  cyborgAttrs[name] = {};
}

for (let i = 0; i < cyborgReportCount; i++) {
  const report = readline();
  const parsed = parseReport(report);
  if (cyborgs.includes(parsed.name)) {
    cyborgAttrs[parsed.name][parsed.attribute] = parsed.value;
  }
}

// Determine which cyborgs could be Mayhem
const candidates = cyborgs.filter((name) => {
  const attrs = cyborgAttrs[name];

  // Check each known attribute of Mayhem
  for (const [attr, mayhemVal] of Object.entries(mayhemAttrs)) {
    if (attrs[attr] !== undefined) {
      // Cyborg has this attribute - must match
      if (attrs[attr] !== mayhemVal) {
        return false; // eliminated
      }
    }
    // If cyborg doesn't have this attribute reported, we can't eliminate
  }

  // Check word: Mayhem's word must appear in cyborg's catchphrase (if known)
  if (mayhemWord !== null) {
    if (attrs["catchphrase"] !== undefined) {
      // Check if the word appears in the catchphrase
      const phrase = attrs["catchphrase"];
      // Word must appear as a token in the phrase
      const words = phrase.split(" ");
      if (!words.includes(mayhemWord)) {
        return false; // word not in catchphrase
      }
    }
    // If no catchphrase known, can't eliminate
  }

  return true;
});

if (candidates.length === 1) {
  console.log(candidates[0]);
} else if (candidates.length === 0) {
  console.log("MISSING");
} else {
  console.log("INDETERMINATE");
}
