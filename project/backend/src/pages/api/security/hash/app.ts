import crypto from 'crypto'

/**
 * Hashes a password using the provided salt.
 * @param {string} password - The password to be hashed.
 * @param {Buffer} salt - The salt to be used for hashing.
 * @returns {Promise<Buffer>} A promise that resolves to the hashed password.
 */
export function hashPassword(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise(function(resolve, reject) {
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err: Error | null, derivedKey: Buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(derivedKey);
      }
    });
  });
 }