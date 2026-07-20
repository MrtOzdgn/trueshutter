// Sony enciphers several MakerNote blocks (including tag 0x9050, which holds the shutter
// count) with a simple per-byte substitution cipher. The forward transform is publicly
// documented as c = (b * b * b) % 249 for byte values 0-248; values 249-255 fall outside
// the 0-248 residue range and are passed through unchanged.
//
// That formula is a bijection over 0..248 (verified computationally: 249 inputs produce 249
// distinct outputs, no collisions), so the decipher table is exactly its inverse — derived
// here from the formula itself, not copied from any tool's precomputed table.

let decipherTable: Uint8Array | null = null;

function getDecipherTable(): Uint8Array {
  if (decipherTable) return decipherTable;
  const table = new Uint8Array(249);
  for (let b = 0; b <= 248; b++) {
    const c = (b * b * b) % 249;
    table[c] = b;
  }
  decipherTable = table;
  return table;
}

export function sonyDecipher(bytes: Uint8Array): Uint8Array {
  const table = getDecipherTable();
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    out[i] = b <= 248 ? table[b] : b;
  }
  return out;
}
