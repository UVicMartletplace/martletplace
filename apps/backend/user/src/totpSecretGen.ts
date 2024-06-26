import { encode } from "hi-base32";
import crypto from "crypto";

const totpSecretGen = async () => {
  // Generate secret key for user
  const secret_key = generateBase32Secret();

  // Return secret key
  return secret_key;
};

const generateBase32Secret = () => {
  const buffer = crypto.randomBytes(15);
  const base32secret = encode(buffer).toString().replace(/=/g, "");
  return base32secret.substring(0, 24);
};

export { totpSecretGen };
