import { createHash, createHmac } from "crypto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(input: string): Buffer {
  const cleaned = input.replace(/=+$/, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];

  for (const char of cleaned) {
    const idx = BASE32.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(out);
}

function getTotpSecretBytes(): Buffer | null {
  const pwd = process.env.ADMIN_PASSWORD?.trim();
  if (!pwd) return null;
  return createHash("sha256").update(`coleccion-cards:totp:v1:${pwd}`).digest().subarray(0, 20);
}

export function getTotpSecretBase32(): string | null {
  const bytes = getTotpSecretBytes();
  return bytes ? base32Encode(bytes) : null;
}

export function getOtpAuthUri(): string | null {
  const secret = getTotpSecretBase32();
  if (!secret) return null;
  const label = encodeURIComponent("Vestuario");
  const issuer = encodeURIComponent("Mi Colección");
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac("sha1", secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(code % 1_000_000).padStart(6, "0");
}

export function verifyTotpCode(code: string): boolean {
  const secret = getTotpSecretBytes();
  if (!secret || !/^\d{6}$/.test(code)) return false;

  const step = Math.floor(Date.now() / 1000 / 30);
  for (const offset of [-1, 0, 1]) {
    if (hotp(secret, step + offset) === code) return true;
  }
  return false;
}
