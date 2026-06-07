// @ts-nocheck
// 🎮 CodinGame Puzzle - murder-in-the-village
// https://www.codingame.com/training/easy/murder-in-the-village

const N = parseInt(readline());

// Parse each statement
const statements = [];
for (let i = 0; i < N; i++) {
  const line = readline();
  // Format: "Name: I was in the Location with Name0 and Name1 ... and NameY."
  // OR:     "Name: I was in the Location, alone."
  const colonIdx = line.indexOf(':');
  const name = line.substring(0, colonIdx);

  const rest = line.substring(colonIdx + 2); // skip ": "
  // "I was in the Location with ..."
  // "I was in the Location, alone."

  const inTheIdx = rest.indexOf('in the ');
  const afterLocation = rest.substring(inTheIdx + 7); // after "in the "

  let location, companions;
  if (afterLocation.includes(', alone.')) {
    // alone case
    location = afterLocation.substring(0, afterLocation.indexOf(', alone.'));
    companions = [];
  } else {
    // "Location with Name0 and Name1..."
    const withIdx = afterLocation.indexOf(' with ');
    location = afterLocation.substring(0, withIdx);
    const companionsPart = afterLocation.substring(withIdx + 6); // skip " with "
    // Remove trailing period
    const companionsStr = companionsPart.replace(/\.$/, '');
    companions = companionsStr.split(' and ');
  }

  statements.push({ name, location, companions, alone: companions.length === 0 });
}

// Build a map for quick lookup
const byName = {};
for (const s of statements) {
  byName[s.name] = s;
}

// Try each person as the potential killer
// The killer is whoever is lying; everyone else tells the truth.
// If the killer is person K, then:
//   1. All non-K persons tell the truth.
//   2. Non-K persons were NOT at the same location as K (villagers haven't seen the killer).
//   3. For each non-K person, their stated companions must all be non-K persons who:
//      - Were at the same location
//      - Named them back (mutual alibi)
//      - The group is self-consistent (exactly the same set of people)

function isConsistentWithoutKiller(killerName) {
  const villagers = statements.filter(s => s.name !== killerName);

  // Group villagers by location
  const locationGroups = {};
  for (const v of villagers) {
    if (!locationGroups[v.location]) locationGroups[v.location] = [];
    locationGroups[v.location].push(v.name);
  }

  for (const v of villagers) {
    // Check: all stated companions are villagers (not the killer)
    for (const comp of v.companions) {
      if (comp === killerName) return false; // Villager says they saw the killer - contradiction
    }

    // Check: companions must also be in the same location group
    const groupAtLocation = locationGroups[v.location] || [];
    // The group at v's location (excluding v themselves)
    const othersAtLocation = groupAtLocation.filter(n => n !== v.name);

    if (v.alone) {
      // v claims to be alone; no one else should be at the same location
      if (othersAtLocation.length !== 0) return false;
    } else {
      // v listed companions; check they match exactly who else is at that location
      const statedCompSet = new Set(v.companions);
      const actualOthersSet = new Set(othersAtLocation);

      if (statedCompSet.size !== actualOthersSet.size) return false;
      for (const c of statedCompSet) {
        if (!actualOthersSet.has(c)) return false;
      }

      // Also check each companion listed v back
      for (const comp of v.companions) {
        const compStatement = byName[comp];
        if (!compStatement) return false;
        if (compStatement.location !== v.location) return false;
        if (compStatement.alone) return false;
        if (!compStatement.companions.includes(v.name)) return false;
      }
    }
  }

  return true;
}

// Try each person as killer
let killer = null;
for (const s of statements) {
  if (isConsistentWithoutKiller(s.name)) {
    killer = s.name;
    break;
  }
}

// If no single person as killer works, it was the detective (the player)
if (killer === null) {
  console.log('It was me!');
} else {
  console.log(`${killer} did it!`);
}
