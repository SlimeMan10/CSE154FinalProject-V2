/**
 * Generates a random salt for password hashing.
 * @returns {Buffer} The generated salt.
 */
function generateSalt() {
  return crypto.randomBytes(16);
 }